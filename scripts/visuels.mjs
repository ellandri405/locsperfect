/**
 * Recense les visuels déposés dans public/assets et écrit data/media-manifest.json.
 * Lancé automatiquement avant `npm run dev` et `npm run build`.
 *
 * Règle de nommage : le fichier porte le nom de son emplacement.
 *   emplacement « hero/hero-principal »  →  public/assets/hero/hero-principal.webp
 * Formats acceptés : .webp, .avif, .jpg, .jpeg, .png.
 *
 * Origine : toute image est considérée comme GÉNÉRÉE PAR IA et étiquetée ainsi sur le site,
 * sauf si son emplacement figure dans public/assets/photos-reelles.txt (un par ligne).
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "public", "assets");
const formats = [".avif", ".webp", ".jpg", ".jpeg", ".png"];

const realList = join(assets, "photos-reelles.txt");
const real = new Set(
  existsSync(realList)
    ? readFileSync(realList, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
    : [],
);

const manifest = {};
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== "brand") walk(path);
      continue;
    }
    const ext = extname(name).toLowerCase();
    if (!formats.includes(ext)) continue;
    const rel = relative(assets, path).split("\\").join("/");
    const slot = rel.slice(0, -ext.length);
    // Si plusieurs formats existent pour un même emplacement, le premier de la liste `formats` l'emporte.
    const current = manifest[slot];
    if (current && formats.indexOf(extname(current.src)) <= formats.indexOf(ext)) continue;
    manifest[slot] = { src: `/assets/${rel}`, origin: real.has(slot) ? "photo" : "ia" };
  }
};
walk(assets);

writeFileSync(join(root, "data", "media-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
const count = Object.keys(manifest).length;
console.log(`Visuels : ${count} image${count > 1 ? "s" : ""} recensée${count > 1 ? "s" : ""} (${Object.values(manifest).filter((m) => m.origin === "ia").length} générée(s) par IA).`);
