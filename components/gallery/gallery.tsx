"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { GalleryItem, GalleryKind } from "@/types";
import { galleryCategories, galleryKindLabels } from "@/data/gallery";
import { cn } from "@/lib/cn";
import { hasVisual } from "@/lib/media";
import { MediaSlot } from "@/components/ui/media-slot";
import { FilterChips } from "@/components/shared/filter-chips";

const kindStyles: Record<GalleryKind, string> = {
  realisation: "bg-forest text-white",
  inspiration: "bg-white/90 text-forest",
  ia: "bg-ink/80 text-white",
  emplacement: "bg-white/90 text-charcoal",
};

function KindBadge({ kind, item }: { kind: GalleryKind; item: GalleryItem }) {
  // Un emplacement qui a reçu son image n'est plus « à venir » : l'image porte elle-même son étiquette d'origine.
  if (kind === "emplacement" && hasVisual(item.image)) return null;
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-bold backdrop-blur", kindStyles[kind])}>
      {galleryKindLabels[kind]}
    </span>
  );
}

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [tag, setTag] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const options = galleryCategories.map((c) => ({ ...c, count: items.filter((i) => i.tags.includes(c.id)).length }));
  const visible = tag ? items.filter((i) => i.tags.includes(tag)) : items;
  const current = openIndex !== null ? visible[openIndex] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (current && !dialog.open) dialog.showModal();
    if (!current && dialog.open) dialog.close();
  }, [current]);

  const move = (delta: number) =>
    setOpenIndex((i) => (i === null ? i : (i + delta + visible.length) % visible.length));

  return (
    <div className="lp-container pb-20 md:pb-32">
      <FilterChips
        label="Filtrer la galerie"
        options={options}
        value={tag}
        onChange={(v) => {
          setTag(v);
          setOpenIndex(null);
        }}
      />
      <p aria-live="polite" className="py-4 text-sm text-charcoal">
        <span className="font-bold text-ink">{visible.length}</span> {visible.length > 1 ? "visuels" : "visuel"}
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item, index) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-card text-left"
              >
                <span className="absolute inset-0 transition-transform duration-[900ms] ease-soft group-hover:scale-[1.05]">
                  <MediaSlot media={item.image} hideLabel sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw" />
                </span>
                <span className="absolute top-3 left-3">
                  <KindBadge kind={item.kind} item={item} />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-4 pt-10 text-sm font-semibold text-white">
                  {item.title}
                  <span className="sr-only"> — agrandir</span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Affichage grand format */}
      <dialog
        ref={dialogRef}
        aria-label="Visuel en grand format"
        onClose={() => setOpenIndex(null)}
        onClick={(e) => e.target === dialogRef.current && setOpenIndex(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
        className="on-dark m-auto h-[min(92dvh,56rem)] w-[min(96vw,44rem)] overflow-hidden rounded-panel bg-ink p-0 text-white open:flex open:flex-col"
      >
        {current && (
          <>
            <div className="relative min-h-0 flex-1">
              <MediaSlot media={current.image} sizes="(min-width: 768px) 44rem, 96vw" className="!object-contain" />
              <span className="absolute top-4 left-4">
                <KindBadge kind={current.kind} item={current} />
              </span>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label="Fermer"
                className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur hover:bg-black/60"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 p-4">
              <button type="button" onClick={() => move(-1)} aria-label="Visuel précédent" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 hover:bg-white/10">
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <div className="min-w-0 flex-1 text-center" aria-live="polite">
                <p className="truncate text-sm font-semibold">{current.title}</p>
                <p className="text-xs text-white/60">
                  {(openIndex ?? 0) + 1} / {visible.length}
                </p>
              </div>
              <button type="button" onClick={() => move(1)} aria-label="Visuel suivant" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 hover:bg-white/10">
                <ChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
