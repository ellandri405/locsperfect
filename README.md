# LP LOCKS — site web

Site de la marque LP LOCKS (Abidjan) : présentation des prestations et configurateur **MY LOCKS DESIGN**.

> État actuel : **toutes les phases sont livrées**. Reste à fournir avant mise en ligne : photographies, mentions légales, nom de domaine.
> Voir `PROJECT_STATUS.md` pour le détail et `DECISIONS.md` pour les choix et les points à valider.

## Technologies

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict
- Tailwind CSS 4 (jetons de design dans `app/globals.css`)
- Motion (animations) · Lucide (icônes) · jsPDF (récapitulatif PDF, généré dans le navigateur)
- Polices Fraunces (titres) et Manrope (texte), hébergées localement via `@fontsource`

Aucun backend, aucune base de données, aucune clé d'API.

## Installation et lancement

```bash
npm install
npm run dev          # développement — http://localhost:3000
npm run build        # compilation de production
npm run start        # sert la version compilée
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm test             # tests unitaires (tarifs, règles du parcours, sauvegarde)
npm run test:visual  # vérifications Playwright (site lancé sur le port 3000)
npm run test:a11y    # audit d'accessibilité axe (site lancé sur le port 3000)
npm run visuels      # recense les images déposées dans public/assets (lancé automatiquement avant dev et build)
```

`test:visual` nécessite Playwright (`npm i -D playwright && npx playwright install chromium` s'il n'est pas déjà disponible).
Après un `npm run build`, **arrêter puis relancer** `npm run start` : un ancien serveur sert des pages sans styles.

## Structure

```text
app/                 Pages (une par dossier) + globals.css (jetons de design)
  design-system/     Page de démonstration des composants (/design-system, non indexée)
  my-locks-design/   Configurateur
components/
  ui/                Design system : boutons, sélecteurs, champs, modale, accordéon…
  layout/            En-tête, pied de page, logo, page provisoire
  home/              Sections de la page d'accueil
  shared/            Blocs communs aux pages (en-tête de page, tarifs, filtres)
  catalogue/ gallery/ forms/ before-after/
  configurator/      MY LOCKS DESIGN
data/                Données commerciales (source unique)
lib/                 Logique : formatage, WhatsApp, sauvegarde locale
hooks/ types/        Hooks React et types TypeScript
public/assets/       Visuels (brand, hero, models, services, gallery…)
scripts/             Recensement des visuels
tests/               Tests unitaires, vérifications navigateur, audit d'accessibilité
docs/                Guide des visuels
```

## Modifier les données

| Besoin | Fichier |
|---|---|
| Coordonnées, liens WhatsApp, Instagram, menu | `data/site.ts` |
| Tarifs (et leur statut de validation) | `data/prices.ts` |
| Zones et frais de déplacement | `data/locations.ts` |
| Les trois offres | `data/services.ts` |
| Produits du catalogue | `data/products.ts` |
| Galerie (visuels et catégories) | `data/gallery.ts` |
| Articles de conseils | `data/care.ts` |
| Questions fréquentes | `data/faq.ts` |
| Transformations avant / après | `data/before-after.ts` |
| Mentions légales (éditeur, hébergeur) | `data/legal.ts` |
| Types de projet, techniques, longueurs, couleurs, textures, matières, styles | `data/configurator.ts` |
| Inspirations du configurateur | `data/inspirations.ts` |
| Règles du parcours (champs affichés, obligatoires) | `lib/configurator.ts` |
| Règles de calcul de l'estimation | `lib/pricing.ts` |
| Couleurs et typographie du site | `app/globals.css` |

### Valider un tarif

Dans `data/prices.ts`, chaque tarif porte `status: "a-confirmer"`. Une fois confirmé par LP LOCKS :
passer à `status: "valide"` et compléter `conditions`. `amount: null` signifie « Sur devis ».

### Ajouter ou remplacer un visuel

Déposer l'image dans `public/assets/` **sous le nom de son emplacement** (ex. `public/assets/hero/hero-principal.webp`),
puis relancer `npm run dev` ou `npm run build`. Aucun code à modifier. Tant qu'un fichier manque, l'emplacement
« Visuel à venir » indique le nom attendu.

