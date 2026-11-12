# État du projet LP LOCKS

Dernière mise à jour : 12 novembre 2026

## Phase actuelle

**Phases 0 à 7 terminées — version prête à être présentée.**
Le site est complet et testé. Il lui manque uniquement des contenus à fournir par LP LOCKS avant mise en ligne
(photographies, mentions légales, nom de domaine) : voir « Avant la mise en ligne ».

## Fonctionnalités livrées

**Site**
- Accueil : hero, marque, trois offres, section MY LOCKS DESIGN interactive, aperçu galerie, réassurance, appel final.
- Nos services : trois prestations, grille tarifaire du départ de locks, reprises et soins, zones de déplacement.
- Catalogue : 13 fiches, filtres (matière, longueur, prix), tri, commande sur WhatsApp par produit.
- Galerie : filtres par catégorie, grand format avec navigation, étiquette d'origine sur chaque visuel,
  comparateur avant / après.
- LP LOCKS CARE : six articles de conseils. FAQ : onze questions. Contact : demande de rendez-vous par WhatsApp.
- Mentions légales et confidentialité. Page 404 en français.
- En-tête avec logo officiel et accès WhatsApp, menu mobile, pied de page.

**MY LOCKS DESIGN** (sept étapes)
1. Projet — 2. Personnalisation (champs adaptés au projet, obligatoires contrôlés, incompatibilités expliquées) —
3. Inspirations classées selon les choix — 4. Comparateur de deux styles — 5. Récapitulatif modifiable et localité —
6. Estimation détaillée — 7. Envoi (formulaire, photo facultative, PDF, WhatsApp).
- Aperçu et récapitulatif synchronisés ; sauvegarde locale versionnée ; reprise à la même étape ; réinitialisation.
- Le nom et le numéro de la cliente ne sont jamais enregistrés.

**Règles tarifaires** (`lib/pricing.ts`, détaillées dans `DECISIONS.md`)
- Grille du départ de locks, twists et peigne à tarif unique, extensions = prix à la mèche × nombre de locks (fourchette),
  frais de déplacement par zone, sur devis au-delà des cas connus, acompte jamais ajouté.

**Technique**
- Design system documenté sur `/design-system`.
- Référencement : titres et descriptions par page, liens canoniques, plan du site, robots.txt, image d'aperçu de partage,
  données structurées (accueil et FAQ).
- Visuels : dépôt de fichiers sans modifier le code, étiquette « Image générée par IA » automatique (`docs/VISUELS.md`).

## Avant la mise en ligne (à fournir par LP LOCKS)

1. **Photographies** : tous les visuels sont des emplacements « Visuel à venir ». Liste et consignes dans `docs/VISUELS.md`.
2. **Mentions légales** : entreprise, immatriculation, adresse, responsable, e-mail, hébergeur (`data/legal.ts`).
   Tant qu'elles sont incomplètes, la page affiche « À compléter » et n'est pas indexée.
3. **Nom de domaine** : définir `NEXT_PUBLIC_SITE_URL` chez l'hébergeur. Sans cela, le plan du site, les liens canoniques
   et l'aperçu de partage pointent vers `http://localhost:3000`.
4. **Tarifs encore « à confirmer »** et autres points listés dans `DECISIONS.md`.
5. **Textes LP LOCKS CARE** : six articles provisoires à relire.
6. **Essais sur de vrais appareils** : voir « Non testé ».

## Limites connues

- **Aucune photographie** : la visualisation du configurateur repose sur 18 emplacements de démonstration ;
  la galerie et le comparateur avant / après également. Les mécanismes sont fonctionnels et testés.
- **Aucune image générée** : l'environnement de développement n'a ni outil de génération d'images ni accès
  exploitable à une banque d'images.
- **Liens WhatsApp** : le lien Business (`wa.me/message/…`) ne transporte pas de message prérempli. Il sert aux boutons
  de contact ; les envois de projet, de commande et de rendez-vous passent par le numéro pour transmettre les choix.
- **Estimation des locks temporaires** : la main-d'œuvre de la pose n'est pas chiffrée, son tarif de base n'ayant pas été
  communiqué. Le supplément par dizaine de locks ajoutée (5 000 FCFA base crochet, 7 000 FCFA base peigne) est affiché
  à titre d'information. Le total commence donc par « À partir de ».
