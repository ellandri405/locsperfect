import { getInspiration } from "@/data/inspirations";
import { needsLocality, summaryRows } from "@/lib/configurator";
import type { Estimate } from "@/lib/pricing";
import type { ProjectDraft } from "@/lib/project-store";
import { cn } from "@/lib/cn";

interface SummaryPanelProps {
  draft: ProjectDraft;
  estimate: Estimate;
  className?: string;
  /** Masque le titre (quand le panneau est affiché dans une fenêtre qui a déjà le sien). */
  hideTitle?: boolean;
}

/** Récapitulatif du projet, synchronisé avec les choix de la cliente. */
export function SummaryPanel({ draft, estimate, className, hideTitle }: SummaryPanelProps) {
  const inspiration = getInspiration(draft.inspirationId);
  const rows: Array<{ label: string; value: string | null; pendingText: string }> = [
    ...summaryRows(draft).map((row) => ({ label: row.label, value: row.value, pendingText: row.required ? "À choisir" : "Non précisé" })),
    ...(draft.projectType ? [{ label: "Inspiration", value: inspiration?.title ?? null, pendingText: "Non choisie" }] : []),
    ...(needsLocality(draft) ? [{ label: "Localité", value: draft.locality, pendingText: "À choisir" }] : []),
  ];
  const savedAt = draft.updatedAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(draft.updatedAt))
    : null;

  return (
    <section aria-label="Mon projet" className={cn(!hideTitle && "rounded-card border border-line p-5 sm:p-6", className)}>
      {!hideTitle && <h2 className="type-h3">Mon projet</h2>}
      <dl className={cn("divide-y divide-line", !hideTitle && "mt-4")} aria-live="polite">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-6 py-2.5 text-sm">
            <dt className="shrink-0 text-charcoal">{row.label}</dt>
            <dd className={cn("text-right", row.value ? "font-bold text-ink" : "text-charcoal")}>{row.value ?? row.pendingText}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-6 py-3 text-sm">
          <dt className="font-bold">Total estimatif</dt>
          <dd className="text-right text-base font-bold text-forest">{estimate.totalLabel}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-charcoal">
        {savedAt ? `Dernier enregistrement : ${savedAt}. ` : ""}
        Ton projet est sauvegardé uniquement sur cet appareil. Il n&apos;est pas transmis à LP LOCKS tant que tu ne
        l&apos;envoies pas.
      </p>
    </section>
  );
}
