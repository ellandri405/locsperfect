import { getInspiration } from "@/data/inspirations";
import { needsLocality, summaryRows } from "./configurator";
import { lineAmountLabel, type Estimate } from "./pricing";
import type { ProjectDraft } from "./project-store";
import { formatDateFr } from "./validation";

export interface ContactDetails {
  name: string;
  phone: string;
  /** AAAA-MM-JJ ou chaîne vide. */
  date: string;
  comment: string;
  /** true si la cliente a ajouté une photo d'inspiration (à joindre elle-même dans WhatsApp). */
  hasPhoto: boolean;
}

/** Message WhatsApp complet du projet (texte brut ; l'encodage est fait par whatsappUrl). */
export function buildProjectSendMessage(draft: ProjectDraft, estimate: Estimate, contact: ContactDetails): string {
  const inspiration = getInspiration(draft.inspirationId);
  const choices = summaryRows(draft)
    .filter((row) => row.value)
    .map((row) => `${row.label} : ${row.value}`);
  const priced = [...estimate.lines, ...(estimate.travel ? [estimate.travel] : [])].map(
    (line) => `- ${line.label} : ${lineAmountLabel(line)}`,
  );

  return [
    "Bonjour LP LOCKS,",
    "",
    "Je souhaite obtenir des informations concernant mon projet.",
    "",
    `Nom : ${contact.name.trim()}`,
    `Numéro WhatsApp : ${contact.phone.trim()}`,
    "",
    "MON PROJET",
    ...choices,
    ...(inspiration ? [`Rendu choisi : ${inspiration.title}`] : []),
    ...(needsLocality(draft) && draft.locality ? [`Localité : ${draft.locality}`] : []),
    ...(contact.date ? [`Date souhaitée : ${formatDateFr(contact.date)}`] : []),
    ...(contact.comment.trim() ? [`Commentaire : ${contact.comment.trim()}`] : []),
    ...(contact.hasPhoto ? ["Photo d'inspiration : je la joins à ce message."] : []),
    "",
    "ESTIMATION INDICATIVE",
    ...priced,
    `Total estimatif : ${estimate.totalLabel}`,
    "",
    "Merci de me communiquer les disponibilités et les modalités de réservation.",
  ].join("\n");
}
