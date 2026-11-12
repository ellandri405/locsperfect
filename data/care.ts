import type { CareArticle } from "@/types";

/**
 * LP LOCKS CARE — articles de conseils.
 *
 * Les textes ci-dessous sont des conseils généraux rédigés à titre provisoire
 * (`validated: false`) : ils doivent être relus et complétés par LP LOCKS.
 * Ajouter un article = ajouter un objet à ce tableau, rien d'autre à modifier.
 */
export const careArticles: CareArticle[] = [
  {
    slug: "entretien-des-locks",
    title: "L'entretien des locks au quotidien",
    summary: "Les gestes simples pour garder des locks propres et un cuir chevelu sain.",
    image: { alt: "Entretien des locks", slot: "care/entretien", tone: "forest" },
    sections: [
      {
        title: "Laver",
        points: [
          "Lave régulièrement tes locks et ton cuir chevelu avec un shampoing qui se rince facilement.",
          "Rince longuement : les résidus de produit s'accumulent à l'intérieur des locks.",
        ],
      },
      {
        title: "Sécher",
        points: [
          "Essore délicatement, sans tordre, puis sèche complètement tes locks après chaque lavage.",
          "Évite d'attacher ou de couvrir des locks encore humides.",
        ],
      },
      {
        title: "Protéger",
        points: ["La nuit, protège tes locks avec un bonnet ou un foulard en satin pour limiter les frottements."],
      },
    ],
    validated: false,
  },
  {
    slug: "frequence-des-reprises",
    title: "La fréquence des reprises",
    summary: "Quand faire reprendre ses racines, et pourquoi ne pas trop rapprocher les séances.",
    image: { alt: "Reprise de locks", slot: "care/reprises", tone: "sage" },
    sections: [
      {
        title: "Trouver ton rythme",
        paragraphs: [
          "Le bon intervalle entre deux reprises dépend de la pousse de tes cheveux, de leur texture et de la technique utilisée. LP LOCKS te conseille un rythme adapté lors de ton rendez-vous.",
        ],
      },
      {
        title: "À garder en tête",
        points: [
          "Des reprises trop rapprochées peuvent fragiliser les racines.",
          "Entre deux reprises, évite de resserrer toi-même tes racines.",
        ],
      },
    ],
    validated: false,
  },
  {
    slug: "gestes-a-eviter",
    title: "Les gestes à éviter",
    summary: "Ce qui abîme les locks sans que l'on s'en rende compte.",
    image: { alt: "Gestes à éviter", slot: "care/gestes-a-eviter", tone: "charcoal" },
    sections: [
      {
        title: "À éviter",
        points: [
          "Les coiffures trop serrées, portées longtemps, qui tirent sur les racines.",
          "Les produits épais ou gras en grande quantité, qui laissent des résidus.",
          "Dormir avec des locks humides.",
          "Couper ou séparer toi-même des locks qui se rejoignent, sans conseil.",
        ],
      },
    ],
    validated: false,
  },
  {
    slug: "entretien-des-locks-temporaires",
    title: "L'entretien des locks temporaires",
    summary: "Profiter de tes locks temporaires jusqu'à la dépose.",
    image: { alt: "Locks temporaires", slot: "care/temporaires", tone: "soft" },
    sections: [
      {
        title: "Au quotidien",
        points: [
          "Garde ton cuir chevelu propre et sèche bien la base de tes locks après chaque lavage.",
          "Protège tes locks la nuit avec un bonnet ou un foulard en satin.",
          "Évite de tirer sur les extensions en te coiffant.",
        ],
      },
      {
        title: "La dépose",
        paragraphs: [
          "La durée de port conseillée dépend de la matière et de la pose : LP LOCKS te l'indique lors de ton rendez-vous. Fais réaliser la dépose avec soin pour préserver tes cheveux.",
        ],
      },
    ],
    validated: false,
  },
  {
    slug: "preserver-ses-extensions",
    title: "Préserver ses extensions",
    summary: "Garder des extensions belles plus longtemps, selon leur matière.",
    image: { alt: "Extensions de locks", slot: "care/extensions", tone: "mist" },
    sections: [
      {
        title: "Les bons réflexes",
        points: [
          "Démêle et manipule tes extensions avec douceur, sans tirer sur les attaches.",
          "Sèche-les complètement après un lavage.",
          "Demande à LP LOCKS les précautions propres à ta matière (synthétique, semi-naturelle, naturelle ou cheveux humains), notamment face à la chaleur et à la coloration.",
        ],
      },
    ],
    validated: false,
  },
  {
    slug: "preparer-son-rendez-vous",
    title: "Préparer son rendez-vous",
    summary: "Tout prévoir pour que la séance se passe au mieux.",
    image: { alt: "Préparation du rendez-vous", slot: "care/rendez-vous", tone: "silver" },
    sections: [
      {
        title: "Avant de venir",
        points: [
          "Prépare ton projet avec MY LOCKS DESIGN et garde une photo d'inspiration si tu en as une.",
          "Demande à LP LOCKS comment préparer tes cheveux (lavage, démêlage) selon ta prestation.",
          "Prévois le temps nécessaire : à titre indicatif, environ 5 heures pour 80 locks et 7 heures pour 120 locks.",
        ],
      },
      {
        title: "Le jour même",
        points: ["Confirme l'adresse et l'horaire convenus avec LP LOCKS sur WhatsApp."],
      },
    ],
    validated: false,
  },
];

export function getCareArticle(slug: string) {
  return careArticles.find((a) => a.slug === slug);
}
