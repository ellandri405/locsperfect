import { cn } from "@/lib/cn";

interface ProgressStepsProps {
  steps: ReadonlyArray<{ id: string; label: string }>;
  /** Index de l'étape en cours (0 = première). */
  current: number;
  className?: string;
}

/** Barre de progression du configurateur. */
export function ProgressSteps({ steps, current, className }: ProgressStepsProps) {
  const percent = ((current + 1) / steps.length) * 100;
  return (
    <div className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="text-sm font-bold text-ink">
          Étape {current + 1} <span className="font-medium text-charcoal">sur {steps.length}</span>
        </p>
        <p className="text-sm font-semibold text-forest">{steps[current]?.label}</p>
      </div>
      <div
        role="progressbar"
        aria-label="Progression du projet"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={`Étape ${current + 1} sur ${steps.length} : ${steps[current]?.label}`}
        className="h-1.5 overflow-hidden rounded-full bg-mist"
      >
        <div
          className="h-full rounded-full bg-forest transition-[width] duration-700 ease-soft"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Liste complète des étapes, réservée aux lecteurs d'écran. */}
      <ol className="sr-only">
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={index === current ? "step" : undefined}
            className={cn(
              "flex-1 text-xs",
              index === current ? "font-bold text-ink" : index < current ? "text-forest" : "text-charcoal",
            )}
          >
            {step.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
