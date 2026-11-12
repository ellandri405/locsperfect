/** Règles de validation des formulaires (indépendantes de l'interface). */

export function validateName(value: string): string | null {
  const v = value.trim();
  if (v.length < 2) return "Indique ton nom.";
  if (v.length > 80) return "Ce nom est trop long (80 caractères maximum).";
  return null;
}

/** Accepte un numéro ivoirien à 10 chiffres ou un numéro international (8 à 15 chiffres). */
export function validatePhone(value: string): string | null {
  const digits = value.replace(/[\s().-]/g, "");
  if (digits === "") return "Indique ton numéro WhatsApp.";
  if (!/^\+?\d+$/.test(digits)) return "Le numéro ne doit contenir que des chiffres.";
  const count = digits.replace("+", "").length;
  if (digits.startsWith("+") || digits.startsWith("00")) {
    return count >= 8 && count <= 17 ? null : "Ce numéro international semble incomplet.";
  }
  return count === 10 ? null : "Saisis les 10 chiffres de ton numéro, par exemple 07 00 00 00 00.";
}

/** Date facultative ; si elle est renseignée, elle ne peut pas être passée. `today` au format AAAA-MM-JJ. */
export function validateFutureDate(value: string, today: string): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Cette date n'est pas valide.";
  return value < today ? "Choisis une date à venir." : null;
}

export function validateRequired(value: string, message: string): string | null {
  return value.trim() === "" ? message : null;
}

export function validateComment(value: string): string | null {
  return value.length > 600 ? "Ton commentaire est trop long (600 caractères maximum)." : null;
}

/** 2026-11-11 → « 11 novembre 2026 ». */
export function formatDateFr(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(y, m - 1, d));
}

export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
