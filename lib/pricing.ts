import type { Price } from "@/types";
import { lengthOptions, materialOptions, startQuantityOptions, techniqueOptions, temporaryBaseOptions } from "@/data/configurator";
import { findZoneByLocality } from "@/data/locations";
import {
  flatStartPrices,
  naturalLockPrices,
  startPriceGrid,
  startQuantityTiers,
  syntheticLockPrice,
  type StartTierId,
} from "@/data/prices";
import { effectiveDraft, needsLocality } from "./configurator";
import { formatFcfa } from "./format";
import type { ProjectDraft } from "./project-store";

/**
 * CALCUL DE L'ESTIMATION.
 *
 * Principes :
 * - seuls les montants connus sont additionnés ;
 * - un montant inconnu donne une ligne « Sur devis » / « À confirmer », jamais un chiffre inventé ;
 * - main-d'œuvre (départ de locks ET pose temporaire) : grille par technique et par tranche de vingt locks ;
 * - extensions d'une pose = prix à la mèche × nombre de locks (règle confirmée par LP LOCKS
 *   le 12/11/2026). Le nombre de locks étant une tranche, le montant est une fourchette ;
 * - l'acompte n'est jamais ajouté.
 */

export interface EstimateLine {
  id: string;
  label: string;
  /** Précision affichée sous le libellé. */
  detail?: string;
  /** Prix unitaire en FCFA, si applicable. */
  unitPrice?: number;
  quantity?: number;
  /** Montant en FCFA ; null = non chiffrable pour l'instant. */
  amount: number | null;
  /** Borne haute lorsque le montant est une fourchette (amount = borne basse). */
  amountMax?: number;
  /** true = montant minimal (« À partir de »). */
  from?: boolean;
  /** Texte affiché à la place du montant quand il est null. */
  pendingText?: string;
  /** false = tarif communiqué mais pas encore validé par LP LOCKS. */
  confirmed: boolean;
}

export interface Estimate {
  lines: EstimateLine[];
  travel: EstimateLine | null;
  /** Somme des montants connus (prestations + déplacement) — borne basse. */
  knownTotal: number;
  /** Borne haute du total (égale à knownTotal s'il n'y a pas de fourchette). */
  knownTotalMax: number;
  /** true si au moins une ligne n'est pas chiffrée. */
  hasPending: boolean;
  hasFrom: boolean;
  /** true si tous les montants utilisés sont validés par LP LOCKS. */
  allConfirmed: boolean;
  /** Libellé du total, prêt à afficher. */
  totalLabel: string;
  /** Mention sous le total. */
  totalNote: string;
}

const lengthLabel = (id: string | null) => lengthOptions.find((o) => o.id === id)?.description ?? null;
const materialLabel = (id: string | null) => materialOptions.find((o) => o.id === id)?.label ?? null;

/** Prix d'une mèche selon la matière et la longueur ; null si inconnu. */
export function strandPrice(material: string | null, length: string | null): Price | null {
  // De 24 à 30 pouces, toutes les matières sont sur devis.
  if (length === "24-30") return null;
  if (material === "naturelle" && length) return naturalLockPrices.find((p) => p.id === `naturelle-${length}`) ?? null;
  if (material === "synthetique") return syntheticLockPrice;
  return null;
}

/** Indication de prix affichée sur une carte de matière. */
export function materialPriceHint(material: string, length: string | null): string {
  if (length === "24-30") return "Sur devis pour cette longueur";
  if (material === "synthetique") return `À partir de ${formatFcfa(syntheticLockPrice.amount ?? 0)} la mèche`;
  if (material === "naturelle") {
    const price = strandPrice(material, length);
    if (price?.amount != null) return `${formatFcfa(price.amount)} la mèche en ${lengthLabel(length)}`;
    return "De 400 à 1 300 FCFA la mèche selon la longueur";
  }
  return "Tarif sur devis";
}

