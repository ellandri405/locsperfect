# Visuels LP LOCKS — liste, formats et consignes de génération

Le site est prêt à recevoir les images : **il suffit de déposer chaque fichier dans `public/assets/`
sous le nom de son emplacement**, puis de relancer le site (`npm run dev` ou `npm run build`).
Aucun code à modifier.

- Exemple : l'emplacement `hero/hero-principal` attend `public/assets/hero/hero-principal.webp`.
- Formats acceptés : `.webp` (recommandé), `.avif`, `.jpg`, `.png`.
- Tant qu'un fichier manque, l'emplacement « Visuel à venir » reste affiché avec le nom attendu.

## Transparence sur l'origine des images

Toute image déposée est considérée comme **générée par IA** et porte automatiquement l'étiquette
« Image générée par IA » sur le site. Une image générée n'est jamais présentée comme une réalisation de LP LOCKS.

Pour une **vraie photo** (réalisation LP LOCKS, shooting), ajouter son emplacement dans
`public/assets/photos-reelles.txt`, un par ligne — l'étiquette disparaît :

```text
gallery/01
hero/hero-principal
```

Dans la galerie, préciser en plus l'origine dans `data/gallery.ts` (`kind: "realisation"`, `"inspiration"` ou `"ia"`).

## Direction commune à toutes les images

