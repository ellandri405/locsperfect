import Image from "next/image";
import type { MediaRef, MediaTone } from "@/types";
import { cn } from "@/lib/cn";
import { resolveMedia } from "@/lib/media";

const tones: Record<MediaTone, string> = {
  forest: "bg-linear-to-br from-[#1f5a43] to-[#0f3325] text-white",
  sage: "bg-linear-to-br from-[#8aa48f] to-[#5f7b66] text-white",
  soft: "bg-linear-to-br from-[#c5d4c5] to-[#9fb5a0] text-ink",
  mist: "bg-linear-to-br from-[#eef4ee] to-[#d6e2d6] text-ink",
  charcoal: "bg-linear-to-br from-[#4d5550] to-[#262b28] text-white",
  silver: "bg-linear-to-br from-[#c3c8c5] to-[#8f9693] text-ink",
};

interface MediaSlotProps {
  media: MediaRef;
  className?: string;
  /** Attribut `sizes` de l'image (performance). */
  sizes?: string;
  priority?: boolean;
  /** Masque l'étiquette de l'emplacement (très petits formats). */
  hideLabel?: boolean;
}

/**
 * Affiche une photo si `media.src` est renseigné, sinon un emplacement propre
 * et clairement identifié. Pour fournir un visuel : déposer le fichier dans
 * public/assets sous le nom de l'emplacement (voir docs/VISUELS.md).
 * Le parent doit être positionné (relative) avec une taille définie.
 */
export function MediaSlot({ media: declared, className, sizes = "100vw", priority, hideLabel }: MediaSlotProps) {
  const media = resolveMedia(declared);
  if (media.src) {
    return (
      <>
        <Image src={media.src} alt={media.alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />
        {media.origin === "ia" && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/45 px-2.5 py-1 text-[0.6875rem] font-semibold text-white backdrop-blur-sm">
            Image générée par IA
          </span>
        )}
      </>
    );
  }
  return (
    <div
      role="img"
      aria-label={`Emplacement de visuel à venir : ${media.alt}`}
      className={cn("absolute inset-0", tones[media.tone], className)}
    >
      <div aria-hidden className="lp-strands absolute inset-0" />
      {!hideLabel && (
        <span
          aria-hidden
          className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-black/20 px-3 py-1 text-[0.6875rem] font-semibold tracking-wide text-white backdrop-blur-sm"
        >
          Visuel à venir · {media.slot}
        </span>
      )}
    </div>
  );
}
