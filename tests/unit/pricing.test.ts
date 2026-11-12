import { describe, expect, it } from "vitest";
import { computeEstimate, materialPriceHint, startPrice, strandPrice } from "@/lib/pricing";
import { EMPTY_DRAFT, type ProjectDraft } from "@/lib/project-store";

const draft = (patch: Partial<ProjectDraft>): ProjectDraft => ({ ...EMPTY_DRAFT, ...patch });

describe("grille départ de locks", () => {
  it.each([
    ["crochet-instantane", "60-80", 25000],
    ["crochet-instantane", "81-100", 30000],
    ["crochet-instantane", "101-120", 35000],
    ["peigne-instantane", "60-80", 27000],
    ["peigne-instantane", "81-100", 34000],
    ["peigne-instantane", "101-120", 41000],
  ])("%s, %s locks → %i FCFA", (technique, quantity, amount) => {
    const line = startPrice(technique, quantity);
    expect(line?.amount).toBe(amount);
    expect(line?.confirmed).toBe(true);
    expect(line?.from).toBeFalsy();
  });

  it("au-delà de 120 locks : sur devis", () => {
    expect(startPrice("crochet-instantane", "autre")).toMatchObject({ amount: null, pendingText: "Sur devis" });
  });

  it("twists et peigne : tarif unique confirmé, quel que soit le nombre de locks", () => {
    for (const quantity of ["60-80", "81-100", "101-120", "autre", null]) {
      expect(startPrice("twist", quantity)).toMatchObject({ amount: 10000, confirmed: true });
      expect(startPrice("peigne", quantity)).toMatchObject({ amount: 20000, confirmed: true });
    }
  });

  it("sans quantité : prix de la première tranche, en « à partir de »", () => {
    expect(startPrice("peigne-instantane", null)).toMatchObject({ amount: 27000, from: true });
  });
});

describe("prix à la mèche", () => {
  it("locks naturelles selon la longueur", () => {
    expect(strandPrice("naturelle", "6")?.amount).toBe(400);
    expect(strandPrice("naturelle", "16")?.amount).toBe(1000);
    expect(strandPrice("naturelle", "22")?.amount).toBe(1300);
  });
  it("24 à 30 pouces et matières sans tarif : inconnu", () => {
    expect(strandPrice("naturelle", "24-30")).toBeNull();
    expect(strandPrice("semi-naturelle", "12")).toBeNull();
    expect(strandPrice("cheveux-humains", "12")).toBeNull();
    expect(materialPriceHint("cheveux-humains", "12")).toBe("Tarif sur devis");
  });
  it("prix à la mèche validés par LP LOCKS", () => {
    expect(strandPrice("naturelle", "14")?.status).toBe("valide");
    expect(strandPrice("synthetique", "14")?.status).toBe("valide");
  });
  it("synthétique : à partir de 100 FCFA", () => {
    expect(strandPrice("synthetique", "12")).toMatchObject({ amount: 100, from: true });
  });
  it("24 à 30 pouces : sur devis pour toutes les matières", () => {
    expect(strandPrice("synthetique", "24-30")).toBeNull();
    expect(materialPriceHint("synthetique", "24-30")).toBe("Sur devis pour cette longueur");
  });
});

