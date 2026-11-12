import { describe, expect, it } from "vitest";
import { inspirations } from "@/data/inspirations";
import { effectiveDraft, fieldsFor, lengthGroup, missingFields, summaryRows } from "@/lib/configurator";
import { rankInspirations, renderViews } from "@/lib/inspirations";
import { EMPTY_DRAFT, parseDraft, STORAGE_VERSION, type ProjectDraft } from "@/lib/project-store";
import { validateFutureDate, validateName, validatePhone } from "@/lib/validation";

const draft = (patch: Partial<ProjectDraft>): ProjectDraft => ({ ...EMPTY_DRAFT, ...patch });
const ids = (d: ProjectDraft) => fieldsFor(d).map((f) => f.id);

describe("champs selon le projet", () => {
  it("départ sans extensions : pas de matière, longueur, couleur ni texture", () => {
    expect(ids(draft({ projectType: "depart", extensions: "sans" }))).toEqual(["technique", "startQuantity", "extensions", "thickness", "faceShape"]);
  });
  it("départ avec extensions : matière et longueur obligatoires", () => {
    const fields = fieldsFor(draft({ projectType: "depart", extensions: "avec" }));
    expect(fields.find((f) => f.id === "material")?.required).toBe(true);
    expect(fields.find((f) => f.id === "length")?.required).toBe(true);
  });
  it("locks temporaires : provenance des extensions, puis base, matière, longueur et nombre de locks", () => {
    expect(missingFields(draft({ projectType: "temporaire" })).map((f) => f.id)).toEqual(["extensions"]);
    const d = draft({ projectType: "temporaire", extensions: "fournies" });
    expect(missingFields(d).map((f) => f.id)).toEqual(["technique", "material", "length", "startQuantity"]);
    expect(fieldsFor(d)[1].label).toBe("Base de la pose");
  });
  it("locks temporaires avec ses propres extensions : ni base, ni matière, ni nombre de locks", () => {
    const d = draft({ projectType: "temporaire", extensions: "apportees" });
    expect(missingFields(d)).toEqual([]);
    expect(ids(d)).toEqual(["extensions", "length", "color", "texture", "thickness", "faceShape"]);
    expect(summaryRows(d).find((r) => r.id === "extensions")?.value).toBe("Je viens avec mes extensions");
  });
  it("un choix d'extensions d'un autre projet est ignoré", () => {
    expect(missingFields(draft({ projectType: "temporaire", extensions: "sans" })).map((f) => f.id)).toEqual(["extensions"]);
    expect(missingFields(draft({ projectType: "depart", extensions: "fournies", technique: "twist", startQuantity: "60-80" })).map((f) => f.id)).toEqual(["extensions"]);
  });
  it("locks temporaires : seules les bases crochet et peigne sont valables", () => {
    const twist = draft({ projectType: "temporaire", extensions: "fournies", technique: "twist", material: "naturelle", length: "12", startQuantity: "60-80" });
    expect(missingFields(twist).map((f) => f.id)).toEqual(["technique"]);
    const crochet = { ...twist, technique: "crochet-instantane" };
    expect(missingFields(crochet)).toEqual([]);
    expect(summaryRows(crochet).find((r) => r.id === "technique")?.value).toBe("Base au crochet");
  });
  it("achat : nombre de mèches, jamais de nombre de locks posées", () => {
    const d = draft({ projectType: "achat" });
    expect(ids(d)).toContain("strandQuantity");
    expect(ids(d)).not.toContain("startQuantity");
    expect(ids(d)).not.toContain("technique");
  });
  it("les choix d'un autre projet ne polluent pas le résumé", () => {
    const d = draft({ projectType: "achat", technique: "twist", material: "naturelle", length: "10" });
    expect(effectiveDraft(d).technique).toBeNull();
    expect(summaryRows(d).map((r) => r.label)).not.toContain("Technique");
    expect(summaryRows(d).find((r) => r.id === "length")?.value).toBe("10 pouces (25 cm)");
  });
});

describe("morphologie du visage et rendu", () => {
  it("la morphologie remplace le style pour un départ et une pose, pas pour un achat", () => {
    expect(ids(draft({ projectType: "depart", extensions: "sans" }))).toContain("faceShape");
    expect(ids(draft({ projectType: "temporaire", extensions: "fournies" }))).toContain("faceShape");
    expect(ids(draft({ projectType: "achat" }))).not.toContain("faceShape");
    expect(summaryRows(draft({ projectType: "depart", extensions: "sans", faceShape: "coeur" })).find((r) => r.id === "faceShape")).toMatchObject({ label: "Morphologie du visage", value: "Cœur" });
  });
  it("vues de face et de profil : emplacement générique tant qu'aucune image propre à la morphologie n'existe", () => {
    const views = renderViews(inspirations[0], "ovale");
    expect(views.face.slot).toBe(`models/${inspirations[0].id}-face`);
    expect(views.profil.slot).toBe(`models/${inspirations[0].id}-profil`);
    expect(views.matchesFaceShape).toBe(false);
    expect(renderViews(inspirations[0], null).face.alt).toContain("vue de face");
  });
});

