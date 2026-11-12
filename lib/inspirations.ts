import type { MediaRef } from "@/types";
import type { Inspiration } from "@/data/inspirations";
import { hasVisual } from "./media";
import { effectiveDraft, lengthGroup } from "./configurator";
import type { ProjectDraft } from "./project-store";

export interface RankedInspiration {
  inspiration: Inspiration;
  score: number;
  /** true si toutes les caractéristiques choisies correspondent. */
  exact: boolean;
  /** Libellés des caractéristiques choisies qui ne correspondent pas. */
  differences: string[];
}

/**
 * Classe les inspirations de la plus proche à la plus éloignée des choix.
 * Aucune image n'est modifiée : on sélectionne parmi une bibliothèque classée.
 */
export function rankInspirations(rawDraft: ProjectDraft, library: Inspiration[]): RankedInspiration[] {
  const draft = effectiveDraft(rawDraft);
  const criteria: Array<{ label: string; weight: number; wanted: string | null; test: (i: Inspiration) => boolean }> = [
    { label: "longueur", weight: 3, wanted: lengthGroup(draft.length), test: (i) => i.lengthGroup === lengthGroup(draft.length) },
    { label: "couleur", weight: 3, wanted: draft.color, test: (i) => i.color === draft.color },
    { label: "texture", weight: 2, wanted: draft.texture, test: (i) => i.texture === draft.texture },
    { label: "épaisseur", weight: 2, wanted: draft.thickness, test: (i) => i.thickness === draft.thickness },
  ];
  const active = criteria.filter((c) => c.wanted);

  return library
    .map((inspiration, index) => {
      const differences = active.filter((c) => !c.test(inspiration)).map((c) => c.label);
      const score = active.filter((c) => c.test(inspiration)).reduce((sum, c) => sum + c.weight, 0);
      return { inspiration, score, exact: differences.length === 0, differences, index };
    })
    // À score égal, l'ordre de la bibliothèque est conservé (résultat stable).
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ inspiration, score, exact, differences }) => ({ inspiration, score, exact, differences }));
}

export interface RenderViews {
  face: MediaRef;
  profil: MediaRef;
  /** true si les deux vues sont des images propres à la morphologie choisie. */
  matchesFaceShape: boolean;
}

/**
 * Vues de face et de profil d'une inspiration.
 * Aucune image n'est calculée : on cherche d'abord un visuel propre à la morphologie
 * (rendus/{morphologie}-{inspiration}-{vue}), puis le visuel générique (models/{inspiration}-{vue}).
 * Sans image, un emplacement « Visuel à venir » indique le fichier attendu.
 */
export function renderViews(inspiration: Inspiration, faceShape: string | null): RenderViews {
  const view = (name: "face" | "profil", label: string) => {
    const generic: MediaRef = {
      alt: `${inspiration.title} — vue de ${label}`,
      slot: `models/${inspiration.id}-${name}`,
      tone: inspiration.image.tone,
    };
    if (!faceShape) return { media: generic, specific: false };
    const specific: MediaRef = { ...generic, slot: `rendus/${faceShape}-${inspiration.id}-${name}` };
    return hasVisual(specific) ? { media: specific, specific: true } : { media: generic, specific: false };
  };
  const face = view("face", "face");
  const profil = view("profil", "profil");
  return { face: face.media, profil: profil.media, matchesFaceShape: face.specific && profil.specific };
}
