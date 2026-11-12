import type { MaterialId, Product } from "@/types";

export type ProductSort = "longueur" | "prix-croissant" | "prix-decroissant";

export interface ProductFilters {
  material: MaterialId | null;
  lengthId: string | null;
  color: string | null;
  texture: string | null;
  /** Prix maximum par mèche en FCFA ; null = pas de limite. */
  maxPrice: number | null;
}

export const emptyFilters: ProductFilters = {
  material: null,
  lengthId: null,
  color: null,
  texture: null,
  maxPrice: null,
};

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter(
    (p) =>
      (!filters.material || p.material === filters.material) &&
      (!filters.lengthId || p.lengthId === filters.lengthId) &&
      (!filters.color || p.color === filters.color) &&
      (!filters.texture || p.texture === filters.texture) &&
      // Un filtre de prix exclut les produits « sur devis », dont le prix est inconnu.
      (filters.maxPrice === null || (p.price.amount !== null && p.price.amount <= filters.maxPrice)),
  );
}

const lengthRank = (p: Product) => (p.lengthId ? Number.parseInt(p.lengthId, 10) : Number.POSITIVE_INFINITY);

export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const list = [...products];
  if (sort === "longueur") return list.sort((a, b) => lengthRank(a) - lengthRank(b));
  // Les produits sur devis (prix inconnu) sont toujours placés en fin de liste.
  const dir = sort === "prix-croissant" ? 1 : -1;
  return list.sort((a, b) => {
    if (a.price.amount === null && b.price.amount === null) return 0;
    if (a.price.amount === null) return 1;
    if (b.price.amount === null) return -1;
    return (a.price.amount - b.price.amount) * dir;
  });
}

/** Valeurs distinctes non vides d'un champ, pour n'afficher que les filtres utiles. */
export function distinctValues(products: Product[], key: "color" | "texture"): string[] {
  return [...new Set(products.map((p) => p[key]).filter((v): v is string => Boolean(v)))];
}