describe("estimation — départ de locks", () => {
  const base = { projectType: "depart" as const, technique: "crochet-instantane", startQuantity: "81-100", extensions: "sans" };

  it("sans extensions, zone 1 : prestation + déplacement", () => {
    const e = computeEstimate(draft({ ...base, locality: "Angré" }));
    expect(e.lines).toHaveLength(1);
    expect(e.travel?.amount).toBe(2000);
    expect(e.knownTotal).toBe(32000);
    expect(e.hasPending).toBe(false);
  });

  it("zones 3 et 4 confirmées : 5 000 et 6 000 FCFA", () => {
    expect(computeEstimate(draft({ ...base, locality: "Marcory" })).travel).toMatchObject({ amount: 5000, confirmed: true });
    expect(computeEstimate(draft({ ...base, locality: "Koumassi" })).travel).toMatchObject({ amount: 6000, confirmed: true });
  });

  it("zone 5 : frais sur devis, non additionnés", () => {
    const e = computeEstimate(draft({ ...base, locality: "Yopougon" }));
    expect(e.travel).toMatchObject({ amount: null, pendingText: "Frais sur devis" });
    expect(e.knownTotal).toBe(30000);
    expect(e.hasPending).toBe(true);
    expect(e.totalLabel).toMatch(/^À partir de/);
  });

  it("avec extensions : prix à la mèche × nombre de locks, en fourchette", () => {
    // 81 à 100 locks × 800 FCFA = 64 800 à 80 000 ; + 30 000 (départ) + 5 000 (supplément) + 2 000 (zone 1).
    const e = computeEstimate(draft({ ...base, extensions: "avec", material: "naturelle", length: "14", locality: "Angré" }));
    const ext = e.lines.find((l) => l.id === "extensions");
    expect(ext).toMatchObject({ unitPrice: 800, amount: 64800, amountMax: 80000 });
    expect(e.lines[0]).toMatchObject({ id: "depart", amount: 35000 });
    expect(e.knownTotal).toBe(101800);
    expect(e.knownTotalMax).toBe(117000);
    expect(e.hasPending).toBe(false);
    expect(e.totalLabel.replace(/\s/g, " ")).toBe("De 101 800 à 117 000 FCFA");
  });

  it("avec extensions : matière sans tarif, 24 à 30 pouces ou plus de 120 locks → sur devis", () => {
    const ext = (patch: object) => computeEstimate(draft({ ...base, extensions: "avec", material: "naturelle", length: "14", ...patch })).lines.find((l) => l.id === "extensions");
    expect(ext({ material: "cheveux-humains" })).toMatchObject({ amount: null, pendingText: "Sur devis" });
    expect(ext({ length: "24-30" })).toMatchObject({ amount: null, pendingText: "Sur devis" });
    expect(ext({ startQuantity: "autre" })).toMatchObject({ amount: null, pendingText: "Sur devis" });
  });

  it("twists avec extensions : tarif fixe + extensions selon la tranche", () => {
    const e = computeEstimate(draft({ ...base, technique: "twist", startQuantity: "60-80", extensions: "avec", material: "naturelle", length: "6", locality: "Angré" }));
    // 10 000 + 2 000 + 400 × (60 à 80)
    expect([e.knownTotal, e.knownTotalMax]).toEqual([36000, 44000]);
  });

  it("sans extensions : une matière restée en mémoire est ignorée", () => {
    const e = computeEstimate(draft({ ...base, material: "naturelle", length: "14", locality: "Angré" }));
    expect(e.lines.some((l) => l.id === "extensions")).toBe(false);
  });

  it("l'acompte n'est jamais ajouté", () => {
    const e = computeEstimate(draft({ ...base, locality: "Angré" }));
    expect(JSON.stringify(e)).not.toMatch(/compte/i);
  });
});

