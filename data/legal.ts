/**
 * Informations légales de l'éditeur du site.
 * `null` = information non communiquée : la page affiche « À compléter »
 * et reste exclue des moteurs de recherche tant que tout n'est pas renseigné.
 */
export const legal = {
  /** Nom de l'entreprise ou de l'entrepreneure. */
  companyName: null as string | null,
  /** Forme juridique et numéro d'immatriculation (RCCM, etc.). */
  registration: null as string | null,
  /** Adresse professionnelle. */
  address: null as string | null,
  /** Responsable de la publication. */
  publisher: null as string | null,
  /** Adresse e-mail de contact. */
  email: null as string | null,
  /** Hébergeur du site : nom et adresse. */
  host: null as string | null,
};

export const legalComplete = Object.values(legal).every(Boolean);
