"use client";

import { Pencil } from "lucide-react";
import { getInspiration } from "@/data/inspirations";
import { findZoneByLocality, travelZones } from "@/data/locations";
import { needsLocality, summaryRows, type FieldId } from "@/lib/configurator";
import { formatFcfa } from "@/lib/format";
import type { Estimate } from "@/lib/pricing";
import type { ProjectDraft } from "@/lib/project-store";
import { SelectField } from "@/components/ui/field";
import { EstimateTable } from "./estimate-table";

export const OTHER_LOCALITY = "Autre localité";

export function LocalityField({ value, onChange, error }: { value: string | null; onChange: (value: string | null) => void; error?: string }) {
  const zone = value ? findZoneByLocality(value) : undefined;
  const hint = !value
    ? "Sert à calculer les frais de déplacement. Ta position n'est jamais détectée automatiquement."
    : !zone || zone.fee === null
      ? `${zone ? `${zone.name} — f` : "F"}rais de déplacement sur devis.`
      : `${zone.name} — frais de déplacement : ${formatFcfa(zone.fee)}${zone.status === "valide" ? "" : " (à confirmer)"}.`;
  return (
    <SelectField label="Localité" name="locality" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} hint={hint} error={error}>
      <option value="" disabled>
        Choisir une localité
      </option>
      {travelZones.map((z) => (
        <optgroup key={z.id} label={z.name}>
          {z.localities.map((locality) => (
            <option key={locality}>{locality}</option>
          ))}
        </optgroup>
      ))}
      <option>{OTHER_LOCALITY}</option>
    </SelectField>
  );
}

interface Props {
  draft: ProjectDraft;
  estimate: Estimate;
  onChange: (patch: Partial<ProjectDraft>) => void;
  /** Retourne à l'étape qui permet de modifier ce choix. */
  onEdit: (target: FieldId | "projectType" | "inspiration") => void;
  showErrors: boolean;
}

/** Étape 5 — Récapitulatif : chaque choix est modifiable ; la localité se choisit ici. */
export function StepSummary({ draft, estimate, onChange, onEdit, showErrors }: Props) {
  const inspiration = getInspiration(draft.inspirationId);
  const rows: Array<{ id: FieldId | "projectType" | "inspiration"; label: string; value: string | null; pendingText: string }> = [
    ...summaryRows(draft).map((row) => ({ id: row.id, label: row.label, value: row.value, pendingText: row.required ? "À choisir" : "Non précisé" })),
    { id: "inspiration", label: "Inspiration", value: inspiration?.title ?? null, pendingText: "Non choisie" },
  ];
  return (
    <div className="mt-8">
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 py-2">
            <p className="min-w-0 py-1.5">
              <span className="block text-xs text-charcoal">{row.label}</span>
              <span className={row.value ? "block font-bold" : "block text-charcoal"}>{row.value ?? row.pendingText}</span>
            </p>
            <button
              type="button"
              onClick={() => onEdit(row.id)}
              aria-label={`Modifier : ${row.label}`}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-forest hover:bg-mist"
            >
              <Pencil aria-hidden className="size-3.5" />
              Modifier
            </button>
          </li>
        ))}
      </ul>

      <div id="champ-locality" className="mt-8 scroll-mt-28">
        {needsLocality(draft) ? (
          <LocalityField
            value={draft.locality}
            onChange={(locality) => onChange({ locality })}
            error={showErrors && !draft.locality ? "Choisis ta localité pour estimer les frais de déplacement." : undefined}
          />
        ) : (
          <p className="rounded-2xl bg-mist p-4 text-sm font-medium text-forest">
            Pour un achat de locks, la remise ou la livraison se convient directement avec LP LOCKS.
          </p>
        )}
      </div>

      <h2 className="type-h3 mt-10 mb-4 !text-[1.375rem]">Estimation</h2>
      <EstimateTable estimate={estimate} />
    </div>
  );
}

/** Étape 6 — Estimation détaillée. */
export function StepEstimate({ estimate }: { estimate: Estimate }) {
  return (
    <div className="mt-8">
      <EstimateTable estimate={estimate} />
      <ul className="mt-6 space-y-2 text-sm leading-relaxed text-charcoal">
        <li>Seuls les montants connus sont additionnés : rien n&apos;est estimé à ta place.</li>
        <li>Les extensions sont comptées au prix de la mèche multiplié par le nombre de locks, d&apos;où une fourchette.</li>
        <li>Un acompte peut être demandé à la réservation. LP LOCKS te l&apos;indique : il n&apos;est pas compris dans ce total.</li>
        <li>Aucun paiement n&apos;est effectué sur ce site.</li>
      </ul>
    </div>
  );
}
