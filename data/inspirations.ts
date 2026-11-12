import type { MediaRef, MediaTone } from "@/types";
import { colorOptions, textureOptions, thicknessOptions } from "./configurator";

/**
 * BIBLIOTHÈQUE D'INSPIRATIONS du configurateur.
 *
 * DONNÉES DE DÉMONSTRATION : aucune photographie n'est encore fournie. Chaque
 * entrée décrit un visuel attendu, classé par caractéristiques, pour que la
 * visualisation dynamique fonctionne dès maintenant avec des emplacements.
 *
 * Ajouter un style : ajouter une entrée (ou renseigner `image.src` sur une
 * entrée existante) avec ses caractéristiques. Le configurateur la proposera
 * automatiquement quand les choix de la cliente s'en rapprochent.
 */
export interface Inspiration {
  id: string;
  title: string;
  lengthGroup: "courte" | "moyenne" | "longue";
  color: string;
  texture: string;
  thickness: string;
  /** Identifiants de styleOptions. */
  styles: string[];
  image: MediaRef;
  /** true tant que la photo n'est pas fournie. */
  placeholder: boolean;
}

const groups = [
  { id: "courte", label: "courtes" },
  { id: "moyenne", label: "mi-longues" },
  { id: "longue", label: "longues" },
] as const;

const tones: Record<string, MediaTone> = {
  "noir-naturel": "charcoal",
  "noir-profond": "forest",
  "brun-fonce": "charcoal",
  "brun-chocolat": "sage",
  caramel: "silver",
  blond: "soft",
};

export const inspirations: Inspiration[] = groups.flatMap((group, g) =>
  colorOptions.map((color, c) => {
    const index = g * colorOptions.length + c;
    const texture = textureOptions[(c + g) % textureOptions.length];
    const thickness = thicknessOptions[(c + 2 * g) % thicknessOptions.length];
    const styles = [
      index % 2 === 0 ? "libres" : "attachees",
      ...(group.id === "longue" ? ["longues"] : group.id === "courte" ? ["courtes"] : []),
      ...(thickness.id === "fine" ? ["fines"] : thickness.id === "epaisse" ? ["epaisses"] : []),
      ...(texture.id === "bouclee" ? ["bouclees"] : []),
      ...(["caramel", "blond"].includes(color.id) ? ["colorees"] : []),
    ];
    const id = `${group.id}-${color.id}`;
    const title = `Locks ${group.label}, ${color.label.toLowerCase()}, texture ${texture.label.toLowerCase()}`;
    return {
      id,
      title,
      lengthGroup: group.id,
      color: color.id,
      texture: texture.id,
      thickness: thickness.id,
      styles,
      image: { alt: title, slot: `models/${id}`, tone: tones[color.id] ?? "soft" },
      placeholder: true,
    };
  }),
);

export function getInspiration(id: string | null): Inspiration | undefined {
  return inspirations.find((i) => i.id === id);
}
