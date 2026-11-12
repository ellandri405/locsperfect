import type { MaterialId, Product } from "@/types";
import { lengthOptions } from "./configurator";
import { naturalLockPrices, naturalLockQuoteOnly, syntheticLockPrice } from "./prices";

/**
 * CATALOGUE — produits proposés à l'achat.
 *
 * Les fiches ci-dessous sont construites à partir de la grille tarifaire
 * communiquée. Couleur, texture et disponibilité ne sont pas renseignées :
 * elles restent `null` tant que LP LOCKS ne les a pas fournies.
 *
 * Ajouter un produit : ajouter un objet à `products` (identifiant unique),
 * avec `published: true` pour l'afficher.
 */

export const materialLabels: Record<MaterialId, string> = {
  synthetique: "Synthétique",
  "semi-naturelle": "Semi-naturelle",
  naturelle: "Naturelle",
  "cheveux-humains": "Cheveux humains",
};

const lengthLabel = (id: string) => {
  const option = lengthOptions.find((o) => o.id === id);
  return option ? `${option.description} (${option.detail})` : id;
};

const naturalProducts: Product[] = [...naturalLockPrices, naturalLockQuoteOnly].map((price) => {
  const lengthId = price.id.replace("naturelle-", "");
  return {
    id: `lock-${price.id}`,
    name: `Lock naturelle ${lengthOptions.find((o) => o.id === lengthId)?.description ?? ""}`.trim(),
    description: `Lock naturelle de ${lengthLabel(lengthId)}, vendue à la mèche.`,
    category: "Locks naturelles",
    material: "naturelle",
    lengthId,
    color: null,
    texture: null,
    price,
    images: [{ alt: `Lock naturelle ${lengthLabel(lengthId)}`, slot: `lengths/naturelle-${lengthId}`, tone: "soft" }],
    availability: null,
    published: true,
  };
});

const quote = (id: string, label: string) => ({
  id,
  label,
  amount: null,
  unit: "meche" as const,
  conditions: "Tarif non communiqué.",
  status: "a-confirmer" as const,
});

export const products: Product[] = [
  ...naturalProducts,
  {
    id: "lock-synthetique",
    name: "Locks synthétiques",
    description: "Locks synthétiques vendues à la mèche. Le prix exact dépend du produit choisi.",
    category: "Locks synthétiques",
    material: "synthetique",
    lengthId: null,
    color: null,
    texture: null,
    price: syntheticLockPrice,
    images: [{ alt: "Locks synthétiques", slot: "textures/synthetique", tone: "sage" }],
    availability: null,
    published: true,
  },
  {
    id: "lock-semi-naturelle",
    name: "Locks semi-naturelles",
    description: "Locks semi-naturelles. Longueur et tarif à définir avec LP LOCKS.",
    category: "Locks semi-naturelles",
    material: "semi-naturelle",
    lengthId: null,
    color: null,
    texture: null,
    price: quote("semi-naturelle", "Lock semi-naturelle"),
    images: [{ alt: "Locks semi-naturelles", slot: "textures/semi-naturelle", tone: "mist" }],
    availability: null,
    published: true,
  },
  {
    id: "lock-cheveux-humains",
    name: "Locks en cheveux humains",
    description: "Locks en cheveux humains. Longueur et tarif à définir avec LP LOCKS.",
    category: "Cheveux humains",
    material: "cheveux-humains",
    lengthId: null,
    color: null,
    texture: null,
    price: quote("cheveux-humains", "Lock en cheveux humains"),
    images: [{ alt: "Locks en cheveux humains", slot: "textures/cheveux-humains", tone: "charcoal" }],
    availability: null,
    published: true,
  },
];

export const publishedProducts = products.filter((p) => p.published);