/** Prix d'un départ de locks selon la technique et la tranche de quantité. */
export function startPrice(technique: string | null, quantity: string | null): EstimateLine | null {
  if (!technique) return null;
  const name = techniqueOptions.find((t) => t.id === technique)?.label ?? technique;
  const quantityLabel = startQuantityOptions.find((q) => q.id === quantity)?.label;
  const base = { id: "depart", label: `Départ de locks — ${name}`, detail: quantityLabel };

  // Twists et peigne : tarif unique, quel que soit le nombre de locks.
  const flat = flatStartPrices.find((p) => p.id === technique);
  if (flat?.amount != null) return { ...base, amount: flat.amount, confirmed: flat.status === "valide" };

  if (quantity === "autre") {
    return { ...base, amount: null, pendingText: "Sur devis", confirmed: true };
  }
  const grid = startPriceGrid[technique];
  if (grid) {
    if (!quantity) {
      return { ...base, amount: grid["60-80"], from: true, detail: "Nombre de locks à choisir", confirmed: true };
    }
    return { ...base, amount: grid[quantity as StartTierId] ?? null, pendingText: "Sur devis", confirmed: true };
  }
  return { ...base, amount: null, pendingText: "Sur devis", confirmed: true };
}

/** Ligne « extensions » d'une pose : prix à la mèche × nombre de locks (fourchette selon la tranche). */
function extensionsLine(material: string | null, length: string | null, quantity: string | null): EstimateLine | null {
  if (!material) return null;
  const price = strandPrice(material, length);
  const what = [materialLabel(material)?.toLowerCase(), lengthLabel(length)].filter(Boolean).join(", ");
  const base = { id: "extensions", label: `Extensions — ${what}` };

  if (price?.amount == null) {
    return { ...base, amount: null, pendingText: "Sur devis", detail: "Tarif sur devis", confirmed: true };
  }
  const unit = `${price.from ? "À partir de " : ""}${formatFcfa(price.amount)} la mèche`;
  const confirmed = price.status === "valide";
  if (quantity === "autre") {
    return { ...base, unitPrice: price.amount, amount: null, pendingText: "Sur devis", detail: `${unit} · plus de 120 locks`, confirmed };
  }
  const tier = startQuantityTiers.find((t) => t.id === quantity);
  if (!tier) {
    return { ...base, unitPrice: price.amount, amount: null, pendingText: "Nombre de locks à choisir", detail: unit, confirmed };
  }
  return {
    ...base,
    unitPrice: price.amount,
    amount: price.amount * tier.min,
    amountMax: price.amount * tier.max,
    from: price.from,
    detail: `${unit} × ${tier.min} à ${tier.max} locks`,
    confirmed,
  };
}

function travelLine(locality: string | null): EstimateLine {
  const base = { id: "deplacement", label: "Frais de déplacement" };
  if (!locality) return { ...base, amount: null, pendingText: "Localité à choisir", confirmed: true };
  const zone = findZoneByLocality(locality);
  if (!zone || zone.fee === null) {
    return { ...base, detail: zone ? `${locality} · ${zone.name}` : locality, amount: null, pendingText: "Frais sur devis", confirmed: true };
  }
  return { ...base, detail: `${locality} · ${zone.name}`, amount: zone.fee, confirmed: zone.status === "valide" };
}

