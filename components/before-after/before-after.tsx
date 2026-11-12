"use client";

import { ChevronsLeftRight } from "lucide-react";
import { useId, useState } from "react";
import type { MediaRef } from "@/types";
import { cn } from "@/lib/cn";
import { MediaSlot } from "@/components/ui/media-slot";

interface BeforeAfterProps {
  before: MediaRef;
  after: MediaRef;
  /** Décrit la transformation pour les lecteurs d'écran. */
  label: string;
  className?: string;
  sizes?: string;
}

/**
 * Comparateur avant / après à curseur horizontal.
 * Le curseur est un vrai <input type="range"> étendu sur toute l'image :
 * glisser au doigt, à la souris et flèches du clavier fonctionnent nativement.
 */
export function BeforeAfter({ before, after, label, className, sizes = "(min-width: 1024px) 50vw, 100vw" }: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const id = useId();

  return (
    <div className={cn("group relative aspect-[4/5] overflow-hidden rounded-card select-none", className)}>
      {/* APRÈS : image de fond */}
      <div className="absolute inset-0">
        <MediaSlot media={after} sizes={sizes} hideLabel />
      </div>
      {/* AVANT : au-dessus, découpée à la position du curseur */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <MediaSlot media={before} sizes={sizes} hideLabel />
      </div>

      <span aria-hidden className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold tracking-wider text-white backdrop-blur-sm">
        AVANT
      </span>
      <span aria-hidden className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-wider text-forest backdrop-blur-sm">
        APRÈS
      </span>

      {/* Poignée visible */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" style={{ left: `${position}%` }}>
        <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-forest shadow-float transition-transform duration-200 group-focus-within:scale-110 group-hover:scale-110">
          <ChevronsLeftRight className="size-5" />
        </span>
      </div>

      <label htmlFor={id} className="sr-only">
        {label} — déplacer le curseur pour comparer avant et après
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-valuetext={`${position} % de l'image « avant » visible`}
        className="peer absolute inset-0 size-full cursor-ew-resize touch-pan-y appearance-none opacity-0"
      />
      {/* Anneau de focus visible (le curseur natif est transparent) */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-card ring-forest ring-inset peer-focus-visible:ring-4" />
    </div>
  );
}
