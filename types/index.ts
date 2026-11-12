/** Statut de validation commerciale d'une donnée (tarif, description…). */
export type ValidationStatus = "valide" | "a-confirmer";

export type PriceUnit = "prestation" | "meche" | "deplacement" | "acompte";

/** Un tarif. `amount: null` signifie « Sur devis ». */
export interface Price {
  id: string;
  label: string;
  /** Montant en FCFA, ou null si sur devis. */
  amount: number | null;
  /** Borne haute lorsqu'une fourchette a été communiquée. */
  amountMax?: number;
  /** true = « À partir de ». */
  from?: boolean;
  unit: PriceUnit;
  /** Conditions d'application — vide tant que LP LOCKS ne les a pas précisées. */
  conditions: string;
  status: ValidationStatus;
}

export type ProjectTypeId = "depart" | "temporaire" | "achat";

export type MediaTone = "forest" | "sage" | "soft" | "mist" | "charcoal" | "silver";

/** Référence à un visuel. `src` absent = emplacement temporaire affiché. */
export interface MediaRef {
  /** Chemin dans /public, ex. « /assets/hero/hero.webp ». */
  src?: string;
  alt: string;
  /**
   * Origine du visuel. "ia" affiche automatiquement l'étiquette « Image générée par IA » :
   * une image générée n'est jamais présentée comme une réalisation réelle.
   */
  origin?: "ia" | "photo";
  /** Libellé affiché sur l'emplacement tant que le visuel n'est pas fourni. */
  slot: string;
  tone: MediaTone;
}

export interface Service {
  id: ProjectTypeId;
  name: string;
  shortName: string;
  description: string;
  image: MediaRef;
  /** Identifiants de tarifs dans data/prices.ts. */
  priceIds: string[];
  conditions: string[];
  /** Durée indicative communiquée, sinon null. */
  duration: string | null;
  href: string;
  status: ValidationStatus;
}

export interface ConfigOption {
  id: string;
  label: string;
  description?: string;
  /** Texte secondaire court (ex. équivalence en cm). */
  detail?: string;
  /** true = option disponible uniquement sur devis. */
  quoteOnly?: boolean;
  status?: ValidationStatus;
}

export interface ColorOption extends ConfigOption {
  /** Teinte d'affichage indicative du nuancier (pas une référence produit). */
  hex: string;
}

export interface ProjectType {
  id: ProjectTypeId;
  label: string;
  tagline: string;
  description: string;
  /** Mention obligatoire affichée avec la carte. */
  notice?: string;
  /** Ce que la cliente personnalisera à l'étape 2. */
  customizations: { id: string; label: string; required?: boolean; note?: string }[];
  image: MediaRef;
}

export interface TravelZone {
  id: string;
  name: string;
  localities: string[];
  /** Frais en FCFA, ou null si sur devis. */
  fee: number | null;
  status: ValidationStatus;
}

export type MaterialId = "synthetique" | "semi-naturelle" | "naturelle" | "cheveux-humains";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  material: MaterialId;
  /** Identifiant de longueur (data/configurator.ts), null si plusieurs longueurs possibles. */
  lengthId: string | null;
  /** null = non précisé (au choix, à voir avec LP LOCKS). */
  color: string | null;
  texture: string | null;
  price: Price;
  images: MediaRef[];
  /** Disponibilité si elle est renseignée par LP LOCKS, sinon null (rien n'est affiché). */
  availability: string | null;
  published: boolean;
}

export type GalleryKind = "realisation" | "inspiration" | "ia" | "emplacement";

export interface GalleryItem {
  id: string;
  title: string;
  kind: GalleryKind;
  /** Identifiants de catégories (data/gallery.ts). */
  tags: string[];
  image: MediaRef;
}

export interface CareArticle {
  slug: string;
  title: string;
  summary: string;
  image: MediaRef;
  sections: { title: string; paragraphs?: string[]; points?: string[] }[];
  /** false = texte rédigé à titre provisoire, à relire par LP LOCKS. */
  validated: boolean;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  /** Lien « en savoir plus » facultatif. */
  link?: { label: string; href: string };
}
