import {
  colorOptions,
  extensionOptions,
  lengthOptions,
  materialOptions,
  projectTypes,
  startQuantityOptions,
  styleOptions,
  techniqueOptions,
  textureOptions,
  thicknessOptions,
} from "@/data/configurator";
import type { ProjectDraft } from "./project-store";

/**
 * RÈGLES DU PARCOURS MY LOCKS DESIGN.
 * Quels champs sont affichés et obligatoires selon le projet, et comment
 * les choix se résument. Aucune règle de parcours ne vit dans les composants.
 */

export type FieldId =
  | "technique"
  | "startQuantity"
  | "extensions"
  | "material"
  | "length"
  | "color"
  | "texture"
  | "thickness"
  | "style"
  | "strandQuantity";

export interface FieldRule {
  id: FieldId;
  label: string;
  required: boolean;
}

export const fieldLabels: Record<FieldId, string> = {
  technique: "Technique",
  startQuantity: "Nombre de locks",
  extensions: "Extensions",
  material: "Matière",
  length: "Longueur",
  color: "Couleur",
  texture: "Texture",
  thickness: "Épaisseur",
  style: "Style",
  strandQuantity: "Nombre de mèches",
};

const rule = (id: FieldId, required = false): FieldRule => ({ id, label: fieldLabels[id], required });

/** Champs à afficher à l'étape « Personnalisation », dans l'ordre, selon les choix déjà faits. */
export function fieldsFor(draft: ProjectDraft): FieldRule[] {
  switch (draft.projectType) {
    case "depart": {
      const withExtensions = draft.extensions === "avec";
      return [
        rule("technique", true),
        rule("startQuantity", true),
        rule("extensions", true),
        // Sans extensions, la longueur est celle des cheveux : matière, longueur, couleur et texture ne s'appliquent pas.
        ...(withExtensions ? [rule("material", true), rule("length", true), rule("color"), rule("texture")] : []),
        rule("thickness"),
        rule("style"),
      ];
    }
    case "temporaire":
      // Les extensions sont obligatoires pour une pose temporaire : la matière l'est donc aussi.
      // Le nombre de locks sert à chiffrer les extensions (prix à la mèche × nombre de locks).
      return [rule("material", true), rule("length", true), rule("startQuantity", true), rule("color"), rule("texture"), rule("thickness"), rule("style")];
    case "achat":
      return [rule("material", true), rule("length", true), rule("strandQuantity", true), rule("color"), rule("texture")];
    default:
      return [];
  }
}

/** Brouillon dont les champs non applicables au projet sont remis à vide (pour le résumé et le calcul). */
export function effectiveDraft(draft: ProjectDraft): ProjectDraft {
  const visible = new Set(fieldsFor(draft).map((f) => f.id));
  const clean = { ...draft };
  for (const id of Object.keys(fieldLabels) as FieldId[]) {
    if (id !== "strandQuantity" && !visible.has(id)) clean[id] = null;
  }
  return clean;
}

/** Champs obligatoires non renseignés. */
export function missingFields(draft: ProjectDraft): FieldRule[] {
  return fieldsFor(draft).filter((f) => f.required && f.id !== "strandQuantity" && !draft[f.id]);
}

const optionSets: Record<Exclude<FieldId, "strandQuantity">, { id: string; label: string; description?: string; detail?: string }[]> = {
  technique: techniqueOptions,
  startQuantity: startQuantityOptions,
  extensions: extensionOptions,
  material: materialOptions,
  length: lengthOptions,
  color: colorOptions,
  texture: textureOptions,
  thickness: thicknessOptions,
  style: styleOptions,
};

/** Libellé lisible de la valeur d'un champ, null si non renseigné. */
export function fieldValueLabel(draft: ProjectDraft, id: FieldId): string | null {
  if (id === "strandQuantity") return `${draft.strandQuantity} ${draft.strandQuantity > 1 ? "mèches" : "mèche"}`;
  const value = draft[id];
  if (!value) return null;
  const option = optionSets[id].find((o) => o.id === value);
  if (!option) return null;
  if (id === "length") return `${option.description} (${option.detail})`;
  return option.label;
}

export interface SummaryRow {
  id: FieldId | "projectType";
  label: string;
  value: string | null;
  required: boolean;
}

/** Lignes du récapitulatif : type de projet puis chaque champ applicable. */
export function summaryRows(draft: ProjectDraft): SummaryRow[] {
  const project = projectTypes.find((p) => p.id === draft.projectType);
  return [
    { id: "projectType", label: "Type de projet", value: project?.label ?? null, required: true },
    ...fieldsFor(draft).map((f) => ({ id: f.id, label: f.label, value: fieldValueLabel(draft, f.id), required: f.required })),
  ];
}

/** Les frais de déplacement ne concernent que les prestations réalisées (pas l'achat de mèches). */
export function needsLocality(draft: ProjectDraft): boolean {
  return draft.projectType === "depart" || draft.projectType === "temporaire";
}

/** Groupe de longueur utilisé pour rapprocher un choix des inspirations disponibles. */
export function lengthGroup(lengthId: string | null): "courte" | "moyenne" | "longue" | null {
  if (!lengthId) return null;
  const inches = Number.parseInt(lengthId, 10);
  if (inches <= 10) return "courte";
  if (inches <= 16) return "moyenne";
  return "longue";
}
