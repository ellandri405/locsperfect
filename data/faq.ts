import type { FaqEntry } from "@/types";
import { site } from "./site";

/** Questions fréquentes. Modifier, ajouter ou retirer librement des entrées. */
export const faqEntries: FaqEntry[] = [
  {
    id: "durables-temporaires",
    question: "Quelle est la différence entre locks durables et temporaires ?",
    answer:
      "Le départ de locks durables te permet de commencer des locks que tu gardes dans le temps, avec ou sans extensions. Les locks temporaires te permettent de porter des locks sans engagement durable : elles sont posées avec des extensions.",
    link: { label: "Voir les prestations", href: "/services" },
  },
  {
    id: "sans-extensions",
    question: "Peut-on commencer des locks sans extensions ?",
    answer: "Oui. Le départ de locks durables est possible sans extensions ou avec extensions, selon ton projet.",
  },
  {
    id: "extensions-obligatoires",
    question: "Les extensions sont-elles obligatoires pour les locks temporaires ?",
    answer: "Oui. La pose de locks temporaires nécessite des extensions.",
  },
  {
    id: "matieres",
    question: "Quelles matières sont disponibles ?",
    answer: "Quatre matières : synthétiques, semi-naturelles, naturelles et cheveux humains.",
    link: { label: "Voir le catalogue", href: "/catalogue" },
  },
  {
    id: "longueur",
    question: "Comment choisir une longueur ?",
    answer:
      "Les longueurs vont de 6 à 22 pouces (environ 15 à 56 cm), et de 24 à 30 pouces sur devis. MY LOCKS DESIGN affiche chaque longueur avec son équivalence en centimètres pour t'aider à te projeter.",
    link: { label: "Ouvrir MY LOCKS DESIGN", href: "/my-locks-design" },
  },
  {
    id: "nombre",
    question: "Comment choisir le nombre de locks ?",
    answer:
      "Trois tranches sont proposées pour un départ de locks : 60 à 80, 81 à 100 ou 101 à 120 locks. Le tarif dépend de la tranche et de la technique. Au-delà de 120 locks, LP LOCKS établit un devis.",
  },
  {
    id: "duree",
    question: "Combien de temps dure une pose ?",
    answer:
      "À titre indicatif : environ 5 heures pour 80 locks et environ 7 heures pour 120 locks. La durée exacte dépend de ton projet.",
  },
  {
    id: "deplacement",
    question: "Quels sont les frais de déplacement ?",
    answer:
      "Ils dépendent de ta localité à Abidjan : de 2 000 à 6 000 FCFA selon la zone, et sur devis pour les zones les plus éloignées.",
    link: { label: "Voir les zones", href: "/services#deplacement" },
  },
  {
    id: "reserver",
    question: "Comment réserver ?",
    answer: `Envoie ta demande depuis la page Contact ou directement sur WhatsApp au ${site.contact.whatsappDisplay}. Ta demande n'est pas une réservation automatique : le rendez-vous est confirmé par LP LOCKS.`,
    link: { label: "Faire une demande", href: "/contact" },
  },
  {
    id: "acheter",
    question: "Comment acheter des locks ?",
    answer:
      "Choisis tes locks dans le catalogue puis contacte LP LOCKS sur WhatsApp depuis la fiche du produit. Il n'y a pas de paiement en ligne : la commande se finalise directement avec LP LOCKS.",
    link: { label: "Voir le catalogue", href: "/catalogue" },
  },
  {
    id: "devis",
    question: "Comment demander un devis ?",
    answer:
      "Compose ton projet avec MY LOCKS DESIGN ou écris à LP LOCKS sur WhatsApp en précisant la prestation, la longueur, la matière et ta localité. LP LOCKS te confirme ensuite le devis.",
    link: { label: "Créer mon projet", href: "/my-locks-design" },
  },
];
