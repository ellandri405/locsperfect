"use client";

import { cn } from "@/lib/cn";

interface FilterChipsProps {
  label: string;
  options: ReadonlyArray<{ id: string; label: string; count?: number }>;
  /** null = « Tout ». */
  value: string | null;
  onChange: (value: string | null) => void;
  allLabel?: string;
}

/** Filtres à choix unique sous forme de pastilles (boutons à bascule). */
export function FilterChips({ label, options, value, onChange, allLabel = "Tout" }: FilterChipsProps) {
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200",
      active ? "border-forest bg-forest text-white" : "border-line bg-white text-ink hover:border-forest",
    );
  return (
    <div role="group" aria-label={label} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={chip(value === null)}>
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(value === option.id ? null : option.id)}
          className={chip(value === option.id)}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={cn("text-xs font-medium", value === option.id ? "text-white/75" : "text-charcoal")}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
