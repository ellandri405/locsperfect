# Décisions — LP LOCKS

## Choix techniques

| Décision | Raison |
|---|---|
| Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4 | Stack demandée, versions stables et compatibles au 11/11/2026 |
| Polices hébergées localement (`@fontsource`) | Pas de dépendance à un service tiers, pas de transfert de données vers Google |
| Pas de shadcn/ui ni Radix pour l'instant | Les composants nécessaires reposent sur des éléments natifs accessibles (`<dialog>`, boutons radio) ; moins de dépendances |
| Sélecteurs = vrais boutons radio masqués | Navigation clavier et lecteurs d'écran gérés nativement |
| Sauvegarde du configurateur dans `localStorage`, clé `lp-locks:projet`, avec numéro de version | Demandé ; la version permet de gérer les anciens brouillons |
| PDF généré dans le navigateur avec jsPDF (chargé à la demande) | Aucune donnée personnelle ne quitte l'appareil ; pas de serveur |
| Pas de React Hook Form ni Zod | Deux formulaires courts : la validation tient dans `lib/validation.ts`, testée unitairement |
| Vitest pour les tests unitaires | Vérifie les règles tarifaires indépendamment de l'interface |
| Coordonnées (nom, numéro) non enregistrées dans `localStorage` | Ne pas conserver de données personnelles sans nécessité |

## Choix de design (validés par LP LOCKS le 11/11/2026)

