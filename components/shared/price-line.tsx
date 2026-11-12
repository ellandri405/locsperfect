import type { Price } from "@/types";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

/**
 * Ligne de tarif. Un tarif non validé par LP LOCKS est toujours accompagné
 * de la mention « à confirmer » : il n'est jamais présenté comme définitif.
 */
export function PriceLine({ price, label }: { price: Price; label?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5">
      <dt className="text-[0.9375rem] text-ink">{label ?? price.label}</dt>
      <dd className="flex items-center gap-2 text-right">
        <span className="text-[0.9375rem] font-bold whitespace-nowrap">{formatPrice(price)}</span>
        {price.amount !== null && price.status !== "valide" && <Badge tone="warning">à confirmer</Badge>}
      </dd>
    </div>
  );
}

export function PriceList({ prices }: { prices: Price[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {prices.map((price) => (
        <PriceLine key={price.id} price={price} />
      ))}
    </dl>
  );
}
