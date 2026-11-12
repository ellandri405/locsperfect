import type { MediaRef } from "@/types";
import manifest from "@/data/media-manifest.json";

const files = manifest as Record<string, { src: string; origin: "ia" | "photo" }>;

/**
 * Complète un visuel avec le fichier déposé dans public/assets, s'il existe.
 * Un `src` écrit à la main dans /data garde la priorité.
 */
export function resolveMedia(media: MediaRef): MediaRef {
  if (media.src) return media;
  const file = files[media.slot];
  return file ? { ...media, src: file.src, origin: file.origin } : media;
}

/** true si une image existe pour cet emplacement (sinon un emplacement « à venir » est affiché). */
export function hasVisual(media: MediaRef): boolean {
  return Boolean(resolveMedia(media).src);
}
