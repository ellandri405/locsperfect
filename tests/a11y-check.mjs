/**
 * Audit d'accessibilité automatisé (axe-core, règles WCAG 2.1 A et AA).
 * Usage : site lancé sur le port 3000, puis `npm run test:a11y`.
 * Un audit automatique ne détecte qu'une partie des problèmes : il ne remplace pas
 * un essai au clavier et au lecteur d'écran.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const draft = (step, patch = {}) => ({
  version: 2, step, projectType: "depart", technique: "peigne-instantane", extensions: "avec", startQuantity: "101-120",
  material: "naturelle", length: "20", color: "caramel", texture: null, thickness: "epaisse", style: null, strandQuantity: 50,
  inspirationId: "longue-caramel", compareIds: [null, null], locality: "Koumassi", updatedAt: new Date().toISOString(), ...patch,
});

const targets = [
  ...["/", "/services", "/catalogue", "/galerie", "/care", "/care/entretien-des-locks", "/faq", "/contact", "/legal", "/design-system", "/page-inexistante"].map((path) => ({ name: path, path })),
  { name: "configurateur étape 1", path: "/my-locks-design" },
  ...[1, 2, 3, 4, 5, 6].map((step) => ({ name: `configurateur étape ${step + 1}`, path: "/my-locks-design", draft: draft(step) })),
];

const browser = await chromium.launch();
let total = 0;
for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const target of targets) {
    await page.goto(BASE + target.path, { waitUntil: "networkidle" });
    if (target.draft) {
      await page.evaluate((d) => localStorage.setItem("lp-locks:projet", JSON.stringify(d)), target.draft);
      await page.reload({ waitUntil: "networkidle" });
    } else if (target.path === "/my-locks-design") {
      await page.evaluate(() => localStorage.removeItem("lp-locks:projet"));
      await page.reload({ waitUntil: "networkidle" });
    }
    // Défilement complet : les sections apparaissent progressivement.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += viewport.height / 2) await page.mouse.wheel(0, viewport.height / 2);
    await page.waitForTimeout(700);
    await page.addScriptTag({ content: axeSource });
    const { violations } = await page.evaluate(() => window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }));
    total += violations.length;
    const label = `${viewport.width}px ${target.name}`;
    if (violations.length === 0) console.log(`OK   ${label}`);
    for (const v of violations) {
      console.log(`FAIL ${label} — ${v.id} (${v.impact}) : ${v.help} [${v.nodes.length}]`);
      for (const node of v.nodes.slice(0, 2)) console.log(`       ${node.target.join(" ")} — ${(node.failureSummary ?? "").split("\n").slice(1, 2).join(" ").trim()}`);
    }
  }
  await context.close();
}
await browser.close();
console.log(total ? `\n${total} problème(s) d'accessibilité` : "\nAucun problème détecté par axe.");
process.exit(total ? 1 : 0);
