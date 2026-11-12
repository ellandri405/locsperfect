import { getInspiration } from "@/data/inspirations";
import { site } from "@/data/site";
import { needsLocality, summaryRows } from "./configurator";
import { lineAmountLabel, type Estimate } from "./pricing";
import type { ContactDetails } from "./project-message";
import type { ProjectDraft } from "./project-store";
import { formatFcfa } from "./format";
import { formatDateFr } from "./validation";

/**
 * Génération du récapitulatif PDF, entièrement dans le navigateur (jsPDF).
 * Aucune donnée ne quitte l'appareil de la cliente.
 * La photo d'inspiration de la cliente n'est volontairement PAS intégrée au PDF (demande de LP LOCKS).
 */

export const PDF_NOTICE = "Estimation indicative, sous réserve de confirmation par LP LOCKS.";

/** Les polices standard du PDF ne connaissent pas certains caractères typographiques : on les remplace. */
function clean(text: string): string {
  return text
    .replace(/[  ]/g, " ")
    .replace(/[—–]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/″/g, " po")
    .replace(/…/g, "...")
    .replace(/œ/g, "oe");
}

async function toDataUrl(src: string): Promise<string | null> {
  try {
    const blob = await (await fetch(src)).blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface PdfInput {
  draft: ProjectDraft;
  estimate: Estimate;
  contact: ContactDetails;
  /** Date de création (injectable pour les tests). */
  now?: Date;
}

export async function generateProjectPdf({ draft, estimate, contact, now = new Date() }: PdfInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 18;
  const right = 210 - M;
  const bottom = 297 - M;

  type Rgb = [number, number, number];
  const forest: Rgb = [23, 71, 52];
  const ink: Rgb = [17, 17, 17];
  const grey: Rgb = [65, 72, 68];
  type TextOptions = { bold?: boolean; color?: Rgb; align?: "left" | "right"; maxWidth?: number };

  /**
   * Écrit un texte à la position donnée et renvoie le nombre de lignes occupées.
   * La position verticale est toujours passée en paramètre : chaque bloc ci-dessous
   * reçoit sa position et renvoie la suivante, sans état caché.
   */
  const write = (value: string, x: number, y: number, size: number, opts: TextOptions = {}): number => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? ink));
    const lines = doc.splitTextToSize(clean(value), opts.maxWidth ?? right - M) as string[];
    doc.text(lines, x, y, { align: opts.align ?? "left" });
    return lines.length;
  };
  /** Passe à la page suivante si le bloc ne tient pas ; renvoie la position où écrire. */
  const fit = (y: number, needed: number): number => {
    if (y + needed <= bottom) return y;
    doc.addPage();
    return M;
  };
  const heading = (title: string, y: number): number => {
    const top = fit(y, 18) + 4;
    write(title.toUpperCase(), M, top, 9, { bold: true, color: forest });
    doc.setDrawColor(...forest);
    doc.setLineWidth(0.3);
    doc.line(M, top + 2.5, right, top + 2.5);
    return top + 7.5;
  };
  const row = (label: string, value: string, y: number, detail?: string): number => {
    const top = fit(y, detail ? 14 : 9);
    const labelLines = write(label, M, top, 10.5, { maxWidth: 95 });
    const valueLines = write(value, right, top, 10.5, { bold: true, align: "right", maxWidth: 72 });
    // La hauteur suit le plus long des deux textes (une valeur peut tenir sur plusieurs lignes).
    let next = top + 5 * Math.max(labelLines, valueLines);
    if (detail) {
      const detailLines = write(detail, M, next - 0.5, 8.5, { color: grey, maxWidth: 120 });
      next += 4 * detailLines;
    }
    return next + 1;
  };
  const paragraph = (value: string, y: number, size: number, opts: TextOptions = {}): number => {
    const top = fit(y, 6);
    const lines = write(value, M, top, size, opts);
    return top + lines * size * 0.48;
  };

  // En-tête : logo, nom, date.
  const logo = await toDataUrl(site.logo.onLight);
  if (logo) doc.addImage(logo, "PNG", M, M, 20, 20);
  write(site.name, M + 25, M + 8, 16, { bold: true });
  write("MY LOCKS DESIGN - Récapitulatif de projet", M + 25, M + 14, 10, { color: grey });
  write(`Créé le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(now)}`, right, M + 8, 9, { color: grey, align: "right" });
  let y = M + 25;

  y = heading("Coordonnées", y);
  y = row("Nom", contact.name.trim(), y);
  y = row("Numéro WhatsApp", contact.phone.trim(), y);
  if (needsLocality(draft) && draft.locality) y = row("Localité", draft.locality, y);
  if (contact.date) y = row("Date souhaitée", formatDateFr(contact.date), y);

  y = heading("Choix de personnalisation", y);
  for (const item of summaryRows(draft)) y = row(item.label, item.value ?? "Non précisé", y);
  const inspiration = getInspiration(draft.inspirationId);
  if (inspiration) y = row("Rendu choisi", inspiration.title, y);
  if (contact.comment.trim()) {
    y = fit(y, 16);
    write("Commentaire", M, y, 10.5);
    y = paragraph(contact.comment.trim(), y + 5, 9.5, { color: grey }) + 2;
  }

  y = heading("Estimation", y);
  for (const line of [...estimate.lines, ...(estimate.travel ? [estimate.travel] : [])]) {
    const unit = line.unitPrice !== undefined && line.quantity !== undefined ? `${formatFcfa(line.unitPrice)} x ${line.quantity}` : null;
    const pending = !line.confirmed && line.amount !== null ? "tarif à confirmer" : null;
    y = row(line.label, lineAmountLabel(line), y, [unit, line.detail, pending].filter(Boolean).join(" - ") || undefined);
  }

  // Encadré du total.
  y = fit(y, 40) + 2;
  doc.setFillColor(233, 240, 233);
  doc.roundedRect(M, y, right - M, 14, 2.5, 2.5, "F");
  write("Total estimatif", M + 4, y + 9, 12, { bold: true });
  write(estimate.totalLabel, right - 4, y + 9, 12, { bold: true, color: forest, align: "right", maxWidth: 110 });
  y += 19;
  y = paragraph(estimate.totalNote, y, 9, { color: grey }) + 1.5;
  y = paragraph(PDF_NOTICE, y, 9, { bold: true }) + 1.5;
  y = paragraph("Ce document n'est pas une réservation : le rendez-vous est confirmé par LP LOCKS.", y, 9, { color: grey }) + 2;

  // Coordonnées de LP LOCKS : une ligne compacte, pour que le récapitulatif tienne sur une page.
  y = fit(y, 10) + 3;
  doc.setDrawColor(...forest);
  doc.setLineWidth(0.3);
  doc.line(M, y, right, y);
  write(
    `${site.name}  ·  WhatsApp ${site.contact.whatsappDisplay}  ·  Instagram @${site.contact.instagramHandle}  ·  ${site.city}, ${site.country}`,
    M,
    y + 6,
    9.5,
    { bold: true, color: forest },
  );

  return doc.output("blob");
}

export function pdfFileName(now = new Date()): string {
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `lp-locks-projet-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.pdf`;
}