La liste complète des visuels, leurs formats et les consignes de génération sont dans **`docs/VISUELS.md`**.
Les images sont étiquetées « Image générée par IA » par défaut ; les vraies photos se déclarent dans
`public/assets/photos-reelles.txt`.

### Modifier la grille du départ de locks

Dans `data/prices.ts` : `startPriceGrid` (prix par technique et par tranche) et `startQuantityTiers` (tranches).
Après toute modification de tarif, lancer `npm test` : les tests vérifient chaque case de la grille.

### Ajouter un style ou une inspiration

- Un style (filtre) : ajouter une entrée à `styleOptions` dans `data/configurator.ts`.
- Une inspiration : dans `data/inspirations.ts`, ajouter une entrée avec sa photo (`image.src`) et ses caractéristiques
  (longueur, couleur, texture, épaisseur, styles), et `placeholder: false`. Le configurateur la propose automatiquement
  quand les choix de la cliente s'en rapprochent.

### Ajouter un produit

Dans `data/products.ts`, ajouter un objet au tableau `products` avec un `id` unique et `published: true`.
Renseigner `color`, `texture` et `availability` uniquement lorsqu'ils sont connus (sinon `null`) :
les filtres correspondants apparaissent d'eux-mêmes dans le catalogue.

### Ajouter une photo à la galerie

Dans `data/gallery.ts`, renseigner `image.src` et choisir `kind` selon l'origine réelle du visuel :
`"realisation"` (travail de LP LOCKS), `"inspiration"` ou `"ia"` (image générée). L'étiquette s'affiche sur la photo.

### Ajouter un article de conseils ou une question

Ajouter un objet dans `data/care.ts` (la page de l'article est créée automatiquement) ou dans `data/faq.ts`.

### Changer le logo

Remplacer `logo-noir.png` (fond clair) et `logo-clair.png` (fond sombre) dans `public/assets/brand/`,
ainsi que `app/icon.png` (icône d'onglet). Les chemins sont déclarés dans `data/site.ts`.

## Déploiement

Site Next.js standard, entièrement statique à ce stade : déployable sur Vercel, Netlify ou tout hébergeur Node
(`npm run build` puis `npm run start`).

### Variables importantes

| Variable | Rôle | Valeur |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du site (plan du site, liens canoniques, aperçu de partage) | ex. `https://www.mondomaine.com` — à définir **quand le site a son propre nom de domaine** |

Sur Vercel, aucune variable n'est nécessaire pour un premier déploiement : le site utilise automatiquement
l'adresse de production du projet (`VERCEL_PROJECT_PRODUCTION_URL`, fournie par Vercel).

Aucune autre variable, aucune clé d'API, aucun secret.

### Déployer sur Vercel

1. Sur vercel.com, se connecter avec GitHub puis « Add New… » → « Project ».
2. Importer le dépôt, branche `main`. Vercel détecte Next.js : ne rien changer aux réglages
   (commande de build `npm run build`, dossier de sortie géré par Next.js, aucune variable requise).
3. Cliquer « Deploy ». Chaque envoi sur `main` redéploie ensuite le site automatiquement.
4. Après l'ajout d'un nom de domaine : définir `NEXT_PUBLIC_SITE_URL` dans Settings → Environment Variables, puis redéployer.

### Liste de contrôle avant mise en ligne

1. Définir `NEXT_PUBLIC_SITE_URL` si le site utilise son propre nom de domaine.
2. Compléter `data/legal.ts` (la page légale redevient indexable d'elle-même).
3. Déposer les visuels (`docs/VISUELS.md`) et relancer `npm run build`.
4. Passer à `"valide"` les tarifs confirmés dans `data/prices.ts` et `data/locations.ts`.
5. Relire les articles de `data/care.ts` et passer `validated` à `true`.
6. Lancer `npm test`, `npm run test:visual` et `npm run test:a11y`.
7. Essayer le parcours complet sur un vrai téléphone, jusqu'à la réception du message dans WhatsApp.
