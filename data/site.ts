/** Informations générales et coordonnées — source unique pour tout le site. */
export const site = {
  name: "LP LOCKS",
  /**
   * Adresse publique du site, sans barre oblique finale. À définir à la mise en ligne
   * avec la variable d'environnement NEXT_PUBLIC_SITE_URL (ex. https://www.mondomaine.com).
   * Sert au plan du site, aux liens canoniques et à l'aperçu de partage.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "Les locks, ton style. Ton identité.",
  description:
    "LP LOCKS, marque spécialisée exclusivement dans les locks à Abidjan : départ de locks durables, pose de locks temporaires, achat de locks et extensions.",
  city: "Abidjan",
  country: "Côte d'Ivoire",
  currency: "FCFA",
  contact: {
    /** Format international sans « + » ni espaces, utilisé par wa.me. */
    whatsappNumber: "2250799331686",
    whatsappDisplay: "+225 07 99 33 16 86",
    /**
     * Lien WhatsApp Business fourni par LP LOCKS, utilisé pour les boutons de contact.
     * Ce type de lien n'accepte pas de message prérempli : les envois de projet,
     * de commande et de demande passent donc par le numéro (voir lib/whatsapp.ts).
     */
    whatsappChatUrl: "https://wa.me/message/YHAD5F6YRWM2C1",
    waveDisplay: "+225 07 99 33 16 86",
    instagramHandle: "locsperfect",
    instagramUrl: "https://www.instagram.com/locsperfect",
  },
  /** Logo officiel (fichiers dans /public/assets/brand). */
  logo: {
    /** Version à utiliser sur fond clair (pastille noire). */
    onLight: "/assets/brand/logo-noir.png",
    /** Version à utiliser sur fond sombre (pastille claire). */
    onDark: "/assets/brand/logo-clair.png",
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Mise en avant visuelle dans la navigation. */
  featured?: boolean;
}

export const mainNav: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Nos services", href: "/services" },
  { label: "MY LOCKS DESIGN", href: "/my-locks-design", featured: true },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Galerie", href: "/galerie" },
  { label: "Conseils", href: "/care" },
  { label: "Contact", href: "/contact" },
];
