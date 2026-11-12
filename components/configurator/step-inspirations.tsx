"use client";

import { Check } from "lucide-react";
import { colorOptions, styleOptions, textureOptions, thicknessOptions } from "@/data/configurator";
import type { Inspiration } from "@/data/inspirations";
import type { RankedInspiration } from "@/lib/inspirations";
import type { ProjectDraft } from "@/lib/project-store";
import { cn } from "@/lib/cn";
import { hasVisual } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";
import { MediaSlot } from "@/components/ui/media-slot";
import { FilterChips } from "@/components/shared/filter-chips";

export const INDICATIVE_NOTICE = "Aperçu indicatif — le résultat final dépendra de la réalisation.";

const lengthGroupLabels = { courte: "Courte (6 à 10 pouces)", moyenne: "Mi-longue (12 à 16 pouces)", longue: "Longue (18 pouces et plus)" };
const label = (options: { id: string; label: string }[], id: string) => options.find((o) => o.id === id)?.label ?? id;

export function inspirationSpecs(i: Inspiration): Array<[string, string]> {
  return [
    ["Longueur", lengthGroupLabels[i.lengthGroup]],
    ["Couleur", label(colorOptions, i.color)],
    ["Texture", label(textureOptions, i.texture)],
    ["Épaisseur", label(thicknessOptions, i.thickness)],
  ];
}

interface Props {
  draft: ProjectDraft;
  ranked: RankedInspiration[];
  onChange: (patch: Partial<ProjectDraft>) => void;
}

/** Étape 3 — Visualisation : inspirations classées selon les choix, à sélectionner. */
export function StepInspirations({ draft, ranked, onChange }: Props) {
  const exactCount = ranked.filter((r) => r.exact).length;
  const shown = ranked.slice(0, 9);
  return (
    <div className="mt-8">
      <FilterChips label="Filtrer par style" options={styleOptions} value={draft.style} onChange={(v) => onChange({ style: v })} allLabel="Tous les styles" />
      <p aria-live="polite" className="mt-4 text-sm text-charcoal">
        {exactCount > 0
          ? `${exactCount} inspiration${exactCount > 1 ? "s correspondent" : " correspond"} à tes choix.`
          : "Aucune inspiration ne réunit tous tes choix pour l'instant : voici les plus proches."}
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map(({ inspiration, exact, differences }) => {
          const selected = draft.inspirationId === inspiration.id;
          return (
            <li key={inspiration.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ inspirationId: selected ? null : inspiration.id })}
                className={cn(
                  "group relative block w-full overflow-hidden rounded-card border-2 text-left transition-[border-color,box-shadow] duration-300",
                  selected ? "border-forest shadow-float" : "border-transparent hover:border-silver",
                )}
              >
                <span className="relative block aspect-[4/5]">
                  <MediaSlot media={inspiration.image} hideLabel sizes="(min-width: 640px) 20vw, 50vw" />
                  {!hasVisual(inspiration.image) && (
                    <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-bold text-charcoal backdrop-blur">
                      Photo à venir
                    </span>
                  )}
                  {selected && (
                    <span aria-hidden className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-forest text-white">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="block p-3">
                  <span className="block text-sm leading-snug font-bold">{inspiration.title}</span>
                  <span className={cn("mt-1 block text-xs", exact ? "font-semibold text-forest" : "text-charcoal")}>
                    {exact ? "Correspond à tes choix" : `Proche — diffère par : ${differences.join(", ")}`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-sm text-charcoal">{INDICATIVE_NOTICE}</p>
    </div>
  );
}

/** Étape 4 — Comparateur : deux inspirations côte à côte. */
export function StepCompare({ draft, ranked, onChange }: Props) {
  const all = ranked.map((r) => r.inspiration);
  const pick = (index: 0 | 1) => all.find((i) => i.id === draft.compareIds[index]) ?? all[index];
  const sides = [pick(0), pick(1)];
  const setSide = (index: 0 | 1, id: string) => {
    const next: [string | null, string | null] = [sides[0]?.id ?? null, sides[1]?.id ?? null];
    next[index] = id;
    onChange({ compareIds: next });
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {sides.map((inspiration, index) => {
          if (!inspiration) return null;
          const chosen = draft.inspirationId === inspiration.id;
          const other = sides[1 - index];
          return (
            <section key={index} aria-label={`Proposition ${index === 0 ? "A" : "B"}`} className="flex min-w-0 flex-col">
              <SelectField label={`Inspiration ${index === 0 ? "A" : "B"}`} value={inspiration.id} onChange={(e) => setSide(index as 0 | 1, e.target.value)}>
                {all.map((i) => (
                  <option key={i.id} value={i.id} disabled={i.id === other?.id}>
                    {i.title}
                  </option>
                ))}
              </SelectField>
              <div className={cn("relative mt-3 aspect-[3/4] overflow-hidden rounded-card border-2", chosen ? "border-forest" : "border-transparent")}>
                <MediaSlot media={inspiration.image} hideLabel sizes="(min-width: 1024px) 25vw, 50vw" />
                {!hasVisual(inspiration.image) && (
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[0.6875rem] font-bold text-charcoal backdrop-blur">
                    Photo à venir
                  </span>
                )}
              </div>
              <dl className="mt-3 divide-y divide-line text-sm">
                {inspirationSpecs(inspiration).map(([name, value]) => {
                  const differs = other && inspirationSpecs(other).find(([n]) => n === name)?.[1] !== value;
                  return (
                    <div key={name} className="py-2">
                      <dt className="text-xs text-charcoal">{name}</dt>
                      <dd className={cn("font-semibold", differs && "text-forest")}>{value}</dd>
                    </div>
                  );
                })}
              </dl>
              <Button
                className="mt-4 w-full"
                size="sm"
                variant={chosen ? "primary" : "secondary"}
                onClick={() => onChange({ inspirationId: inspiration.id })}
                icon={chosen ? <Check aria-hidden className="size-4" /> : undefined}
              >
                {chosen ? "Style choisi" : "Choisir ce style"}
              </Button>
            </section>
          );
        })}
      </div>
      <p className="mt-5 text-sm text-charcoal">
        Les différences entre les deux propositions sont indiquées en vert. Cette étape est facultative. {INDICATIVE_NOTICE}
      </p>
    </div>
  );
}
