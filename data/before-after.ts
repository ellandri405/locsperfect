import type { MediaRef } from "@/types";

export interface BeforeAfterPair {
  id: string;
  title: string;
  before: MediaRef;
  after: MediaRef;
  /**
   * true = emplacement de démonstration (aucune photo fournie).
   * Une paire réelle doit montrer la même personne, avant et après une prestation LP LOCKS.
   * Ne jamais y placer une image générée par IA.
   */
  placeholder: boolean;
}

/**
 * Transformations avant / après.
 * Pour publier une vraie transformation : déposer les deux photos dans
 * public/assets/before-after/ (ex. 01-avant.webp et 01-apres.webp), les déclarer
 * dans public/assets/photos-reelles.txt, puis passer `placeholder` à false.
 */
export const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: "01",
    title: "Départ de locks",
    before: { alt: "Avant : cheveux naturels", slot: "before-after/01-avant", tone: "silver" },
    after: { alt: "Après : départ de locks", slot: "before-after/01-apres", tone: "forest" },
    placeholder: true,
  },
];
