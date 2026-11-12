import type { ColorOption, ConfigOption, ProjectType } from "@/types";

/** Étapes du parcours MY LOCKS DESIGN. */
export const configuratorSteps = [
  { id: "projet", label: "Projet" },
  { id: "personnalisation", label: "Personnalisation" },
  { id: "inspirations", label: "Inspirations" },
  { id: "comparer", label: "Comparer" },
  { id: "recapitulatif", label: "Récapitulatif" },
  { id: "estimation", label: "Estimation" },
  { id: "envoi", label: "Envoi" },
] as const;

/** Étape 1 — les trois types de projet et ce que chacun permet de personnaliser. */
export const projectTypes: ProjectType[] = [
  {
    id: "depart",
    label: "Départ de locks durables",
    tagline: "Je commence mes locks.",
    description:
      "Pour commencer des locks durables, sans extensions ou avec extensions selon la longueur souhaitée.",
    customizations: [
      { id: "technique", label: "Technique", required: true },
      { id: "quantite", label: "Nombre de locks", required: true },
      { id: "extensions", label: "Avec ou sans extensions", required: true },
      { id: "longueur", label: "Longueur" },
      { id: "epaisseur", label: "Épaisseur" },
      { id: "style", label: "Style" },
      { id: "matiere", label: "Matière, couleur et texture", note: "si extensions" },
    ],
    image: {
      alt: "Inspiration de départ de locks durables",
      slot: "models/depart-de-locks",
      tone: "forest",
    },
  },
  {
    id: "temporaire",
    label: "Locks temporaires",
    tagline: "J'essaie sans m'engager.",
    description:
      "Pour porter des locks sans engagement durable et changer de style quand tu le souhaites.",
    notice: "La pose de locks temporaires nécessite des extensions.",
    customizations: [
      { id: "technique", label: "Base de la pose", required: true },
      { id: "matiere", label: "Matière", required: true },
      { id: "longueur", label: "Longueur", required: true },
      { id: "quantite", label: "Nombre de locks", required: true },
      { id: "couleur", label: "Couleur" },
      { id: "texture", label: "Texture" },
      { id: "epaisseur", label: "Épaisseur" },
      { id: "style", label: "Style" },
    ],
    image: {
      alt: "Inspiration de locks temporaires",
      slot: "models/locks-temporaires",
      tone: "sage",
    },
  },
  {
    id: "achat",
    label: "Achat de locks",
    tagline: "J'achète mes mèches.",
    description:
      "Pour acheter des locks ou des extensions, à la mèche, dans la matière et la longueur de ton choix.",
    customizations: [
      { id: "matiere", label: "Matière", required: true },
      { id: "longueur", label: "Longueur", required: true },
      { id: "quantite", label: "Nombre de mèches", required: true },
      { id: "couleur", label: "Couleur" },
      { id: "texture", label: "Texture" },
    ],
    image: {
      alt: "Locks et extensions à l'achat",
      slot: "models/achat-de-locks",
      tone: "charcoal",
    },
  },
];

const cm = (inches: number) => Math.round(inches * 2.54);

/** Longueurs en pouces, avec équivalence en centimètres. */
export const lengthOptions: ConfigOption[] = [
  ...[6, 8, 10, 12, 14, 16, 18, 20, 22].map((inches) => ({
    id: `${inches}`,
    label: `${inches}″`,
    description: `${inches} pouces`,
    detail: `${cm(inches)} cm`,
  })),
  {
    id: "24-30",
    label: "24–30″",
    description: "24 à 30 pouces",
    detail: `${cm(24)}–${cm(30)} cm`,
    quoteOnly: true,
  },
];

export const thicknessOptions: ConfigOption[] = [
  { id: "fine", label: "Fine" },
  { id: "moyenne", label: "Moyenne" },
  { id: "epaisse", label: "Épaisse" },
];

/**
 * Nuancier. Les teintes `hex` servent uniquement à l'affichage et restent
 * indicatives : elles seront remplacées par les photos de /assets/colors.
 */