describe("estimation — locks temporaires", () => {
  const temp = { projectType: "temporaire" as const, extensions: "fournies", material: "naturelle", length: "12", locality: "Riviera 2" };

  // Grille du départ de locks + 5 000 (base crochet) ou + 7 000 (base peigne).
  it.each([
    ["crochet-instantane", "60-80", 30000],
    ["crochet-instantane", "81-100", 35000],
    ["crochet-instantane", "101-120", 40000],
    ["peigne-instantane", "60-80", 34000],
    ["peigne-instantane", "81-100", 41000],
    ["peigne-instantane", "101-120", 48000],
  ])("main-d'œuvre : grille + supplément — %s, %s locks → %i FCFA", (technique, startQuantity, amount) => {
    const e = computeEstimate(draft({ ...temp, technique, startQuantity }));
    expect(e.lines[0]).toMatchObject({ id: "pose", amount, confirmed: true });
  });

  it("total complet : pose + extensions (fourchette) + déplacement", () => {
    // 35 000 (crochet, 81–100, supplément compris) + 700 × (81 à 100) + 4 000 (zone 2)
    const e = computeEstimate(draft({ ...temp, technique: "crochet-instantane", startQuantity: "81-100" }));
    expect([e.knownTotal, e.knownTotalMax]).toEqual([95700, 109000]);
    expect(e.hasPending).toBe(false);
    expect(e.allConfirmed).toBe(false); // la zone 2 reste « à confirmer »
  });

  it("plus de 120 locks : pose et extensions sur devis", () => {
    const e = computeEstimate(draft({ ...temp, technique: "peigne-instantane", startQuantity: "autre" }));
    expect(e.lines.map((l) => l.pendingText)).toEqual(["Sur devis", "Sur devis"]);
    expect(e.knownTotal).toBe(4000);
  });

  it("une technique de départ non valable pour une pose (twists) est ignorée", () => {
    const e = computeEstimate(draft({ ...temp, technique: "twist", startQuantity: "60-80" }));
    expect(e.lines[0]).toMatchObject({ id: "pose", amount: null, pendingText: "Base à choisir" });
  });

  it("extensions synthétiques : minimum × nombre de locks, en « à partir de »", () => {
    const e = computeEstimate(draft({ ...temp, material: "synthetique", technique: "crochet-instantane", startQuantity: "60-80" }));
    expect(e.lines.find((l) => l.id === "extensions")).toMatchObject({ amount: 6000, from: true });
    expect(e.knownTotal).toBe(40000);
    expect(e.totalLabel).toMatch(/^À partir de/);
  });

  it("pose simple : la cliente vient avec ses extensions → 15 000 FCFA, sans coût d'extensions", () => {
    const e = computeEstimate(draft({ ...temp, extensions: "apportees", technique: "peigne-instantane", startQuantity: "101-120" }));
    expect(e.lines).toHaveLength(1);
    expect(e.lines[0]).toMatchObject({ id: "pose", amount: 15000, confirmed: true });
    expect([e.knownTotal, e.knownTotalMax]).toEqual([19000, 19000]);
  });

  it("départ de locks : supplément uniquement avec extensions, selon la technique et la tranche", () => {
    const start = (technique: string, startQuantity: string, extensions: string) =>
      computeEstimate(draft({ projectType: "depart", technique, startQuantity, extensions, material: "naturelle", length: "12" })).lines[0].amount;
    expect(start("peigne-instantane", "60-80", "sans")).toBe(27000);
    expect(start("peigne-instantane", "60-80", "avec")).toBe(34000);
    expect(start("peigne-instantane", "101-120", "avec")).toBe(48000);
    expect(start("crochet-instantane", "81-100", "sans")).toBe(30000);
    expect(start("crochet-instantane", "81-100", "avec")).toBe(35000);
    // Twists et peigne simple : pas de supplément défini.
    expect(start("twist", "60-80", "avec")).toBe(10000);
    expect(start("peigne", "60-80", "avec")).toBe(20000);
  });

  it("provenance des extensions non choisie : rien n'est chiffré", () => {
    const e = computeEstimate(draft({ projectType: "temporaire", locality: "Riviera 2" }));
    expect(e.lines[0]).toMatchObject({ amount: null, pendingText: "Extensions à choisir" });
  });
});

describe("estimation — achat de locks", () => {
  it("naturelles : prix unitaire × quantité, sans frais de déplacement", () => {
    const e = computeEstimate(draft({ projectType: "achat", material: "naturelle", length: "12", strandQuantity: 60, locality: "Angré" }));
    expect(e.lines[0]).toMatchObject({ unitPrice: 700, quantity: 60, amount: 42000 });
    expect(e.travel).toBeNull();
    expect(e.knownTotal).toBe(42000);
  });
  it("synthétiques : minimum en « à partir de »", () => {
    const e = computeEstimate(draft({ projectType: "achat", material: "synthetique", length: "12", strandQuantity: 80 }));
    expect(e.lines[0]).toMatchObject({ amount: 8000, from: true });
    expect(e.totalLabel).toMatch(/^À partir de/);
  });
  it("24 à 30 pouces ou matière sans tarif : sur devis", () => {
    expect(computeEstimate(draft({ projectType: "achat", material: "naturelle", length: "24-30" })).totalLabel).toBe("Sur devis");
    expect(computeEstimate(draft({ projectType: "achat", material: "cheveux-humains", length: "12" })).totalLabel).toBe("Sur devis");
  });
});

it("projet vide : rien à calculer", () => {
  expect(computeEstimate(EMPTY_DRAFT)).toMatchObject({ lines: [], travel: null, knownTotal: 0, totalLabel: "À calculer" });
});