- **Modèles** : femmes et hommes africains, peau noire (carnations variées), cheveux afro de type 4, portant des locks.
- **Rendu** : photographie réaliste, éditoriale, naturelle. Pas d'illustration, pas de rendu 3D, pas de peau « plastique ».
- **Fonds** : neutres — blanc cassé, gris clair, ou vert forêt profond (#174734). Jamais de décor de salon générique.
- **Lumière** : naturelle douce ou studio diffuse ; texture des locks nettement visible.
- **Interdits** : aucun texte, logo ou filigrane dans l'image ; pas de mains ou de visages déformés.
- **Cohérence** : garder le même style de lumière et de fond sur toute une série.

### Consigne de base (à placer au début de chaque demande, en anglais pour de meilleurs résultats)

```text
Photorealistic editorial portrait photograph of a Black African [woman/man] with dark skin and natural
afro-textured (type 4) hair styled in [DESCRIPTION DES LOCKS]. Soft diffused studio light, neutral
[off-white / light grey / deep forest green] seamless background, natural skin texture, sharp detailed
loc texture, calm confident expression, minimal styling, premium beauty campaign look.
Shot on a full-frame camera, 85mm lens, shallow depth of field. No text, no logo, no watermark.
```

### Vocabulaire pour décrire les locks

| Caractéristique | Formulation |
|---|---|
| Longueur courte (6–10 pouces) | `short locs, chin length` |
| Mi-longue (12–16 pouces) | `shoulder-length locs` |
| Longue (18 pouces et plus) | `long locs reaching mid-back` |
| Fines / moyennes / épaisses | `thin micro locs` / `medium locs` / `thick chunky locs` |
| Texture naturelle / ondulée / bouclée / frisée | `straight natural locs` / `wavy locs` / `curly-ended locs` / `coily textured locs` |
| Noir naturel / noir profond | `natural soft black` / `jet black` |
| Brun foncé / brun chocolat | `dark brown` / `chocolate brown` |
| Caramel / blond | `caramel brown` / `honey blonde` |
| Libres / attachées | `worn down, loose` / `tied up in a high bun` ou `half-up style` |

## Liste des visuels attendus

Dimensions conseillées : grand côté de 1 600 px (2 000 px pour le hero), fichier inférieur à 400 Ko.

### Priorité 1 — pages principales (8 images)

| Emplacement | Format | Sujet |
|---|---|---|
| `hero/hero-principal` | portrait 4:5 | Visuel signature : femme, locks longues, fond vert forêt, cadrage buste, regard caméra |
| `services/depart-de-locks` | portrait 4:5 | Départ de locks : locks courtes et régulières, récentes, vue de trois quarts |
| `services/locks-temporaires` | portrait 4:5 | Locks temporaires longues, portées libres |
| `services/achat-de-locks` | portrait 4:5 | Nature morte : mèches de locks posées à plat, plusieurs longueurs et teintes, fond neutre |
| `models/depart-de-locks` | paysage 5:4 | Homme ou femme, départ de locks, gros plan sur les racines |
| `models/locks-temporaires` | paysage 5:4 | Femme, locks temporaires, mouvement léger |
| `models/achat-de-locks` | paysage 5:4 | Mèches de locks tenues en main, gros plan |
| `models/apercu-par-defaut` | paysage 5:4 | Vue de dos ou de profil, locks mi-longues, fond clair |

### Priorité 2 — inspirations de MY LOCKS DESIGN (18 images)

Format portrait 4:5, sujet centré (l'image est aussi recadrée en paysage dans l'aperçu).
Nom : `models/{longueur}-{couleur}`. Chaque image doit correspondre exactement aux caractéristiques ci-dessous,
car le configurateur s'en sert pour proposer l'inspiration la plus proche des choix de la cliente.

| Emplacement | Longueur | Couleur | Texture | Épaisseur | Coiffure |
|---|---|---|---|---|---|
| `models/courte-noir-naturel` | courte | noir naturel | naturelle | fine | libres |
| `models/courte-noir-profond` | courte | noir profond | ondulée | moyenne | attachées |
| `models/courte-brun-fonce` | courte | brun foncé | bouclée | épaisse | libres |
| `models/courte-brun-chocolat` | courte | brun chocolat | frisée | fine | attachées |
| `models/courte-caramel` | courte | caramel | naturelle | moyenne | libres |
| `models/courte-blond` | courte | blond | ondulée | épaisse | attachées |
| `models/moyenne-noir-naturel` | mi-longue | noir naturel | ondulée | épaisse | libres |
| `models/moyenne-noir-profond` | mi-longue | noir profond | bouclée | fine | attachées |
| `models/moyenne-brun-fonce` | mi-longue | brun foncé | frisée | moyenne | libres |
| `models/moyenne-brun-chocolat` | mi-longue | brun chocolat | naturelle | épaisse | attachées |
| `models/moyenne-caramel` | mi-longue | caramel | ondulée | fine | libres |
| `models/moyenne-blond` | mi-longue | blond | bouclée | moyenne | attachées |
| `models/longue-noir-naturel` | longue | noir naturel | bouclée | moyenne | libres |
| `models/longue-noir-profond` | longue | noir profond | frisée | épaisse | attachées |
| `models/longue-brun-fonce` | longue | brun foncé | naturelle | fine | libres |
| `models/longue-brun-chocolat` | longue | brun chocolat | ondulée | moyenne | attachées |
| `models/longue-caramel` | longue | caramel | bouclée | épaisse | libres |
| `models/longue-blond` | longue | blond | frisée | fine | attachées |

Alterner modèles féminins et masculins sur la série.

### Priorité 3 — galerie (12 images, portrait 4:5)

| Emplacement | Sujet |
|---|---|
| `gallery/01` | Locks naturelles longues, portées libres |
| `gallery/02` | Locks naturelles courtes |
| `gallery/03` | Locks temporaires longues |
| `gallery/04` | Locks temporaires colorées |
| `gallery/05` | Locks fines attachées |
| `gallery/06` | Locks épaisses, portées libres |
| `gallery/07` | Locks longues attachées |
| `gallery/08` | Locks courtes colorées |
| `gallery/09` | Locks fines et longues |
| `gallery/10` | Locks épaisses et courtes |
| `gallery/11` | Locks temporaires attachées |
| `gallery/12` | Locks naturelles colorées |

Les quatre premières apparaissent aussi sur la page d'accueil. La galerie est l'endroit idéal pour les
**vraies réalisations LP LOCKS** : elles sont plus convaincantes que des images générées.

### Priorité 4 — conseils et catalogue (19 images)

| Emplacement | Format | Sujet |
|---|---|---|
| `care/entretien` | paysage 16:9 | Gros plan : locks propres et hydratées |
| `care/reprises` | paysage 16:9 | Gros plan sur des racines soignées |
| `care/gestes-a-eviter` | paysage 16:9 | Locks attachées sans tension, vue de dos |
| `care/temporaires` | paysage 16:9 | Locks temporaires, détail de la base |
| `care/extensions` | paysage 16:9 | Mèches d'extensions posées à plat |
| `care/rendez-vous` | paysage 16:9 | Cheveux afro naturels, avant la pose |
| `lengths/naturelle-6` … `lengths/naturelle-22` (9 images : 6, 8, 10, 12, 14, 16, 18, 20, 22) | paysage 4:3 | Une mèche de lock naturelle de la longueur indiquée, à plat, avec la même échelle sur toute la série |
| `lengths/naturelle-24-30` | paysage 4:3 | Mèche très longue |
| `textures/synthetique` | paysage 4:3 | Gros plan matière : locks synthétiques |
| `textures/semi-naturelle` | paysage 4:3 | Gros plan matière : locks semi-naturelles |
| `textures/cheveux-humains` | paysage 4:3 | Gros plan matière : locks en cheveux humains |

Pour les photos de produits (longueurs et matières), privilégier de **vraies photos** de la marchandise :
une image générée pourrait ne pas représenter fidèlement ce qui est vendu.

## Avant de publier

- Vérifier les conditions d'utilisation commerciale de l'outil de génération (Higgsfield ou autre).
- Écarter toute image aux mains, visages ou locks déformés.
- Ne pas utiliser le visage d'une personne réelle identifiable sans son accord.
