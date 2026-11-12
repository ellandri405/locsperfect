import type { Price } from "@/types";

/**
 * TARIFS LP LOCKS — source unique.
 *
 * Chaque tarif porte un statut : "valide" (confirmé par LP LOCKS) ou "a-confirmer"
 * (communiqué mais pas encore validé pour publication).
 * Prix à la mèche (locks naturelles et synthétiques) : validés le 12/11/2026.
 * Pour valider un tarif : passer `status` à "valide" (et compléter `conditions`).
 * Un tarif non validé n'est jamais affiché comme un prix définitif.
 * `amount: null` = « Sur devis ».
 */

/** Locks naturelles — prix par mèche selon la longueur (pouces). */
export const naturalLockPrices: Price[] = [
  { inches: 6, amount: 400 },
  { inches: 8, amount: 500 },
  { inches: 10, amount: 600 },
  { inches: 12, amount: 700 },
  { inches: 14, amount: 800 },
  { inches: 16, amount: 1000 },
  { inches: 18, amount: 1100 },
  { inches: 20, amount: 1200 },
  { inches: 22, amount: 1300 },
].map(({ inches, amount }) => ({
  id: `naturelle-${inches}`,
  label: `Lock naturelle ${inches} pouces`,
  amount,
  unit: "meche" as const,
  conditions: "",
  status: "valide" as const,
}));

export const naturalLockQuoteOnly: Price = {
  id: "naturelle-24-30",
  label: "Lock naturelle 24 à 30 pouces",
  amount: null,
  unit: "meche",
  conditions: "Sur devis.",
  status: "valide",
};

/** Locks synthétiques — le prix exact dépend du produit. */
export const syntheticLockPrice: Price = {
  id: "synthetique",
  label: "Lock synthétique",
  amount: 100,
  from: true,
  unit: "meche",
  conditions: "Le prix exact dépend du produit.",
  status: "valide",
};

/**
 * GRILLE DÉPART DE LOCKS — confirmée par LP LOCKS le 11/11/2026.
 * Prix en FCFA selon la technique et le nombre de locks. Au-delà de 120 locks : sur devis.
 * (« Départ simple à partir de 25 000 » = instantané au crochet, première tranche.)
 */
export const startQuantityTiers = [
  { id: "60-80", label: "60 à 80 locks", min: 60, max: 80 },
  { id: "81-100", label: "81 à 100 locks", min: 81, max: 100 },
  { id: "101-120", label: "101 à 120 locks", min: 101, max: 120 },
] as const;

export type StartTierId = (typeof startQuantityTiers)[number]["id"];

export const startPriceGrid: Record<string, Record<StartTierId, number>> = {
  "crochet-instantane": { "60-80": 25000, "81-100": 30000, "101-120": 35000 },
  "peigne-instantane": { "60-80": 27000, "81-100": 34000, "101-120": 41000 },
};

/**
 * SUPPLÉMENT DE MAIN-D'ŒUVRE AVEC EXTENSIONS — confirmé par LP LOCKS le 12/11/2026.
 * Dès que des extensions sont posées (pose de locks temporaires, ou départ de locks avec extensions),
 * la main-d'œuvre = tarif de la grille selon la tranche + ce supplément selon la base.
 * Les extensions elles-mêmes s'ajoutent (prix à la mèche × nombre de locks).
 * Ne concerne que les deux techniques de la grille (crochet et base peigne).
 */
export const temporaryPoseSupplement: Record<string, number> = {
  "crochet-instantane": 5000,
  "peigne-instantane": 7000,
};

/** Pose simple : pour la cliente qui vient avec ses propres extensions (confirmé le 12/11/2026). */
export const ownExtensionsPose: Price = {
  id: "pose-simple-extensions",
  label: "Pose simple — tu viens avec tes extensions",
  amount: 15000,
  unit: "prestation",
  conditions: "Pour la cliente qui apporte ses propres extensions.",
  status: "valide",
};

/**
 * Départs hors grille : tarif unique, qui ne varie pas selon le nombre de locks
 * (confirmé par LP LOCKS le 12/11/2026).
 */
export const flatStartPrices: Price[] = [
  {
    id: "twist",
    label: "Départ en twists",
    amount: 10000,
    unit: "prestation",
    conditions: "Départ en twists (nappy). Tarif unique, quel que soit le nombre de locks.",
    status: "valide",
  },
  {
    id: "peigne",
    label: "Départ au peigne",
    amount: 20000,
    unit: "prestation",
    conditions: "Au peigne avec un produit fixant (gel ou mousse). Tarif unique, quel que soit le nombre de locks.",
    status: "valide",
  },
];

/** Autres prestations communiquées. Conditions d'application à préciser par LP LOCKS. */
export const servicePrices: Price[] = [
  { id: "reprise-crochet", label: "Reprise au crochet", amount: 15000 },
  { id: "reprise-twist", label: "Reprise au twist", amount: 17000 },
  { id: "reprise-complete", label: "Reprise complète", amount: 20000, from: true },
  { id: "coiffure-simple", label: "Coiffure simple", amount: 5000, from: true },
  { id: "shampoing", label: "Shampoing", amount: 3000 },
  { id: "coloration", label: "Coloration", amount: 5000 },
].map((p) => ({ ...p, unit: "prestation" as const, conditions: "", status: "a-confirmer" as const }));

/** Acompte de référence — n'est PAS ajouté automatiquement aux prestations. */
export const depositReference: Price = {
  id: "acompte",
  label: "Acompte de référence",
  amount: 10000,
  unit: "acompte",
  conditions: "Prestations concernées à préciser.",
  status: "a-confirmer",
};

export const allPrices: Price[] = [
  ...naturalLockPrices,
  naturalLockQuoteOnly,
  syntheticLockPrice,
  ...flatStartPrices,
  ownExtensionsPose,
  ...servicePrices,
  depositReference,
];

export function getPrice(id: string): Price | undefined {
  return allPrices.find((p) => p.id === id);
}