- **Finition** du départ de locks : non proposée (liste d'options non communiquée).
- **Photo d'inspiration de la cliente** : ni envoyée par le site ni ajoutée au PDF ; elle la joint elle-même dans WhatsApp.
- **Catalogue** : couleur, texture et disponibilité non renseignées.
- **Logo** fourni en JPEG : un fichier vectoriel (SVG) serait préférable.
- **Adresse d'article inconnue** : la page « introuvable » s'affiche (non indexable) mais répond 200 à la première visite,
  puis 404 (fonctionnement du cache de Next.js 16).
- **Catalogue** : performance mobile mesurée à 91 (affichage principal à 3,0 s en réseau lent simulé), contre 98 à 100 ailleurs.
- Le site de référence seed.com n'a pas pu être consulté depuis l'environnement de développement.

## Tests réalisés (12 novembre 2026)

Tous exécutés et réussis sur la version finale :

| Commande | Résultat |
|---|---|
| `npm run lint` | aucune erreur |
| `npm run typecheck` | aucune erreur |
| `npm run build` | compilation réussie |
| `npm test` | 44 tests unitaires |
| `npm run test:visual` | 294 vérifications dans Chromium |
| `npm run test:a11y` | aucun problème détecté par axe sur 36 écrans (18 vues × mobile et ordinateur) |

**Tests unitaires** : chaque case de la grille tarifaire, sur devis au-delà de 120 locks, twists et peigne à tarif unique,
prix à la mèche, extensions (fourchette, cas sur devis), zones de déplacement, acompte jamais ajouté, locks temporaires,
achat (prix × quantité), champs selon le projet, classement des inspirations, migration et robustesse de la sauvegarde,
validation des formulaires, liens WhatsApp.

**Vérifications dans le navigateur**
- Aucun débordement horizontal sur 11 pages × 6 largeurs (320, 390, 430, 820, 1366, 1920 px) ; aucune erreur console.
- Menu mobile, logo, tutoiement, liens WhatsApp de contact.
- Configurateur : étape 1, puis **parcours complet « départ de locks » sur mobile et ordinateur** — champs obligatoires,
  incompatibilité expliquée, grille, aperçu actualisé, inspiration la plus proche en premier, comparateur côte à côte,
  localité et zone, totaux « De 137 200 à 160 000 » puis « De 168 200 à 191 000 FCFA », bouton « Modifier », estimation,
  photo (refus d'un format non accepté, aperçu), **PDF** (validité, montants identiques au récapitulatif, mention
  d'estimation indicative, coordonnées, logo, absence de la photo de la cliente), **message WhatsApp** (numéro, tous les choix,
  estimation, caractères spéciaux), coordonnées absentes de la sauvegarde, reprise après rechargement.
- Locks temporaires et achat : règles tarifaires et cas « sur devis ».
- Services, catalogue (filtres, tri, état vide), galerie (filtres, grand format, clavier), FAQ, conseils, contact.
- **Comparateur avant / après** : libellés, clavier, clic, toucher, image qui suit le curseur.
- **Référencement** : robots.txt, plan du site (14 adresses), image de partage, titre / description / lien canonique /
  H1 unique, données structurées, page légale non indexée.
- Design system : modale, accordéon, sélecteurs au clavier.

**Performance** (Lighthouse, mobile simulé)

| Page | Performance | Accessibilité | Bonnes pratiques | Référencement |
|---|---:|---:|---:|---:|
| Accueil | 98 | 100 | 100 | 100 |
| MY LOCKS DESIGN | 100 | 100 | 100 | 100 |
| Nos services | 99 | 100 | 100 | 100 |
| Catalogue | 91 | 100 | 100 | 100 |
| Galerie | 98 | 100 | 100 | 100 |
| Contact | 99 | 100 | 100 | 100 |

Ces mesures ont été faites sans photographies : elles devront être refaites une fois les visuels intégrés
(images en WebP, moins de 400 Ko, comme indiqué dans `docs/VISUELS.md`).

Contrôles visuels : captures de chaque page et de chaque étape, PDF généré relu (une page, accents, logo).

**Non testé**
- Safari, Firefox et navigateurs mobiles réels (tous les tests tournent dans Chromium).
- Appareils réels et lecteur d'écran (l'audit axe est automatique et ne couvre qu'une partie des critères).
- Réception effective d'un message dans WhatsApp, inaccessible depuis l'environnement de test : l'adresse ouverte
  et le contenu du message sont vérifiés, pas leur arrivée.
- Le lien WhatsApp Business lui-même (`wa.me/message/YHAD5F6YRWM2C1`) n'a pas pu être ouvert pour vérification.
