# Générateur de README GitHub

Application Next.js permettant de composer un README de profil GitHub moderne, avec prévisualisation fidèle au rendu GitHub.

## Fonctionnalités

Un parcours « une question à la fois », avec l’aperçu du README en direct à côté :

- Seul le pseudo GitHub est obligatoire, chaque autre question peut être passée
- Un bouton récupère le nom, la bio et le site depuis le profil GitHub public
- Profils de départ (formatrice, junior, freelance) qui pré-remplissent bio, technos et blocs
- Technos en badges ou en icônes (Skill Icons), recherche et technos libres (logo simple-icons)
- Blocs à cocher : bannière, texte animé (Typing SVG), projets épinglés, stats, cartes de résumé, trophées, compétences clés, fun fact, compteur de visites, changelog. Les questions sur un bloc n’apparaissent que s’il est coché
- Récapitulatif final : téléchargement, copie, lien de partage, guide de publication, réponses modifiables, ordre des blocs, options avancées
- Interface à fort contraste : bordures 2 px, textes d’aide foncés, un seul bouton principal par écran, focus clavier épais

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
- Écran: `app/page.tsx` · questions du parcours: `components/wizard/questions.tsx`
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
