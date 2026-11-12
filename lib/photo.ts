/** Photo d'inspiration : formats et taille acceptés. La photo reste dans le navigateur. */
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 1400;

export function validatePhoto(file: { type: string; size: number }): string | null {
  if (!PHOTO_TYPES.includes(file.type)) return "Format non accepté. Choisis une image JPEG, PNG ou WebP.";
  if (file.size > PHOTO_MAX_BYTES) return "Cette image dépasse 5 Mo. Choisis-en une plus légère.";
  return null;
}

export interface PreparedPhoto {
  dataUrl: string;
  width: number;
  height: number;
  name: string;
}

/** Redimensionne et convertit la photo en JPEG (pour l'aperçu et le PDF). */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height, name: file.name };
}
