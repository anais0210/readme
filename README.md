# Générateur de README GitHub

Application Next.js permettant de composer un README de profil GitHub moderne, avec prévisualisation fidèle au rendu GitHub.

## Fonctionnalités

Parcours en 4 étapes avec aperçu en direct (onglets Aperçu / Markdown) :

1. **Profil** : identité, bio, liens, bouton « Remplir depuis GitHub », modèles de départ (formatrice, junior, freelance)
2. **Compétences** : technos en badges ou en icônes (Skill Icons), recherche, technos libres (logo simple-icons), soft skills, compétences clés
3. **Blocs** : chaque bloc s’active, se règle et se range sur place
   - Bannière animée, texte animé (Typing SVG)
   - Projets épinglés, stats GitHub, série de contributions, calendrier
   - Cartes de résumé (github-profile-summary-cards), trophées (github-profile-trophy)
   - Liens, fun fact / citation, changelog dynamique, compteur de visites
4. **Style & export** : style des titres et des badges, thème des cartes, téléchargement, copie, lien de partage, guide de publication

Et aussi :

- **Importer un README** (collé ou fichier `.md`) pour le modifier : restauration exacte grâce à un commentaire de configuration invisible sur GitHub, ou analyse d’un README écrit ailleurs
- Markdown modifiable à la main, avec possibilité de reprendre les retouches dans le formulaire
- Sauvegarde automatique dans le navigateur, thème clair / sombre / système

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- React Hook Form, next-themes
- react-markdown + remark-gfm + rehype-raw
- github-markdown-css (styles GitHub pour le rendu)
- lucide-react (icônes)

## Prérequis

- Node.js ≥ 18

## Installation

```bash
npm ci
npm run dev
# http://localhost:3000
```

## Scripts

- `npm run dev`: serveur de développement (Turbopack)
- `npm run build`: build de production
- `npm run start`: serveur de production
- `npm run lint`: linting
- `npm test`: tests unitaires (Vitest) du générateur et de l’import

## Personnalisation rapide

- Rendu/sections: `lib/template.ts` · import: `lib/import.ts` · valeurs par défaut: `lib/config.ts`
- Catalogue de technos: `lib/badges.ts` · modèles: `lib/presets.ts`
- Écran: `app/page.tsx` et `components/steps/*`
- Styles globaux: `app/globals.css` (inclut les styles GitHub)

## Déploiement sur Vercel

- Framework preset: Next.js (auto)
- Build Command: `next build`
- Output: `.next`
- Root Directory: racine du projet
- Conseils:
  - Un seul lockfile à la racine
  - Ajouter une page `app/not-found.tsx` (recommandé) et un `app/favicon.ico`

## Notes d’accessibilité

- Contrastes adaptés en clair/sombre, structure sémantique, contrôles clavier

## Limitations connues

- Les services d’images tiers (stats, streak, trophées…) peuvent être saturés ou fermer. Les instances github-readme-stats et github-profile-trophy sont configurables (étape « Blocs » › Options avancées).
- L’instance officielle de github-profile-trophy est hors service : un miroir communautaire (`trophy.ryglcloud.net`) est utilisé par défaut.

## Licence

À définir par le/la propriétaire du projet.