export function computeEstimate(rawDraft: ProjectDraft): Estimate {
  const draft = effectiveDraft(rawDraft);
  const lines: EstimateLine[] = [];

  if (draft.projectType === "depart") {
    const start = startPrice(draft.technique, draft.startQuantity);
    if (start) lines.push(start);
    if (draft.extensions === "avec") {
      const ext = extensionsLine(draft.material, draft.length, draft.startQuantity);
      if (ext) lines.push(ext);
    }
  }

  if (draft.projectType === "temporaire") {
    // Main-d'œuvre : même grille que le départ de locks, selon la base et la tranche de vingt locks.
    const base = temporaryBaseOptions.find((b) => b.id === draft.technique);
    const grid = base ? startPriceGrid[base.id] : undefined;
    const tier = startQuantityTiers.find((t) => t.id === draft.startQuantity);
    const pose = { id: "pose", label: `Pose de locks temporaires${base ? ` — ${base.label}` : ""}`, confirmed: true };
    if (!grid) lines.push({ ...pose, amount: null, pendingText: "Base à choisir" });
    else if (draft.startQuantity === "autre") lines.push({ ...pose, detail: "Plus de 120 locks", amount: null, pendingText: "Sur devis" });
    else if (!tier) lines.push({ ...pose, detail: "Nombre de locks à choisir", amount: grid["60-80"], from: true });
    else lines.push({ ...pose, detail: tier.label, amount: grid[tier.id] });
    const ext = extensionsLine(draft.material, draft.length, draft.startQuantity);
    if (ext) lines.push(ext);
  }

  if (draft.projectType === "achat" && draft.material) {
    const price = strandPrice(draft.material, draft.length);
    const what = [materialLabel(draft.material)?.toLowerCase(), lengthLabel(draft.length)].filter(Boolean).join(", ");
    const quantity = draft.strandQuantity;
    lines.push(
      price?.amount != null
        ? {
            id: "meches",
            label: `Locks — ${what}`,
            unitPrice: price.amount,
            quantity,
            amount: price.amount * quantity,
            from: price.from,
            detail: price.from ? "Le prix exact dépend du produit" : undefined,
            confirmed: price.status === "valide",
          }
        : { id: "meches", label: `Locks — ${what}`, quantity, amount: null, pendingText: "Sur devis", confirmed: true },
    );
  }

  const travel = needsLocality(draft) ? travelLine(draft.locality) : null;
  const all = travel ? [...lines, travel] : lines;
  const known = all.filter((l) => l.amount !== null);
  const knownTotal = known.reduce((sum, l) => sum + (l.amount ?? 0), 0);
  const knownTotalMax = known.reduce((sum, l) => sum + (l.amountMax ?? l.amount ?? 0), 0);
  const hasPending = all.some((l) => l.amount === null);
  const hasFrom = known.some((l) => l.from);
  const allConfirmed = known.every((l) => l.confirmed);

  let totalLabel: string;
  if (all.length === 0) totalLabel = "À calculer";
  else if (known.length === 0) totalLabel = "Sur devis";
  else if (hasFrom || hasPending) totalLabel = `À partir de ${formatFcfa(knownTotal)}`;
  else totalLabel = formatRange(knownTotal, knownTotalMax);

  let totalNote = "Estimation indicative, sous réserve de confirmation par LP LOCKS.";
  if (all.length > 0 && known.length === 0) totalNote = "Estimation à confirmer : LP LOCKS établit un devis pour ce projet.";
  else if (hasPending) totalNote = "Estimation à confirmer : certains éléments ne sont pas encore chiffrés et s'ajouteront à ce montant.";
  else if (!allConfirmed) totalNote = "Estimation à confirmer : certains tarifs restent à valider par LP LOCKS.";

  return { lines, travel, knownTotal, knownTotalMax, hasPending, hasFrom, allConfirmed, totalLabel, totalNote };
}

/** « 47 000 FCFA » ou « De 137 200 à 160 000 FCFA » si le montant est une fourchette. */
function formatRange(min: number, max: number): string {
  if (max <= min) return formatFcfa(min);
  return `De ${new Intl.NumberFormat("fr-FR").format(min)} à ${formatFcfa(max)}`;
}

/** Montant d'une ligne, prêt à afficher. */
export function lineAmountLabel(line: EstimateLine): string {
  if (line.amount === null) return line.pendingText ?? "À confirmer";
  if (line.from) return `À partir de ${formatFcfa(line.amount)}`;
  return formatRange(line.amount, line.amountMax ?? line.amount);
}