describe("inspirations", () => {
  it("regroupe les longueurs", () => {
    expect([lengthGroup("6"), lengthGroup("14"), lengthGroup("22"), lengthGroup("24-30"), lengthGroup(null)]).toEqual(["courte", "moyenne", "longue", "longue", null]);
  });
  it("propose d'abord l'inspiration qui correspond à la longueur et à la couleur", () => {
    const [first] = rankInspirations(draft({ projectType: "temporaire", extensions: "fournies", length: "20", color: "caramel" }), inspirations);
    expect(first.inspiration).toMatchObject({ lengthGroup: "longue", color: "caramel" });
    expect(first.exact).toBe(true);
  });
  it("signale une inspiration seulement proche quand la combinaison n'existe pas", () => {
    const d = draft({ projectType: "temporaire", extensions: "fournies", length: "20", color: "caramel", texture: "frisee", thickness: "fine" });
    const [first] = rankInspirations(d, inspirations);
    const exact = inspirations.some((i) => i.lengthGroup === "longue" && i.color === "caramel" && i.texture === "frisee" && i.thickness === "fine");
    expect(first.exact).toBe(exact);
    if (!exact) expect(first.differences.length).toBeGreaterThan(0);
  });
  it("sans choix, toutes les inspirations sont proposées", () => {
    expect(rankInspirations(EMPTY_DRAFT, inspirations)).toHaveLength(inspirations.length);
  });
});

describe("sauvegarde locale", () => {
  it("migre un brouillon de version 1", () => {
    const d = parseDraft(JSON.stringify({ version: 1, projectType: "temporaire", updatedAt: "2026-11-11T00:00:00.000Z" }));
    expect(d).toMatchObject({ version: STORAGE_VERSION, projectType: "temporaire", step: 0, material: null });
  });
  it("ignore les valeurs inconnues ou malformées", () => {
    const d = parseDraft(JSON.stringify({ version: 3, projectType: "depart", technique: "inconnue", color: 42, faceShape: "triangle", step: 99, strandQuantity: -5, compareIds: "x" }));
    expect(d).toMatchObject({ technique: null, color: null, faceShape: null, step: 4, strandQuantity: 1, compareIds: [null, null] });
  });
  it("migre un brouillon de version 2 : choix conservés, étapes renumérotées (7 → 5)", () => {
    const v2 = (step: number) => parseDraft(JSON.stringify({ version: 2, step, projectType: "depart", technique: "twist", length: "12", style: "libres" }));
    expect(v2(1)).toMatchObject({ version: STORAGE_VERSION, step: 1, technique: "twist", length: "12", faceShape: null });
    expect([0, 1, 2, 3, 4, 5, 6].map((s) => v2(s).step)).toEqual([0, 1, 2, 2, 3, 4, 4]);
  });
  it("repart de zéro sur des données illisibles ou une version future", () => {
    expect(parseDraft("{pas du json")).toEqual(EMPTY_DRAFT);
    expect(parseDraft(JSON.stringify({ version: 99, projectType: "achat" }))).toEqual(EMPTY_DRAFT);
    expect(parseDraft(null)).toEqual(EMPTY_DRAFT);
  });
});

describe("validation des formulaires", () => {
  it("nom", () => {
    expect(validateName(" ")).not.toBeNull();
    expect(validateName("Aïcha")).toBeNull();
  });
  it("numéro WhatsApp", () => {
    expect(validatePhone("07 99 33 16 86")).toBeNull();
    expect(validatePhone("+225 07 99 33 16 86")).toBeNull();
    expect(validatePhone("07 99")).not.toBeNull();
    expect(validatePhone("abc")).not.toBeNull();
    expect(validatePhone("")).not.toBeNull();
  });
  it("date", () => {
    expect(validateFutureDate("", "2026-11-11")).toBeNull();
    expect(validateFutureDate("2026-11-11", "2026-11-11")).toBeNull();
    expect(validateFutureDate("2026-11-10", "2026-11-11")).not.toBeNull();
  });
});

describe("liens WhatsApp", () => {
  it("contact : lien WhatsApp Business ; envoi de projet : numéro avec message encodé", async () => {
    const { whatsappUrl } = await import("@/lib/whatsapp");
    expect(whatsappUrl()).toBe("https://wa.me/message/YHAD5F6YRWM2C1");
    expect(whatsappUrl("Été & locks ?\nMerci")).toBe("https://wa.me/2250799331686?text=%C3%89t%C3%A9%20%26%20locks%20%3F%0AMerci");
  });
});