- Titres en **Fraunces** (serif expressive, italique verte pour l'emphase), texte en **Manrope**.
- Grands panneaux arrondis, fonds vert très clair et vert forêt, beaucoup d'espace blanc.
- Boutons en forme de pilule ; vert forêt pour l'action principale.
- Logo officiel (pastille « Locs Perfect Hair — Made in CI ») : version noire sur fond clair, version claire sur fond sombre,
  accompagné du nom « LP LOCKS » en toutes lettres car le texte de la pastille est illisible en petite taille.
- **Tutoiement partout**, y compris l'accroche : « Les locks, ton style. Ton identité. » (demande du 11/11/2026).
- Formulations neutres en genre lorsque c'est possible (modèles masculins et féminins).

## Règles métier appliquées

- Les extensions sont obligatoires pour les locks temporaires : mention affichée sur la carte.
- Un tarif non validé n'est jamais affiché comme définitif. `amount: null` = « Sur devis ».
- L'acompte de 10 000 FCFA n'est ajouté automatiquement à aucune prestation.
- Aucune réalisation, avis client, stock ou disponibilité inventé.
- Une demande n'est jamais présentée comme une réservation confirmée.

## Tarifs

**Confirmés par LP LOCKS le 11/11/2026 :**

Départ de locks (au-delà de 120 locks : sur devis)

| Technique | 60 à 80 locks | 81 à 100 locks | 101 à 120 locks |
|---|---:|---:|---:|
| Instantané au crochet | 25 000 | 30 000 | 35 000 |
| Instantané base peigne | 27 000 | 34 000 | 41 000 |

Frais de déplacement : zone 3 = 5 000 FCFA, zone 4 = 6 000 FCFA.

> Remarque : un message précédent indiquait 30 000 FCFA pour l'instantané base peigne ; la grille ci-dessus,
> plus récente et plus détaillée, donne 27 000 FCFA en 60–80 locks. C'est la grille qui est appliquée.

Précisions reçues : « Départ simple à partir de 25 000 » = instantané au crochet (première tranche) ;
« Twist 10 000 » = départ en twists, façon nappy ; « Peigne 20 000 » = départ au peigne seul avec produit fixant
(gel ou mousse), différent de l'instantané.

Tous les autres tarifs restent « communiqués, à confirmer » et sont affichés avec cette mention.

## Règles de calcul de l'estimation (`lib/pricing.ts`)

- Départ : prix de la grille selon technique et tranche. Twists (10 000) et peigne (20 000) : tarif unique,
  quel que soit le nombre de locks (confirmé le 12/11/2026).
- Extensions d'une pose : **prix à la mèche × nombre de locks** (confirmé le 12/11/2026). Comme le nombre de locks est une
  tranche, le résultat est une fourchette. Plus de 120 locks, 24–30 pouces ou matière sans tarif : sur devis.
- Pose temporaire (confirmé le 12/11/2026) :
  - extensions fournies par LP LOCKS : main-d'œuvre = grille du départ + **5 000 FCFA (base crochet) ou 7 000 FCFA (base peigne)**,
    soit 30 000 / 35 000 / 40 000 au crochet et 34 000 / 41 000 / 48 000 au peigne ; les extensions s'ajoutent
    (prix à la mèche × nombre de locks) ;
  - la cliente vient avec ses extensions : **pose simple à 15 000 FCFA**, tarif unique, sans coût d'extensions.
- La grille de base est le tarif du départ de locks sans ajout d'extensions.
- Départ de locks **avec extensions** (confirmé le 12/11/2026) : tarif de la grille selon la tranche + le même supplément
  de 5 000 FCFA (crochet) ou 7 000 FCFA (base peigne), puis les extensions (prix à la mèche × nombre de locks).
- Achat : prix à la mèche × quantité ; synthétique en « à partir de » ; matières sans tarif et 24–30 pouces : sur devis.
- Déplacement : ajouté pour les prestations (départ, temporaires), pas pour un achat. Zone 5 ou localité inconnue : sur devis.
- Acompte : jamais ajouté. Total = somme des montants connus ; « De … à … » en cas de fourchette,
  « À partir de » s'il reste des éléments non chiffrés ou un prix minimal.

## Informations à confirmer par LP LOCKS

1. **Tarifs** : validation de chaque prix et de ses conditions d'application (quelle technique, forfait ou supplément).
2. ~~Prix à la mèche~~ — validés le 12/11/2026 (locks naturelles 400 à 1 300 FCFA, synthétiques dès 100 FCFA).
3. ~~Pose temporaire et départ avec extensions~~ — réglés le 12/11/2026 (voir « Règles de calcul »).
   Reste à confirmer : les départs en **twists** et au **peigne** (hors grille) prennent-ils aussi un supplément avec extensions ?
   Actuellement : non, aucun supplément n'a été défini pour eux.
4. **Locks synthétiques** : grille de prix par produit. **Semi-naturelles et cheveux humains** : prix inconnus (affichés « Sur devis »).
5. **Frais de déplacement** : zones 1, 2 et 5 à confirmer (3 et 4 confirmées).
   La localité « Zone 4 » (quartier de Marcory) figure dans la zone tarifaire 3 : à confirmer.
6. **Acompte** : pour quelles prestations ?
7. **Matières** : texte explicatif pour chacune.
8. **Couleurs et textures** : liste définitive ; les teintes du nuancier sont indicatives.
9. **Techniques et finitions** du départ de locks : liste des options.
10. **Lieu des prestations** : à domicile uniquement, ou aussi en salon ?
11. **Photographies** (`docs/VISUELS.md`) ; logo en version vectorielle (SVG) si disponible.
17. **Lien WhatsApp** : confirmer que les envois de projet peuvent continuer à passer par le numéro (le lien Business
    ne transporte pas de message prérempli).
18. ~~Tranches de nombre de locks pour les locks temporaires~~ — validées le 12/11/2026.
16. **Bibliothèque d'inspirations** : photos classées par longueur, couleur, texture, épaisseur et style.
14. **Textes LP LOCKS CARE** : relecture des six articles provisoires.
15. ~~Nom de la marque~~ — décidé le 12/11/2026 : logo « Locs Perfect Hair » + nom « LP LOCKS ».
12. **Mentions légales** : raison sociale, responsable, hébergeur.
13. **Nom de domaine** (nécessaire pour le sitemap et Open Graph).

## Décisions du 12/11/2026

- La grille du départ de locks fait foi (27 000 FCFA pour l'instantané base peigne en 60–80 locks).
- La photo de la cliente n'est pas jointe au PDF.
- Lien WhatsApp Business `https://wa.me/message/YHAD5F6YRWM2C1` pour les boutons de contact. Ce type de lien n'accepte pas
  de texte prérempli : les messages de projet restent envoyés au numéro, faute de quoi les choix du configurateur
  ne seraient plus transmis.
- Visuels : images réalistes générées par IA, modèles africains aux cheveux afro. Elles sont étiquetées
  « Image générée par IA » automatiquement et ne sont jamais présentées comme des réalisations.

## Accessibilité et référencement (12/11/2026)

- **Vert sauge** : la teinte de la palette (#78947E) n'est pas assez contrastée pour du petit texte sur fond clair
  (rapport 3,3 pour 4,5 requis). Elle reste utilisée pour les accents ; le texte utilise une variante assombrie
  `sage-ink` (#4C6652). Même ajustement pour le vert des boutons WhatsApp (#0E7A40).
- Animations d'entrée du hero en CSS pur : le titre s'affiche sans attendre le JavaScript (performance de l'accueil 85 → 98).
- Page légale non indexée tant que `data/legal.ts` est incomplet ; `/design-system` exclu des moteurs de recherche.
- Adresse du site lue dans `NEXT_PUBLIC_SITE_URL`.
- Comparateur avant / après : réservé à de vraies transformations LP LOCKS ; jamais d'image générée par IA.

## Fonctionnalités reportées

Paiement en ligne, stocks, espace client, administration, prise de rendez-vous automatisée, simulation IA,
API Higgsfield, chatbot, fidélité, application mobile (section 22 du cahier des charges).
