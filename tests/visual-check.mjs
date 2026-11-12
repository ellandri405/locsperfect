/**
 * Vérification du rendu et des interactions principales (Playwright).
 * Usage : lancer le site (npm run build && npm run start), puis
 *   node tests/visual-check.mjs [dossier-de-captures]
 * Le script échoue (code 1) si une vérification n'est pas satisfaite.
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";

// Playwright peut être installé globalement : on le charge via require.
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.argv[2] ?? "tests/captures";
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "petit-mobile", width: 320, height: 640 },
  { name: "mobile", width: 390, height: 844 },
  { name: "grand-mobile", width: 430, height: 932 },
  { name: "tablette", width: 820, height: 1180 },
  { name: "portable", width: 1366, height: 768 },
  { name: "grand-ecran", width: 1920, height: 1080 },
];
const pages = ["/", "/my-locks-design", "/design-system", "/services", "/catalogue", "/galerie", "/care", "/care/entretien-des-locks", "/faq", "/contact", "/legal"];

// Les montants utilisent des espaces insécables (25 000) : on les normalise pour comparer.
const norm = (t) => t.replace(/[\u202f\u00a0]/g, " ");
const failures = [];
const check = (ok, label) => {
  console.log(`${ok ? "OK  " : "FAIL"} ${label}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch();

// 1. Débordement horizontal + erreurs console, sur toutes les tailles.
for (const vp of viewports) {
  const context = await browser.newContext({ viewport: vp, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    check(overflow <= 0, `${vp.name} ${path} — pas de débordement horizontal (${overflow}px)`);
    if (["mobile", "portable"].includes(vp.name)) {
      const slug = path === "/" ? "accueil" : path.slice(1).replaceAll("/", "-");
      // Défilement complet pour déclencher les apparitions progressives avant la capture.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += vp.height / 2) {
        await page.mouse.wheel(0, vp.height / 2);
        await page.waitForTimeout(120);
      }
      await page.waitForTimeout(900);
      const hidden = await page.evaluate(
        () => [...document.querySelectorAll("main *:not(svg):not(input[type=range])")].filter((el) => getComputedStyle(el).opacity === "0" && !el.closest("[inert]")).length,
      );
      check(hidden === 0, `${vp.name} ${path} — tout le contenu est visible après défilement (${hidden} masqué)`);
      await page.screenshot({ path: `${OUT}/${slug}-${vp.name}.png`, fullPage: true });
    }
  }
  check(errors.length === 0, `${vp.name} — aucune erreur console ${errors.join(" | ")}`);
  await context.close();
}

// 2. Menu mobile.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  const link = page.getByRole("navigation", { name: "Navigation mobile" }).getByRole("link", { name: /MY LOCKS DESIGN/ });
  await link.waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/menu-mobile.png` });
  await link.click();
  await page.waitForURL("**/my-locks-design");
  check(true, "menu mobile — ouverture puis navigation vers MY LOCKS DESIGN");
  check(
    await page.getByRole("button", { name: "Ouvrir le menu" }).isVisible(),
    "menu mobile — refermé après navigation",
  );
  await context.close();
}

// 3. Accueil : liens d'action et WhatsApp.
{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const wa = await page.getByRole("link", { name: /WhatsApp/ }).first().getAttribute("href");
  check(wa === "https://wa.me/message/YHAD5F6YRWM2C1", `WhatsApp — bouton de contact : lien Business de LP LOCKS (${wa})`);
  const allWa = await page.locator('a[href*="wa.me"]').evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  check(allWa.length >= 3 && allWa.every((h) => h === "https://wa.me/message/YHAD5F6YRWM2C1"), `WhatsApp — tous les liens de contact de l'accueil (${allWa.length})`);
  // Sélecteurs de la section MY LOCKS DESIGN.
  await page.getByRole("radio", { name: /20 pouces/ }).check({ force: true });
  await page.getByRole("radio", { name: "Caramel" }).check({ force: true });
  const recap = page.locator("[aria-live=polite]", { hasText: "Ton style" });
  await page.waitForTimeout(500);
  const text = await recap.innerText();
  check(text.includes("20 pouces · 51 cm") && text.includes("Caramel"), "accueil — sélecteurs synchronisés avec l'aperçu");
  await page.getByRole("link", { name: "Personnaliser mes locks" }).click();
  await page.waitForURL("**/my-locks-design");
  check(true, "accueil — bouton « Personnaliser mes locks »");
  await context.close();
}

