"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import {
  colorOptions,
  extensionOptions,
  lengthOptions,
  materialOptions,
  startQuantityOptions,
  strandQuantity,
  styleOptions,
  textureOptions,
  thicknessOptions,
} from "@/data/configurator";
import { fieldsFor, techniquesFor, type FieldId, type FieldRule } from "@/lib/configurator";
import { formatFcfa } from "@/lib/format";
import { lineAmountLabel, materialPriceHint, startPrice, strandPrice } from "@/lib/pricing";
import type { ProjectDraft } from "@/lib/project-store";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { ChipSelector, OptionCard, QuantityStepper, SelectorGroup, SwatchSelector } from "@/components/ui/selectors";

type Patch = Partial<ProjectDraft>;

interface Props {
  draft: ProjectDraft;
  onChange: (patch: Patch) => void;
  /** Affiche les erreurs des champs obligatoires non remplis. */
  showErrors: boolean;
}

const thicknessWidth: Record<string, string> = { fine: "w-1.5", moyenne: "w-3", epaisse: "w-5" };

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-2xl bg-mist p-3.5 text-sm leading-snug font-medium text-forest">
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Étape 2 — Personnalisation. Les champs affichés dépendent du projet (voir lib/configurator.ts). */
export function StepCustomize({ draft, onChange, showErrors }: Props) {
  const fields = fieldsFor(draft);

  const body = (id: FieldId): ReactNode => {
    switch (id) {
      case "technique":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {techniquesFor(draft.projectType).map((option) => {
              const price = startPrice(option.id, draft.startQuantity);
              return (
                <OptionCard
                  key={option.id}
                  name="technique"
                  value={option.id}
                  checked={draft.technique === option.id}
                  onSelect={(v) => onChange({ technique: v })}
                  title={option.label}
                  description={option.description}
                  footer={
                    price && (
                      <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                        {lineAmountLabel(price)}
                        {!price.confirmed && <Badge tone="warning">à confirmer</Badge>}
                      </span>
                    )
                  }
                />
              );
            })}
          </div>
        );
      case "startQuantity":
        return (
          <>
            <ChipSelector name="quantite-locks" legend="Nombre de locks" hideLegend options={startQuantityOptions} value={draft.startQuantity} onChange={(v) => onChange({ startQuantity: v })} />
            {draft.startQuantity === "autre" && <Note>Au-delà de 120 locks, LP LOCKS établit un devis sur mesure.</Note>}
          </>
        );
      case "extensions":
        return (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {extensionOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  name="extensions"
                  value={option.id}
                  checked={draft.extensions === option.id}
                  onSelect={(v) => onChange({ extensions: v })}
                  title={option.label}
                  description={option.description}
                />
              ))}
            </div>
            {draft.extensions === "sans" && (
              <Note>Sans extensions, la longueur est celle de tes cheveux : la matière, la longueur et la couleur ne sont pas à choisir.</Note>
            )}
          </>
        );
      case "material":
        return (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {materialOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  name="matiere"
                  value={option.id}
                  checked={draft.material === option.id}
                  onSelect={(v) => onChange({ material: v })}
                  title={option.label}
                  description={materialPriceHint(option.id, draft.length)}
                />
              ))}
            </div>
            {draft.projectType === "temporaire" && <Note>La pose de locks temporaires nécessite des extensions : choisis leur matière.</Note>}
          </>
        );
      case "length":
        return (
          <>
            <ChipSelector name="longueur" legend="Longueur" hideLegend options={lengthOptions} value={draft.length} onChange={(v) => onChange({ length: v })} />
            {draft.length === "24-30" && <Note>De 24 à 30 pouces, le tarif est sur devis.</Note>}
          </>
        );
      case "color":
        return (
          <>
            <SwatchSelector name="couleur" legend="Couleur" hideLegend options={colorOptions} value={draft.color} onChange={(v) => onChange({ color: v })} />
            <p className="mt-3 text-sm text-charcoal">
              Teintes indicatives. Une autre couleur en tête ? Précise-la dans ton commentaire à la dernière étape.
            </p>
          </>
        );
      case "texture":
        return <ChipSelector name="texture" legend="Texture" hideLegend options={textureOptions} value={draft.texture} onChange={(v) => onChange({ texture: v })} />;
      case "thickness":
        return (
          <SelectorGroup legend="Épaisseur" hideLegend>
            <div className="grid grid-cols-3 gap-3">
              {thicknessOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  name="epaisseur"
                  value={option.id}
                  checked={draft.thickness === option.id}
                  onSelect={(v) => onChange({ thickness: v })}
                  title={option.label}
                  media={
                    <span aria-hidden className="absolute inset-0 flex items-end justify-center gap-2 bg-mist pt-4">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className={cn("h-full rounded-t-full bg-forest/80", thicknessWidth[option.id])} />
                      ))}
                    </span>
                  }
                />
              ))}
            </div>
          </SelectorGroup>
        );
      case "style":
        return <ChipSelector name="style" legend="Style" hideLegend options={styleOptions} value={draft.style} onChange={(v) => onChange({ style: v })} />;
      case "strandQuantity": {
        const price = strandPrice(draft.material, draft.length);
        return (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper label="Nombre de mèches" value={draft.strandQuantity} onChange={(v) => onChange({ strandQuantity: v })} min={strandQuantity.min} max={strandQuantity.max} step={strandQuantity.step} />
              {price?.amount != null && (
                <p className="text-sm text-charcoal">
                  {price.from ? "À partir de " : ""}
                  {formatFcfa(price.amount)} la mèche
                </p>
              )}
            </div>
            <p className="mt-3 text-sm text-charcoal">Il s&apos;agit du nombre de mèches que tu achètes, pas d&apos;un nombre de locks posées.</p>
          </>
        );
      }
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-10">
      {fields.map((field) => (
        <FieldSection key={field.id} field={field} draft={draft} onChange={onChange} showErrors={showErrors}>
          {body(field.id)}
        </FieldSection>
      ))}
    </div>
  );
}

function FieldSection({ field, draft, onChange, showErrors, children }: Props & { field: FieldRule; children: ReactNode }) {
  const value = field.id === "strandQuantity" ? draft.strandQuantity : draft[field.id];
  const missing = showErrors && field.required && !value;
  const clearable = !field.required && Boolean(value);
  return (
    <section id={`champ-${field.id}`} aria-labelledby={`champ-${field.id}-titre`} className="scroll-mt-28">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 id={`champ-${field.id}-titre`} className="type-h3 !text-[1.375rem]">
          {field.label}
        </h2>
        <span className={cn("text-xs font-semibold", field.required ? "text-forest" : "text-charcoal")}>
          {field.required ? "Obligatoire" : "Facultatif"}
        </span>
        {clearable && (
          <button
            type="button"
            onClick={() => onChange({ [field.id]: null })}
            className="ml-auto min-h-9 text-sm font-semibold text-charcoal underline underline-offset-4 hover:text-ink"
            aria-label={`Effacer le choix : ${field.label}`}
          >
            Effacer
          </button>
        )}
      </div>
      {missing && (
        <p role="alert" className="mb-3 text-sm font-semibold text-error">
          Ce choix est nécessaire pour continuer.
        </p>
      )}
      {children}
    </section>
  );
}
