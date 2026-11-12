"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { ColorOption, ConfigOption } from "@/types";
import { cn } from "@/lib/cn";

/**
 * Sélecteurs du design system. Tous reposent sur de vrais boutons radio
 * (masqués visuellement) : navigation clavier native avec les flèches,
 * annonce correcte par les lecteurs d'écran.
 */

interface GroupProps {
  /** Libellé accessible du groupe. */
  legend: string;
  /** Masque visuellement la légende (elle reste lue par les lecteurs d'écran). */
  hideLegend?: boolean;
  children: ReactNode;
  className?: string;
}

export function SelectorGroup({ legend, hideLegend, children, className }: GroupProps) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={cn(hideLegend ? "sr-only" : "mb-3 text-sm font-semibold text-ink")}>
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

/* ----------------------------- Carte de sélection ----------------------------- */

interface OptionCardProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  title: string;
  description?: string;
  /** Petit texte au-dessus du titre. */
  eyebrow?: string;
  /** Contenu libre sous la description (mention, badge…). */
  footer?: ReactNode;
  /** Visuel en tête de carte. */
  media?: ReactNode;
  disabled?: boolean;
  /** Explication affichée lorsque l'option est désactivée. */
  disabledReason?: string;
  className?: string;
}

export function OptionCard({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
  eyebrow,
  footer,
  media,
  disabled,
  disabledReason,
  className,
}: OptionCardProps) {
  return (
    <label className={cn("group relative block", disabled ? "cursor-not-allowed" : "cursor-pointer", className)}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-card border bg-white transition-[border-color,background-color,box-shadow,transform] duration-300 ease-soft",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-forest",
          checked
            ? "border-forest bg-mist shadow-[inset_0_0_0_1px_var(--lp-forest)]"
            : "border-line group-hover:border-silver group-hover:shadow-float",
          disabled && "opacity-50 group-hover:border-line group-hover:shadow-none",
        )}
      >
        {media && <span className="relative block aspect-[4/3] w-full overflow-hidden">{media}</span>}
        <span className="flex flex-1 flex-col gap-1.5 p-5">
          {eyebrow && <span className="text-xs font-semibold text-sage-ink">{eyebrow}</span>}
          <span className="flex items-start justify-between gap-3">
            <span className="type-h3 !text-[1.25rem] text-ink">{title}</span>
            <span
              aria-hidden
              className={cn(
                "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-300 ease-soft",
                checked ? "scale-100 border-forest bg-forest text-white" : "scale-90 border-silver text-transparent",
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          </span>
          {description && <span className="text-sm leading-relaxed text-charcoal">{description}</span>}
          {disabled && disabledReason && (
            <span className="text-sm font-medium text-charcoal">{disabledReason}</span>
          )}
          {footer && <span className="mt-auto block pt-3">{footer}</span>}
        </span>
      </span>
    </label>
  );
}

/* ----------------------------- Pastilles (longueurs…) ----------------------------- */

interface ChipSelectorProps {
  name: string;
  legend: string;
  hideLegend?: boolean;
  options: ConfigOption[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export function ChipSelector({ name, legend, hideLegend, options, value, onChange, className }: ChipSelectorProps) {
  return (
    <SelectorGroup legend={legend} hideLegend={hideLegend} className={className}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = option.id === value;
          return (
            <label key={option.id} className="cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="peer sr-only"
                aria-label={[option.description ?? option.label, option.detail, option.quoteOnly && "sur devis"]
                  .filter(Boolean)
                  .join(", ")}
              />
              <span
                className={cn(
                  "flex min-h-12 min-w-14 flex-col items-center justify-center rounded-2xl border px-3.5 py-1.5 text-center transition-[background-color,border-color,color] duration-200 ease-soft",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-forest",
                  checked
                    ? "border-forest bg-forest text-white"
                    : "border-line bg-white text-ink hover:border-forest",
                )}
              >
                <span className="text-sm font-bold">{option.label}</span>
                {option.detail && (
                  <span className={cn("text-[0.6875rem] font-medium", checked ? "text-white/80" : "text-charcoal")}>
                    {option.quoteOnly ? "Sur devis" : option.detail}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </SelectorGroup>
  );
}

/* ----------------------------- Nuancier ----------------------------- */

interface SwatchSelectorProps {
  name: string;
  legend: string;
  hideLegend?: boolean;
  options: ColorOption[];
  value: string | null;
  onChange: (value: string) => void;
  /** Affiche le nom sous chaque teinte (sinon uniquement le nom sélectionné). */
  showNames?: boolean;
  className?: string;
}

export function SwatchSelector({
  name,
  legend,
  hideLegend,
  options,
  value,
  onChange,
  showNames = true,
  className,
}: SwatchSelectorProps) {
  return (
    <SelectorGroup legend={legend} hideLegend={hideLegend} className={className}>
      <div className="flex flex-wrap gap-x-3 gap-y-4">
        {options.map((option) => {
          const checked = option.id === value;
          return (
            <label key={option.id} className="flex w-[4.25rem] cursor-pointer flex-col items-center gap-2 text-center">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="peer sr-only"
                aria-label={option.label}
              />
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-full border-2 border-white transition-[box-shadow,transform] duration-300 ease-soft",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-forest",
                  checked
                    ? "scale-105 shadow-[0_0_0_2px_var(--lp-forest)]"
                    : "shadow-[0_0_0_1px_var(--lp-silver)] hover:scale-105",
                )}
                style={{ backgroundColor: option.hex }}
              >
                <Check
                  aria-hidden
                  strokeWidth={3}
                  className={cn(
                    "size-4 text-white mix-blend-difference transition-opacity duration-200",
                    checked ? "opacity-100" : "opacity-0",
                  )}
                />
              </span>
              {showNames && (
                <span className={cn("text-xs leading-tight", checked ? "font-bold text-ink" : "text-charcoal")}>
                  {option.label}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </SelectorGroup>
  );
}

/* ----------------------------- Quantité ----------------------------- */

interface QuantityStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function QuantityStepper({ label, value, onChange, min = 1, max = 999, step = 1 }: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const button =
    "grid size-11 place-items-center rounded-full text-xl font-medium text-ink transition-colors hover:bg-mist disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1 rounded-full border border-line bg-white p-1">
      <button type="button" className={button} onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label="Diminuer la quantité">
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className="w-14 bg-transparent text-center text-base font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className={button} onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label="Augmenter la quantité">
        +
      </button>
    </div>
  );
}
