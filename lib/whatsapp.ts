import { site } from "@/data/site";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Bonjour LP LOCKS,\n\nJe souhaite obtenir des informations concernant mon projet.\n\nMerci de me communiquer les disponibilités et les modalités de réservation.";

/**
 * Lien WhatsApp.
 * - Sans message : lien WhatsApp Business de LP LOCKS (boutons de contact).
 * - Avec message : lien vers le numéro avec le texte prérempli (accents et retours
 *   à la ligne encodés), car le lien Business ne peut pas transporter de texte.
 */
export function whatsappUrl(message?: string): string {
  if (message === undefined) return site.contact.whatsappChatUrl;
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Message prérempli à partir de lignes « Libellé : valeur » (les valeurs vides sont ignorées). */
export function buildProjectMessage(lines: Array<[label: string, value: string | null | undefined]>): string {
  const details = lines
    .filter(([, value]) => value && value.trim() !== "")
    .map(([label, value]) => `${label} : ${value}`)
    .join("\n");
  return [
    "Bonjour LP LOCKS,",
    "",
    "Je souhaite obtenir des informations concernant mon projet.",
    ...(details ? ["", details] : []),
    "",
    "Merci de me communiquer les disponibilités et les modalités de réservation.",
  ].join("\n");
}