export const colorOptions: ColorOption[] = [
  { id: "noir-naturel", label: "Noir naturel", hex: "#1f1b18" },
  { id: "noir-profond", label: "Noir profond", hex: "#0a0a0a" },
  { id: "brun-fonce", label: "Brun foncé", hex: "#3a2a20" },
  { id: "brun-chocolat", label: "Brun chocolat", hex: "#5b3a27" },
  { id: "caramel", label: "Caramel", hex: "#a8703f" },
  { id: "blond", label: "Blond", hex: "#d6b46f" },
];

export const textureOptions: ConfigOption[] = [
  { id: "naturelle", label: "Naturelle" },
  { id: "ondulee", label: "Ondulée" },
  { id: "bouclee", label: "Bouclée" },
  { id: "frisee", label: "Frisée" },
];

/** Matières. Les explications détaillées restent à fournir par LP LOCKS. */
export const materialOptions: ConfigOption[] = [
  {
    id: "synthetique",
    label: "Synthétique",
    description: "À partir de 100 FCFA la mèche, selon le produit.",
    status: "a-confirmer",
  },
  {
    id: "semi-naturelle",
    label: "Semi-naturelle",
    description: "Tarif sur devis. Description à confirmer.",
    status: "a-confirmer",
  },
  {
    id: "naturelle",
    label: "Naturelle",
    description: "Prix à la mèche selon la longueur, de 6 à 22 pouces.",
    status: "a-confirmer",
  },
  {
    id: "cheveux-humains",
    label: "Cheveux humains",
    description: "Tarif sur devis. Description à confirmer.",
    status: "a-confirmer",
  },
];

/** Nombre de locks pour un départ (tranches de la grille tarifaire). */
export const startQuantityOptions: ConfigOption[] = [
  { id: "60-80", label: "60 à 80 locks", detail: "Environ 5 h pour 80 locks" },
  { id: "81-100", label: "81 à 100 locks" },
  { id: "101-120", label: "101 à 120 locks", detail: "Environ 7 h pour 120 locks" },
  { id: "autre", label: "Plus de 120 locks", detail: "Sur devis", quoteOnly: true },
];

/** Techniques de départ de locks (descriptions fournies par LP LOCKS). */
export const techniqueOptions: ConfigOption[] = [
  {
    id: "crochet-instantane",
    label: "Instantané au crochet",
    description: "Départ de locks instantané, réalisé au crochet.",
  },
  {
    id: "peigne-instantane",
    label: "Instantané base peigne",
    description: "Départ de locks instantané, réalisé sur une base au peigne.",
  },
  {
    id: "twist",
    label: "Twists",
    description: "Départ en twists, façon nappy.",
  },
  {
    id: "peigne",
    label: "Peigne",
    description:
      "Réalisé uniquement au peigne avec un produit fixant (gel ou mousse coiffante). Différent du départ instantané.",
  },
];

/**
 * Base de la pose de locks temporaires. Les identifiants sont ceux de la grille tarifaire
 * (data/prices.ts) : la main-d'œuvre suit le même tarif que le départ de locks.
 */
export const temporaryBaseOptions: ConfigOption[] = [
  { id: "crochet-instantane", label: "Base au crochet", description: "Pose réalisée sur une base au crochet." },
  { id: "peigne-instantane", label: "Base au peigne", description: "Pose réalisée sur une base au peigne." },
];

export const extensionOptions: ConfigOption[] = [
  {
    id: "sans",
    label: "Sans extensions",
    description: "Tes locks sont réalisées sur tes cheveux, à leur longueur actuelle.",
  },
  {
    id: "avec",
    label: "Avec extensions",
    description: "Pour gagner en longueur dès le départ. Tu choisis ensuite la matière, la longueur et la couleur.",
  },
];

export const styleOptions: ConfigOption[] = [
  { id: "libres", label: "Locks libres" },
  { id: "attachees", label: "Locks attachées" },
  { id: "longues", label: "Locks longues" },
  { id: "courtes", label: "Locks courtes" },
  { id: "fines", label: "Locks fines" },
  { id: "epaisses", label: "Locks épaisses" },
  { id: "bouclees", label: "Locks bouclées" },
  { id: "colorees", label: "Locks colorées" },
];

/** Achat de mèches : valeurs du sélecteur de quantité. */
export const strandQuantity = { min: 1, max: 1000, step: 10, initial: 50 } as const;
