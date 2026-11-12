import type { Price } from "@/types";

/** 25000 → « 25 000 FCFA » (espace insécable entre les milliers). */
export function formatFcfa(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}

/** Libellé lisible d'un tarif, « Sur devis » si le montant est inconnu. */
export function formatPrice(price: Price): string {
  if (price.amount === null) return "Sur devis";
  if (price.amountMax) {
    return `${new Intl.NumberFormat("fr-FR").format(price.amount)} à ${formatFcfa(price.amountMax)}`;
  }
  return `${price.from ? "À partir de " : ""}${formatFcfa(price.amount)}`;
}
