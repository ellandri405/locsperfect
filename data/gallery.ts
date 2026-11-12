import type { GalleryItem, GalleryKind, MediaTone } from "@/types";

export const galleryCategories = [
  { id: "naturelles", label: "Locks naturelles" },
  { id: "temporaires", label: "Locks temporaires" },
  { id: "courtes", label: "Locks courtes" },
  { id: "longues", label: "Locks longues" },
  { id: "colorees", label: "Locks colorées" },
  { id: "fines", label: "Locks fines" },
  { id: "epaisses", label: "Locks épaisses" },
  { id: "attachees", label: "Coiffures attachées" },
  { id: "libres", label: "Coiffures libres" },
] as const;

/** Libellé affiché sur chaque image pour distinguer son origine. */
export const galleryKindLabels: Record<GalleryKind, string> = {
  realisation: "Réalisation LP LOCKS",
  inspiration: "Inspiration",
  ia: "Image générée par IA",
  emplacement: "Photo à venir",
};

/**
 * DONNÉES DE DÉMONSTRATION — aucune de ces entrées n'est une vraie photo.
 * Elles réservent la place des futurs visuels et permettent de tester les filtres.
 * Pour publier une image : renseigner `image.src` et passer `kind` à
 * "realisation", "inspiration" ou "ia" selon son origine réelle.
 */
const placeholders: Array<[title: string, tags: string[], tone: MediaTone]> = [
  ["Locks naturelles longues, portées libres", ["naturelles", "longues", "libres"], "forest"],
  ["Locks naturelles courtes", ["naturelles", "courtes", "libres"], "soft"],
  ["Locks temporaires longues", ["temporaires", "longues", "libres"], "sage"],
  ["Locks temporaires colorées", ["temporaires", "colorees"], "charcoal"],
  ["Locks fines attachées", ["fines", "attachees"], "mist"],
  ["Locks épaisses, portées libres", ["epaisses", "libres"], "silver"],
  ["Locks longues attachées", ["longues", "attachees", "naturelles"], "sage"],
  ["Locks courtes colorées", ["courtes", "colorees"], "forest"],
  ["Locks fines et longues", ["fines", "longues", "libres"], "soft"],
  ["Locks épaisses et courtes", ["epaisses", "courtes"], "charcoal"],
  ["Locks temporaires attachées", ["temporaires", "attachees"], "mist"],
  ["Locks naturelles colorées", ["naturelles", "colorees", "libres"], "silver"],
];

export const galleryItems: GalleryItem[] = placeholders.map(([title, tags, tone], index) => {
  const id = `${index + 1}`.padStart(2, "0");
  return { id, title, kind: "emplacement", tags, image: { alt: title, slot: `gallery/${id}`, tone } };
});
