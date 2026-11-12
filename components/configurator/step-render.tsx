"use client";

import { Check } from "lucide-react";
import { faceShapeOptions } from "@/data/configurator";
import { renderViews, type RankedInspiration } from "@/lib/inspirations";
import type { ProjectDraft } from "@/lib/project-store";
import { cn } from "@/lib/cn";
import { hasVisual } from "@/lib/media";
import { MediaSlot } from "@/components/ui/media-slot";
import { INDICATIVE_NOTICE, inspirationSpecs } from "./step-inspirations";

interface Props {
  draft: ProjectDraft;
  ranked: RankedInspiration[];
  onChange: (patch: Partial<ProjectDraft>) => void;
}

/**
 * Étape 3 — Rendu : le style le plus proche des choix, vu de face et de profil.
 * Les vues sont des images préparées (voir docs/VISUELS.md), jamais une photo modifiée.
 */
export function StepRender({ draft, ranked, onChange }: Props) {
  const current = ranked.find((r) => r.inspiration.id === draft.inspirationId) ?? ranked[0];
  if (!current) return null;
  const { inspiration, exact, differences } = current;
  const views = renderViews(inspiration, draft.faceShape);
  const faceShape = faceShapeOptions.find((f) => f.id === draft.faceShape);
  const others = ranked.filter((r) => r.inspiration.id !== inspiration.id).slice(0, 3);

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {(
          [
            ["Vue de face", views.face],
            ["Vue de profil", views.profil],
          ] as const
        ).map(([label, media]) => (
          <div key={label} role="group" aria-label={label} className="min-w-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-card">
              <MediaSlot media={media} hideLabel sizes="(min-width: 1024px) 25vw, 50vw" />
              {!hasVisual(media) && (
                <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-bold text-charcoal backdrop-blur">
                  Photo à venir
                </span>
              )}
            </div>
            <p aria-hidden className="mt-2 text-sm font-bold">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card bg-mist p-5 sm:p-6" aria-live="polite">
        <p className="type-eyebrow text-sage-ink">Ton rendu</p>
        <p data-testid="rendu-titre" className="type-h3 mt-2">
          {inspiration.title}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {[...inspirationSpecs(inspiration), ["Morphologie", faceShape?.label ?? "Non précisée"] as [string, string]].map(([name, value]) => (
            <div key={name}>
              <dt className="text-xs text-charcoal">{name}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className={cn("mt-4 text-sm", exact ? "font-semibold text-forest" : "text-charcoal")}>
          {exact ? "Ce rendu correspond à tes choix." : `Rendu le plus proche de tes choix — il diffère par : ${differences.join(", ")}.`}
        </p>
        {faceShape && !views.matchesFaceShape && (
          <p className="mt-1 text-sm text-charcoal">
            Les vues propres à la morphologie « {faceShape.label.toLowerCase()} » ne sont pas encore disponibles : ce rendu est générique.
          </p>
        )}
      </div>

      {others.length > 0 && (
        <>
          <h2 className="type-h3 mt-10 mb-4 !text-[1.375rem]">Autres rendus proches</h2>
          <ul className="grid grid-cols-3 gap-3">
            {others.map(({ inspiration: other, exact: otherExact }) => (
              <li key={other.id}>
                <button
                  type="button"
                  onClick={() => onChange({ inspirationId: other.id })}
                  className="group block w-full overflow-hidden rounded-card border-2 border-transparent text-left transition-[border-color] duration-300 hover:border-silver"
                >
                  <span className="relative block aspect-[4/5]">
                    <MediaSlot media={renderViews(other, draft.faceShape).face} hideLabel sizes="(min-width: 1024px) 15vw, 33vw" />
                  </span>
                  <span className="block p-2.5">
                    <span className="block text-xs leading-snug font-bold sm:text-sm">{other.title}</span>
                    <span className="mt-1 block text-xs text-charcoal">{otherExact ? "Correspond à tes choix" : "Proche"} · voir ce rendu</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {draft.inspirationId && draft.inspirationId !== ranked[0]?.inspiration.id && (
        <button
          type="button"
          onClick={() => onChange({ inspirationId: null })}
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest underline underline-offset-4"
        >
          <Check aria-hidden className="size-4" />
          Revenir au rendu le plus proche de mes choix
        </button>
      )}

      <p className="mt-6 text-sm text-charcoal">{INDICATIVE_NOTICE}</p>
    </div>
  );
}
