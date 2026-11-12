import type { Service } from "@/types";

/** Les trois offres LP LOCKS. Pour ajouter une photo : renseigner `image.src`. */
export const services: Service[] = [
  {
    id: "depart",
    name: "Départ de locks durables",
    shortName: "Départ de locks",
    description:
      "Commence tes locks durables, avec ou sans extensions. Technique, longueur, nombre de locks et finition se choisissent selon ton projet.",
    image: {
      alt: "Départ de locks durables réalisé par LP LOCKS",
      slot: "services/depart-de-locks",
      tone: "forest",
    },
    priceIds: ["twist", "peigne"],
    conditions: [
      "Possible sans extensions ou avec extensions.",
      "Le tarif dépend de la technique et du nombre de locks.",
    ],
    duration: "Environ 5 heures pour 80 locks, environ 7 heures pour 120 locks.",
    href: "/services#depart",
    status: "a-confirmer",
  },
  {
    id: "temporaire",
    name: "Locks temporaires",
    shortName: "Locks temporaires",
    description:
      "Porte des locks sans engagement durable. Matière, longueur, couleur et texture : tout se compose à la carte.",
    image: {
      alt: "Pose de locks temporaires réalisée par LP LOCKS",
      slot: "services/locks-temporaires",
      tone: "sage",
    },
    priceIds: ["pose-simple-extensions"],
    conditions: ["Les extensions sont obligatoires pour cette prestation."],
    duration: null,
    href: "/services#temporaire",
    status: "a-confirmer",
  },
  {
    id: "achat",
    name: "Achat de locks",
    shortName: "Achat de locks",
    description:
      "Locks et extensions à l'achat : synthétiques, semi-naturelles, naturelles ou cheveux humains, de 6 à 30 pouces.",
    image: {
      alt: "Locks et extensions proposées à l'achat par LP LOCKS",
      slot: "services/achat-de-locks",
      tone: "soft",
    },
    priceIds: ["synthetique"],
    conditions: ["Aucun paiement en ligne : la commande se finalise avec LP LOCKS."],
    duration: null,
    href: "/services#achat",
    status: "a-confirmer",
  },
];
