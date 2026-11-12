import { formatFcfa } from "@/lib/format";
import { lineAmountLabel, type Estimate, type EstimateLine } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";

function Line({ line }: { line: EstimateLine }) {
  const multiply = line.unitPrice !== undefined && line.quantity !== undefined;
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <dt className="min-w-0">
        <span className="block font-semibold">{line.label}</span>
        {multiply && (
          <span className="mt-0.5 block text-sm text-charcoal">
            {formatFcfa(line.unitPrice!)} × {line.quantity}
          </span>
        )}
        {line.detail && <span className="mt-0.5 block text-sm text-charcoal">{line.detail}</span>}
      </dt>
      <dd className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className={line.amount === null ? "font-semibold text-charcoal" : "font-bold sm:whitespace-nowrap"}>{lineAmountLabel(line)}</span>
        {line.amount !== null && !line.confirmed && <Badge tone="warning">à confirmer</Badge>}
      </dd>
    </div>
  );
}

/** Détail de l'estimation : prestations, déplacement, total. */
export function EstimateTable({ estimate }: { estimate: Estimate }) {
  return (
    <div>
      <dl className="divide-y divide-line border-y border-line">
        {estimate.lines.map((line) => (
          <Line key={line.id} line={line} />
        ))}
        {estimate.travel && <Line line={estimate.travel} />}
      </dl>
      <div className="mt-4 rounded-card bg-mist p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="font-bold">Total estimatif</p>
          <p data-testid="total-estimatif" className="type-h3 text-forest">
            {estimate.totalLabel}
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-charcoal">{estimate.totalNote}</p>
      </div>
    </div>
  );
}