// 4. Configurateur, étape 1 : sélection, validation, sauvegarde locale, réinitialisation.
const visible = (page, role, name) => page.getByRole(role, { name }).and(page.locator(":visible"));
const recapText = async (page, vp) => {
  if (vp.width >= 1024) return norm(await page.getByRole("region", { name: "Mon projet" }).innerText());
  await page.getByRole("button", { name: /Voir mon projet/i }).click();
  const text = norm(await page.getByRole("dialog").innerText());
  await page.getByRole("dialog").getByRole("button", { name: "Fermer", exact: true }).click();
  return text;
};
// On clique la carte (le <label>) comme le ferait une cliente : le bouton radio lui-même est masqué visuellement.
const pick = (page, name) => page.getByRole("radio", { name }).locator("xpath=..").click();
const pickValue = (page, group, value) => page.locator(`input[name="${group}"][value="${value}"]`).locator("xpath=..").click();
const next = async (page) => {
  await visible(page, "button", /^(Continuer|Envoyer mon projet)$/).click();
  await page.waitForTimeout(500);
};
const stepIs = async (page, n) => (await page.getByRole("progressbar").getAttribute("aria-valuenow")) === String(n);

for (const vp of [viewports[1], viewports[4]]) {
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  const tag = `configurateur ${vp.name}`;
  await page.goto(BASE + "/my-locks-design", { waitUntil: "networkidle" });
  await next(page);
  check(await page.getByText("Choisis un type de projet pour continuer.").isVisible(), `${tag} — étape 1 obligatoire contrôlée`);
  check(await stepIs(page, 1), `${tag} — reste à l'étape 1 sans choix`);

  for (const label of ["Départ de locks durables", "Achat de locks", "Locks temporaires"]) {
    await pick(page, new RegExp(label));
    check((await recapText(page, vp)).includes(label), `${tag} — « ${label} » sélectionnable, récapitulatif synchronisé`);
  }
  check(await page.getByText("La pose de locks temporaires nécessite des extensions.").isVisible(), `${tag} — mention obligatoire sur les extensions`);
  const adapted = page.locator("li", { hasText: /Extensions fournies ou apportées\s*·\s*obligatoire/ });
  check((await adapted.count()) === 1 && (await adapted.isVisible()), `${tag} — options adaptées au projet`);

  await page.reload({ waitUntil: "networkidle" });
  check(await page.getByRole("radio", { name: /Locks temporaires/ }).isChecked(), `${tag} — choix restauré après rechargement`);

  if (vp.width >= 1024) await page.getByRole("button", { name: "Recommencer" }).click();
  else {
    await page.getByRole("button", { name: /Voir mon projet/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Recommencer" }).click();
  }
  await page.getByRole("button", { name: "Oui, recommencer" }).click();
  check(!(await page.getByRole("radio", { name: /Locks temporaires/ }).isChecked()), `${tag} — réinitialisation`);
  check((await page.evaluate(() => localStorage.getItem("lp-locks:projet"))) === null, `${tag} — sauvegarde locale effacée`);
  await context.close();
}

// 4 bis. Configurateur : parcours complet « départ de locks » (mobile et ordinateur).
for (const vp of [viewports[1], viewports[4]]) {
  const context = await browser.newContext({ viewport: vp, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const tag = `parcours départ ${vp.name}`;
  await page.goto(BASE + "/my-locks-design", { waitUntil: "networkidle" });
  await pick(page, /Départ de locks durables/);
  await next(page);
  check(await stepIs(page, 2), `${tag} — passage à l'étape 2`);
  check((await page.getByRole("heading", { level: 2, name: "Matière" }).count()) === 0, `${tag} — matière masquée tant que les extensions ne sont pas choisies`);

  await next(page);
  check(await stepIs(page, 2) && (await page.getByText("Ce choix est nécessaire pour continuer.").count()) === 3, `${tag} — 3 choix obligatoires signalés`);

  await pick(page, /Instantané base peigne/);
  await pick(page, /81 à 100 locks/);
  await pick(page, /Sans extensions/);
  check(await page.getByText(/Sans extensions, la longueur est celle de tes cheveux/).isVisible(), `${tag} — incompatibilité expliquée (sans extensions)`);
  check((await recapText(page, vp)).includes("34 000 FCFA"), `${tag} — grille : peigne, 81 à 100 locks = 34 000 FCFA`);

  await pick(page, /Avec extensions/);
  check(await page.getByRole("heading", { level: 2, name: "Matière" }).isVisible(), `${tag} — matière affichée avec extensions`);
  await next(page);
  check(await stepIs(page, 2), `${tag} — matière et longueur deviennent obligatoires`);
  await pickValue(page, "matiere", "naturelle");
  await pick(page, /20 pouces/);
  await pick(page, "Caramel");
  await pickValue(page, "epaisseur", "epaisse");
  await page.waitForTimeout(900);
  if (vp.width >= 1024) {
    const title = await page.getByTestId("apercu-titre").innerText();
    check(/longues, caramel/.test(title), `${tag} — aperçu actualisé selon longueur et couleur (${title})`);
  }
  await page.screenshot({ path: `${OUT}/configurateur-etape2-${vp.name}.png`, fullPage: vp.width > 1000 });

  await next(page);
  check(await stepIs(page, 3), `${tag} — étape 3 (inspirations)`);
  const first = page.locator("main ul button[aria-pressed]").first();
  check(/longues, caramel/.test(await first.innerText()), `${tag} — inspiration la plus proche proposée en premier`);
  await first.click();
  check((await first.getAttribute("aria-pressed")) === "true", `${tag} — inspiration sélectionnable`);
  await page.screenshot({ path: `${OUT}/configurateur-etape3-${vp.name}.png` });

  await next(page);
  check(await stepIs(page, 4), `${tag} — étape 4 (comparateur)`);
  check((await page.getByRole("region", { name: /Proposition/ }).count()) === 2, `${tag} — deux propositions côte à côte`);
  const boxes = await Promise.all([0, 1].map((i) => page.getByRole("region", { name: /Proposition/ }).nth(i).boundingBox()));
  check(Math.abs(boxes[0].y - boxes[1].y) < 4 && boxes[1].x > boxes[0].x, `${tag} — affichage côte à côte`);
  await page.getByLabel("Inspiration B").selectOption({ index: 5 });
  await page.getByRole("region", { name: "Proposition B" }).getByRole("button", { name: "Choisir ce style" }).click();
  check(await page.getByRole("region", { name: "Proposition B" }).getByRole("button", { name: "Style choisi" }).isVisible(), `${tag} — « Choisir ce style »`);
  await page.screenshot({ path: `${OUT}/configurateur-etape4-${vp.name}.png` });

  await next(page);
  check(await stepIs(page, 5), `${tag} — étape 5 (récapitulatif)`);
  await next(page);
  check(await stepIs(page, 5) && (await page.getByText(/Choisis ta localité pour estimer/).isVisible()), `${tag} — localité obligatoire`);
  await page.getByLabel("Localité").selectOption("Koumassi");
  check(norm(await page.locator("#champ-locality").innerText()).includes("Zone 4 — frais de déplacement : 6 000 FCFA."), `${tag} — zone identifiée et frais affichés`);
  check(norm(await page.getByTestId("total-estimatif").innerText()) === "De 137 200 à 160 000 FCFA", `${tag} — total : 34 000 + 6 000 + 1 200 × (81 à 100 locks)`);

  // Modifier un choix depuis le récapitulatif, puis revenir : les autres choix sont conservés.
  await page.getByRole("button", { name: "Modifier : Nombre de locks" }).click();
  await page.waitForTimeout(500);
  check(await stepIs(page, 2) && (await page.getByRole("radio", { name: /Instantané base peigne/ }).isChecked()), `${tag} — « Modifier » ramène à l'étape 2, choix conservés`);
  await pick(page, /101 à 120 locks/);
  for (let i = 0; i < 3; i++) await next(page);
  check(await stepIs(page, 5), `${tag} — retour au récapitulatif`);
  check(norm(await page.getByTestId("total-estimatif").innerText()) === "De 168 200 à 191 000 FCFA", `${tag} — total recalculé : 41 000 + 6 000 + 1 200 × (101 à 120 locks)`);

  await next(page);
  check(await stepIs(page, 6), `${tag} — étape 6 (estimation)`);
  const est = norm(await page.locator("main").innerText());
  check(est.includes("Départ de locks — Instantané base peigne") && est.includes("41 000 FCFA") && est.includes("1 200 FCFA la mèche × 101 à 120 locks") && est.includes("De 121 200 à 144 000 FCFA") && est.includes("Frais de déplacement"), `${tag} — détail de l'estimation`);
  await page.screenshot({ path: `${OUT}/configurateur-etape6-${vp.name}.png`, fullPage: vp.width > 1000 });

  await next(page);
  check(await stepIs(page, 7), `${tag} — étape 7 (envoi)`);
  await page.getByRole("button", { name: "Télécharger mon récapitulatif PDF" }).click();
  check(await page.getByText("Indique ton nom.").isVisible(), `${tag} — coordonnées exigées avant le PDF`);
  await page.getByLabel("Nom").fill("Aïcha Koné");
  await page.getByLabel("Numéro WhatsApp").fill("07 99 33 16 86");
  await page.getByLabel(/Date souhaitée/).fill("2030-06-15");
  await page.getByLabel(/Commentaire/).fill("Couleur caramel & pointes plus claires ?");

  // Photo d'inspiration : refus d'un fichier non accepté, puis ajout d'une image.
  await page.locator("#photo-inspiration").setInputFiles({ name: "notes.pdf", mimeType: "application/pdf", buffer: Buffer.from("x") });
  check(await page.getByText(/Format non accepté/).isVisible(), `${tag} — photo : format non accepté refusé`);
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 300; c.height = 400;
    const g = c.getContext("2d"); g.fillStyle = "#174734"; g.fillRect(0, 0, 300, 400);
    return c.toDataURL("image/png").split(",")[1];
  });
  await page.locator("#photo-inspiration").setInputFiles({ name: "inspiration.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await page.getByAltText("Aperçu de ta photo d'inspiration").waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  check(await page.getByAltText("Aperçu de ta photo d'inspiration").isVisible(), `${tag} — photo : aperçu affiché`);

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Télécharger mon récapitulatif PDF" }).click()]);
  const pdfPath = `${OUT}/recapitulatif-${vp.name}.pdf`;
  await download.saveAs(pdfPath);
  const pdf = readFileSync(pdfPath);
  const body = pdf.toString("latin1");
  check(/^lp-locks-projet-\d{4}-\d{2}-\d{2}\.pdf$/.test(download.suggestedFilename()), `${tag} — PDF téléchargé (${download.suggestedFilename()})`);
  check(body.startsWith("%PDF-") && pdf.length > 20000, `${tag} — PDF valide (${Math.round(pdf.length / 1024)} Ko)`);
  for (const [label, needle] of [
    ["nom de la marque", "LP LOCKS"], ["choix (technique)", "Instantan"], ["montant de la prestation", "41 000 FCFA"],
    ["frais de déplacement", "6 000 FCFA"], ["extensions", "De 121 200"], ["total identique au récapitulatif", "De 168 200"],
    ["mention d'estimation indicative", "Estimation indicative, sous r"], ["coordonnées", "+225 07 99 33 16 86"], ["nom de la cliente", "cha Kon"],
  ]) check(body.includes(needle), `${tag} — PDF : ${label}`);
  check(/\/Subtype\s*\/Image/.test(body), `${tag} — PDF : logo intégré`);
  check(!body.includes("/DCTDecode"), `${tag} — PDF : photo de la cliente absente (aucune image JPEG)`);

  // WhatsApp n'est pas joignable depuis l'environnement de test : on intercepte l'ouverture pour lire l'adresse.
  await page.evaluate(() => { window.open = (u) => { window.__wa = String(u); return null; }; });
  await page.getByRole("button", { name: "Envoyer mon projet sur WhatsApp" }).click();
  const url = await page.evaluate(() => window.__wa ?? "");
  check(url.startsWith("https://wa.me/2250799331686?text="), `${tag} — WhatsApp ouvert sur le bon numéro`);
  const msg = norm(decodeURIComponent(url.split("text=")[1] ?? ""));
  check(
    ["Nom : Aïcha Koné", "Type de projet : Départ de locks durables", "Technique : Instantané base peigne", "Nombre de locks : 101 à 120 locks", "Matière : Naturelle", "Longueur : 20 pouces (51 cm)", "Couleur : Caramel", "Localité : Koumassi", "Date souhaitée : 15 juin 2030", "caramel & pointes plus claires ?", "Extensions — naturelle, 20 pouces : De 121 200 à 144 000 FCFA", "Total estimatif : De 168 200 à 191 000 FCFA", "je la joins"].every((t) => msg.includes(t)),
    `${tag} — message WhatsApp : tous les choix et l'estimation transmis`,
  );
  check(await page.getByText(/n'est pas une\s+réservation/).first().isVisible(), `${tag} — aucune fausse confirmation de réservation`);
  const saved = await page.evaluate(() => localStorage.getItem("lp-locks:projet"));
  check(!saved.includes("Aïcha") && !saved.includes("0799") && !saved.includes("07 99"), `${tag} — coordonnées non enregistrées sur l'appareil`);

  await page.reload({ waitUntil: "networkidle" });
  check(await stepIs(page, 7), `${tag} — reprise du projet à la même étape après rechargement`);
  await page.getByRole("button", { name: "Modifier mes choix" }).click();
  await page.waitForTimeout(500);
  check(await stepIs(page, 5), `${tag} — « Modifier mes choix »`);
  check(errors.length === 0, `${tag} — aucune erreur JavaScript ${errors.join(" | ")}`);
  await context.close();
}

// 4 ter. Configurateur : locks temporaires et achat (règles tarifaires).
{
  const context = await browser.newContext({ viewport: viewports[4] });
  const page = await context.newPage();
  await page.goto(BASE + "/my-locks-design", { waitUntil: "networkidle" });
  await pick(page, /Locks temporaires/);
  await next(page);
  check((await page.locator("main section[id^=champ-]").count()) === 1 && (await page.getByText("La pose de locks temporaires nécessite des extensions.").first().isVisible()), "temporaires — d'abord la provenance des extensions (obligatoires)");
  await pick(page, /Je viens avec mes extensions/);
  check((await page.getByRole("heading", { level: 2, name: "Base de la pose" }).count()) === 0 && (await page.getByRole("heading", { level: 2, name: "Matière" }).count()) === 0, "temporaires — extensions apportées : ni base ni matière à choisir");
  check(norm(await recapText(page, viewports[4])).includes("15 000 FCFA"), "temporaires — pose simple à 15 000 FCFA");
  await pick(page, /Extensions fournies par LP LOCKS/);
  check((await page.getByRole("heading", { level: 2, name: "Base de la pose" }).count()) === 1, "temporaires — extensions fournies : choix de la base");
  check((await page.locator('input[name="technique"]').count()) === 2, "temporaires — deux bases proposées (crochet, peigne)");
  await pick(page, /Base au crochet/);
  await pick(page, /^Synthétique/);
  await pick(page, /24 à 30 pouces/);
  check(await page.getByText("De 24 à 30 pouces, le tarif est sur devis.").isVisible(), "temporaires — longueur sur devis identifiée");
  await next(page);
  check(await stepIs(page, 2), "temporaires — nombre de locks obligatoire");
  await pick(page, /60 à 80 locks/);
  for (let i = 0; i < 3; i++) await next(page);
  await page.getByLabel("Localité").selectOption("Yopougon");
  check(norm(await page.locator("#champ-locality").innerText()).includes("Zone 5 — frais de déplacement sur devis"), "temporaires — zone 5 : frais sur devis");
  check(norm(await page.getByTestId("total-estimatif").innerText()) === "À partir de 30 000 FCFA", "temporaires — pose 25 000 + 5 000 de supplément ; extensions et déplacement sur devis, non additionnés");
  // Longueur chiffrable : extensions synthétiques = 100 FCFA × 60 à 80 locks, en « à partir de ».
  await page.getByRole("button", { name: "Modifier : Longueur" }).click();
  await page.waitForTimeout(500);
  await pickValue(page, "longueur", "12");
  for (let i = 0; i < 3; i++) await next(page);
  await page.getByLabel("Localité").selectOption("Riviera 2");
  check(norm(await page.getByTestId("total-estimatif").innerText()) === "À partir de 40 000 FCFA", "temporaires — pose 30 000 + extensions 100 FCFA × 60 locks + déplacement 4 000");
  await page.getByRole("button", { name: "Modifier : Base de la pose" }).click();
  await page.waitForTimeout(500);
  await pick(page, /Base au peigne/);
  await pick(page, /101 à 120 locks/);
  await pickValue(page, "matiere", "naturelle");
  for (let i = 0; i < 3; i++) await next(page);
  check(norm(await page.getByTestId("total-estimatif").innerText()) === "De 122 700 à 136 000 FCFA", "temporaires — peigne 41 000 + 7 000 de supplément + 700 FCFA × (101 à 120 locks) + déplacement 4 000");
  await page.getByRole("button", { name: "Modifier : Extensions" }).click();
  await page.waitForTimeout(500);
  await pick(page, /Je viens avec mes extensions/);
  for (let i = 0; i < 3; i++) await next(page);
  check(norm(await page.getByTestId("total-estimatif").innerText()) === "19 000 FCFA", "temporaires — avec ses extensions : pose simple 15 000 + déplacement 4 000");

  await page.getByRole("button", { name: "Modifier : Type de projet" }).click();
  await page.waitForTimeout(500);
  await pick(page, /Achat de locks/);
  await next(page);
  check(await page.getByRole("heading", { level: 2, name: "Nombre de mèches" }).isVisible(), "achat — sélecteur de nombre de mèches");
  await pickValue(page, "matiere", "naturelle");
  await pickValue(page, "longueur", "12");
  await page.getByRole("spinbutton", { name: "Nombre de mèches" }).fill("60");
  for (let i = 0; i < 3; i++) await next(page);
  check((await page.getByLabel("Localité").count()) === 0, "achat — pas de frais de déplacement");
  check(norm(await page.getByTestId("total-estimatif").innerText()) === "42 000 FCFA", "achat — 60 mèches × 700 FCFA = 42 000 FCFA");
  check(norm(await page.locator("main").innerText()).includes("700 FCFA × 60"), "achat — prix unitaire et quantité affichés");
  await context.close();
}

// 5. Design system : modale (Échap) et accordéon au clavier.
{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.goto(BASE + "/design-system", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ouvrir une modale" }).click();
  const dialog = page.getByRole("dialog");
  check(await dialog.isVisible(), "modale — ouverture");
  await page.keyboard.press("Escape");
  check(!(await dialog.isVisible()), "modale — fermeture avec Échap");
  const q = page.getByRole("button", { name: "Peut-on commencer des locks sans extensions ?" });
  await q.focus();
  await page.keyboard.press("Enter");
  check((await q.getAttribute("aria-expanded")) === "true", "accordéon — ouverture au clavier");
  // Navigation clavier dans un groupe de sélecteurs.
  await page.getByRole("radio", { name: "12 pouces, 30 cm" }).focus();
  await page.keyboard.press("ArrowRight");
  check(await page.getByRole("radio", { name: "14 pouces, 36 cm" }).isChecked(), "sélecteur de longueur — flèches du clavier");
  await context.close();
}


// 6. Services : grille tarifaire, zones, présélection du projet.
{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.goto(BASE + "/services", { waitUntil: "networkidle" });
  const rows = (await page.locator("#depart table tbody tr").allInnerTexts()).map((t) => norm(t).replace(/\s+/g, " "));
  check(rows[0] === "Instantané au crochet 25 000 FCFA 30 000 FCFA 35 000 FCFA", `services — grille crochet (${rows[0]})`);
  check(rows[1] === "Instantané base peigne 27 000 FCFA 34 000 FCFA 41 000 FCFA", `services — grille base peigne (${rows[1]})`);
  const tempRows = (await page.locator("#temporaire table tbody tr").allInnerTexts()).map((t) => norm(t).replace(/\s+/g, " "));
  check(tempRows[0] === "Base au crochet 30 000 FCFA 35 000 FCFA 40 000 FCFA" && tempRows[1] === "Base au peigne 34 000 FCFA 41 000 FCFA 48 000 FCFA", `services — pose temporaire : grille + supplément (${tempRows.join(" | ")})`);
  check(norm(await page.locator("#temporaire").innerText()).replace(/\s+/g, " ").includes("tu viens avec tes extensions 15 000 FCFA"), "services — pose simple à 15 000 FCFA, validée");
  check(await page.locator("#depart").getByText("Au-delà de 120 locks : sur devis.", { exact: true }).isVisible(), "services — au-delà de 120 locks : sur devis");
  const zones = norm(await page.locator("#deplacement").innerText());
  check(/Zone 3\s+5 000 FCFA/.test(zones) && /Zone 4\s+6 000 FCFA/.test(zones) && /Zone 5\s+Sur devis/.test(zones), "services — zones 3 (5 000), 4 (6 000) et 5 (sur devis)");
  await page.getByRole("button", { name: "Créer mes locks temporaires" }).click();
  await page.waitForURL("**/my-locks-design");
  check(await page.getByRole("radio", { name: /Locks temporaires/ }).isChecked(), "services — projet présélectionné dans le configurateur");
  await context.close();
}

// 7. Catalogue : filtres et tri.
{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.goto(BASE + "/catalogue", { waitUntil: "networkidle" });
  const cards = page.locator("article");
  check((await cards.count()) === 13, `catalogue — 13 produits affichés (${await cards.count()})`);
  await page.getByRole("button", { name: /^Naturelle/ }).click();
  await page.waitForTimeout(600);
  check((await cards.count()) === 10, `catalogue — filtre matière « Naturelle » (${await cards.count()})`);
  await page.getByLabel("Prix par mèche").selectOption("500");
  await page.waitForTimeout(600);
  check((await cards.count()) === 2, `catalogue — filtre prix ≤ 500 FCFA (${await cards.count()})`);
  await page.getByLabel("Trier par").selectOption("prix-decroissant");
  await page.waitForTimeout(600);
  check(norm(await cards.first().innerText()).includes("500 FCFA"), "catalogue — tri par prix décroissant");
  await page.getByLabel("Longueur").selectOption("20");
  await page.waitForTimeout(600);
  check(await page.getByText("Aucun produit ne correspond à ces filtres.").isVisible(), "catalogue — état vide expliqué");
  await page.getByRole("button", { name: "Effacer les filtres" }).first().click();
  await page.waitForTimeout(600);
  check((await cards.count()) === 13, "catalogue — effacement des filtres");
  await page.getByLabel("Trier par").selectOption("longueur");
  await page.waitForTimeout(600);
  const href = await cards.first().getByRole("link", { name: /Commander/ }).getAttribute("href");
  const msg = norm(decodeURIComponent(href.split("text=")[1]));
  check(href.startsWith("https://wa.me/2250799331686") && msg.includes("Produit : Lock naturelle 6 pouces") && msg.includes("400 FCFA"), "catalogue — message WhatsApp prérempli avec le produit");
  await context.close();
}

// 8. Galerie : filtre, grand format, navigation clavier.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE + "/galerie", { waitUntil: "networkidle" });
  const tiles = page.locator("main ul button");
  check((await tiles.count()) === 12, "galerie — 12 visuels");
  await page.getByRole("button", { name: /Locks colorées/ }).click();
  await page.waitForTimeout(600);
  check((await tiles.count()) === 3, `galerie — filtre « Locks colorées » (${await tiles.count()})`);
  await tiles.first().click();
  const dialog = page.getByRole("dialog");
  check(await dialog.isVisible(), "galerie — affichage grand format");
  check((await dialog.innerText()).includes("1 / 3"), "galerie — compteur");
  await page.keyboard.press("ArrowRight");
  check((await dialog.innerText()).includes("2 / 3"), "galerie — navigation au clavier");
  await dialog.getByRole("button", { name: "Visuel précédent" }).click();
  check((await dialog.innerText()).includes("1 / 3"), "galerie — bouton précédent");
  await page.screenshot({ path: `${OUT}/galerie-grand-format-mobile.png` });
  await page.keyboard.press("Escape");
  check(!(await dialog.isVisible()), "galerie — fermeture avec Échap");
  await context.close();
}

// 8 bis. Comparateur avant / après : clavier, souris, tactile, libellés.
for (const vp of [viewports[1], viewports[4]]) {
  const context = await browser.newContext({ viewport: vp, hasTouch: vp.width < 500 });
  const page = await context.newPage();
  const tag = `avant/après ${vp.name}`;
  await page.goto(BASE + "/galerie", { waitUntil: "networkidle" });
  const slider = page.getByRole("slider");
  await slider.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const zone = page.locator("section", { has: slider }).last();
  check((await zone.getByText("AVANT", { exact: true }).isVisible()) && (await zone.getByText("APRÈS", { exact: true }).isVisible()), `${tag} — libellés AVANT et APRÈS`);
  check((await slider.inputValue()) === "50", `${tag} — position initiale au milieu`);
  await slider.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  check((await slider.inputValue()) === "55", `${tag} — flèches du clavier`);
  await page.keyboard.press("Home");
  check((await slider.inputValue()) === "0", `${tag} — touche Début`);
  const box = await slider.boundingBox();
  if (vp.width < 500) await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
  else await page.mouse.click(box.x + box.width * 0.8, box.y + box.height / 2);
  const value = Number(await slider.inputValue());
  check(value > 70 && value < 90, `${tag} — ${vp.width < 500 ? "toucher" : "clic"} à 80 % de la largeur (${value})`);
  const clip = await zone.locator("[style*=clip-path]").first().evaluate((el) => el.style.clipPath);
  check(clip.includes(`${100 - value}%`), `${tag} — l'image suit le curseur (${clip})`);
  check(box.width <= vp.width && box.x >= 0, `${tag} — tient dans l'écran`);
  if (vp.width < 500) await page.screenshot({ path: `${OUT}/avant-apres-mobile.png` });
  await context.close();
}

// 8 ter. Référencement : plan du site, robots, liens canoniques, aperçu de partage, données structurées.
{
  const page = await browser.newPage();
  const robots = await (await page.request.get(BASE + "/robots.txt")).text();
  check(robots.includes("Disallow: /design-system") && robots.includes("/sitemap.xml"), "référencement — robots.txt");
  const map = await (await page.request.get(BASE + "/sitemap.xml")).text();
  const locs = [...map.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  check(locs.length === 14 && locs.some((l) => l.endsWith("/care/preparer-son-rendez-vous")) && !locs.some((l) => l.includes("design-system") || l.includes("legal")), `référencement — plan du site (${locs.length} adresses)`);
  const og = await page.request.get(BASE + "/opengraph-image");
  check(og.status() === 200 && og.headers()["content-type"] === "image/png", "référencement — image d'aperçu de partage");
  for (const path of ["/", "/services", "/my-locks-design", "/care/entretien-des-locks"]) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    const meta = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content ?? "",
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
      ogImage: document.querySelector('meta[property="og:image"]')?.content ?? "",
      h1: document.querySelectorAll("h1").length,
      lang: document.documentElement.lang,
    }));
    const expected = BASE + (path === "/" ? "" : path);
    check(meta.title.includes("LP LOCKS") && meta.desc.length > 50 && meta.canonical.replace(/\/$/, "") === expected && meta.ogImage.includes("opengraph-image") && meta.h1 === 1 && meta.lang === "fr", `référencement — ${path} : titre, description, lien canonique, aperçu, un seul H1`);
  }
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
  check(ld["@type"] === "HairSalon" && ld.telephone === "+2250799331686" && ld.address.addressLocality === "Abidjan", "référencement — données structurées de l'accueil");
  await page.goto(BASE + "/legal", { waitUntil: "domcontentloaded" });
  check((await page.locator('meta[name="robots"][content*="noindex"]').count()) === 1 && (await page.getByText("À compléter").count()) >= 5, "mentions légales — champs à compléter signalés, page non indexée");
  await page.close();
}

// 9. FAQ et conseils.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE + "/faq", { waitUntil: "networkidle" });
  check((await page.locator("h2 button").count()) === 11, "FAQ — 11 questions");
  await page.getByRole("button", { name: "Quels sont les frais de déplacement ?" }).click();
  check(await page.getByText(/de 2 000 à 6 000 FCFA/).isVisible(), "FAQ — ouverture d'une réponse");
  check((await page.locator('script[type="application/ld+json"]').count()) === 1, "FAQ — données structurées présentes");
  await page.goto(BASE + "/care", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /La fréquence des reprises/ }).click();
  await page.waitForURL("**/care/frequence-des-reprises");
  check(await page.getByRole("heading", { level: 1, name: "La fréquence des reprises" }).isVisible(), "conseils — ouverture d'un article");
  await page.goto(BASE + "/care/article-inexistant");
  check(await page.getByRole("heading", { name: /Cette page n'existe pas/ }).isVisible(), "conseils — article inconnu : page « introuvable » en français");
  check((await page.locator('meta[name="robots"][content*="noindex"]').count()) > 0, "conseils — article inconnu : non indexable");
  await context.close();
}

// 10. Contact : validation, frais de déplacement, message WhatsApp.
for (const vp of [viewports[1], viewports[4]]) {
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  const tag = `contact ${vp.name}`;
  await page.goto(BASE + "/contact", { waitUntil: "networkidle" });
  const submit = page.getByRole("button", { name: "Envoyer ma demande sur WhatsApp" });
  await submit.click();
  check(await page.getByText("Indique ton nom.").isVisible() && await page.getByText("Choisis ta localité.").isVisible(), `${tag} — champs obligatoires contrôlés`);
  check(await page.getByLabel("Nom").evaluate((el) => el === document.activeElement && el.getAttribute("aria-invalid") === "true"), `${tag} — focus sur le premier champ en erreur`);
  await page.getByLabel("Nom").fill("Aïcha Koné");
  await page.getByLabel("Numéro WhatsApp").fill("07 99");
  await page.getByLabel("Prestation").selectOption("Locks temporaires");
  await page.getByLabel("Localité").selectOption("Marcory");
  check(await page.getByText("Zone 3 — frais de déplacement : 5 000 FCFA.").isVisible(), `${tag} — frais de déplacement selon la localité`);
  await page.getByLabel(/Date souhaitée/).fill("2020-01-01");
  await submit.click();
  check(await page.getByText(/Saisis les 10 chiffres/).isVisible() && await page.getByText("Choisis une date à venir.").isVisible(), `${tag} — numéro incomplet et date passée refusés`);
  await page.getByLabel("Numéro WhatsApp").fill("07 99 33 16 86");
  await page.getByLabel(/Date souhaitée/).fill("2030-06-15");
  await page.getByLabel(/Commentaire/).fill("Longueur 14 pouces & couleur caramel ?");
  const [popup] = await Promise.all([context.waitForEvent("page"), submit.click()]);
  await popup.close();
  const href = await page.getByRole("link", { name: "Rouvrir WhatsApp" }).getAttribute("href");
  const msg = norm(decodeURIComponent(href.split("text=")[1]));
  check(href.startsWith("https://wa.me/2250799331686?text="), `${tag} — nouvel onglet WhatsApp ouvert avec le bon numéro`);
  check(
    ["Nom : Aïcha Koné", "Prestation : Locks temporaires", "Localité : Marcory", "5 000 FCFA", "Date souhaitée : 15 juin 2030", "Longueur 14 pouces & couleur caramel ?"].every((t) => msg.includes(t)),
    `${tag} — message complet, accents et caractères spéciaux conservés`,
  );
  check(await page.getByText("Ta demande est prête dans WhatsApp.").isVisible(), `${tag} — confirmation sans fausse réservation`);
  if (vp.width < 500) await page.screenshot({ path: `${OUT}/contact-confirmation-mobile.png` });
  await context.close();
}

// 11. Logo officiel présent dans l'en-tête et le pied de page.
{
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1200);
  const ok = await page.evaluate(() => [...document.querySelectorAll('header img, footer img')].filter((i) => i.currentSrc.includes("logo") && i.naturalWidth > 0).length);
  check(ok === 2, `logo — chargé dans l'en-tête et le pied de page (${ok}/2)`);
  check(await page.getByRole("heading", { level: 1 }).innerText().then((t) => t.includes("ton style")), "accueil — accroche au tutoiement");
  await page.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : "\nToutes les vérifications sont passées.");
process.exit(failures.length ? 1 : 0);
