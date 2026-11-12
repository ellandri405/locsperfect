import { describe, expect, it } from "vitest";
import { inspirations } from "@/data/inspirations";
import { effectiveDraft, fieldsFor, lengthGroup, missingFields, summaryRows } from "@/lib/configurator";
import { rankInspirations } from "@/lib/inspirations";
import { EMPTY_DRAFT, parseDraft, STORAGE_VERSION, type ProjectDraft } from "@/lib/project-store";
import { validateFutureDate, validateName, validatePhone } from "@/lib/validation";

const draft = (patch: Partial<ProjectDraft>): ProjectDraft => ({ ...EMPTY_DRAFT, ...patch });
const ids = (d: ProjectDraft) => fieldsFor(d).map((f) => f.id);

describe("champs selon le projet", () => {
  it("départ sans extensions : pas de matière, longueur, couleur ni texture", () => {
    expect(ids(draft({ projectType: "depart", extensions: "sans" }))).toEqual(["technique", "startQuantity", "extensions", "thickness", "style"]);
  });
  it("départ avec extensions : matière et longueur obligatoires", () => {
    const fields = fieldsFor(draft({ projectType: "depart", extensions: "avec" }));
    expect(fields.find((f) => f.id === "material")?.required).toBe(true);
    expect(fields.find((f) => f.id === "length")?.required).toBe(true);
  });
  it("locks temporaires : matière, longueur et nombre de locks obligatoires, pas de technique", () => {
    const d = draft({ projectType: "temporaire" });
    expect(ids(d)).not.toContain("technique");
    expect(ids(d)).not.toContain("extensions");
    expect(missingFields(d).map((f) => f.id)).toEqual(["material", "length", "startQuantity"]);
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

describe("inspirations", () => {
  it("regroupe les longueurs", () => {
    expect([lengthGroup("6"), lengthGroup("14"), lengthGroup("22"), lengthGroup("24-30"), lengthGroup(null)]).toEqual(["courte", "moyenne", "longue", "longue", null]);
  });
  it("propose d'abord l'inspiration qui correspond à la longueur et à la couleur", () => {
    const [first] = rankInspirations(draft({ projectType: "temporaire", length: "20", color: "caramel" }), inspirations);
    expect(first.inspiration).toMatchObject({ lengthGroup: "longue", color: "caramel" });
    expect(first.exact).toBe(true);
  });
  it("signale une inspiration seulement proche quand la combinaison n'existe pas", () => {
    const d = draft({ projectType: "temporaire", length: "20", color: "caramel", texture: "frisee", thickness: "fine", style: "attachees" });
    const [first] = rankInspirations(d, inspirations);
    const exact = inspirations.some((i) => i.lengthGroup === "longue" && i.color === "caramel" && i.texture === "frisee" && i.thickness === "fine" && i.styles.includes("attachees"));
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
    const d = parseDraft(JSON.stringify({ version: 2, projectType: "depart", technique: "inconnue", color: 42, step: 99, strandQuantity: -5, compareIds: "x" }));
    expect(d).toMatchObject({ technique: null, color: null, step: 6, strandQuantity: 1, compareIds: [null, null] });
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
