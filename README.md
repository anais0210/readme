# Générateur de README GitHub

Application Next.js permettant de composer un README de profil GitHub moderne, avec prévisualisation fidèle au rendu GitHub.

## Fonctionnalités

- Identité et bio (prénom/pseudo, nom d’utilisateur·ice GitHub)
- Liens stylisés en badges cliquables (GitHub, LinkedIn, Site web)
- Compétences techniques via badges (catégories repliables)
- Compétences comportementales (Soft skills)
- Compétences clés (jusqu’à 3) avec liens vers dépôt et ressource
- Prévisualisation “GitHub-like” (support GFM + HTML) et copie/téléchargement du Markdown
- Thème clair/sombre, nombre de colonnes ajustable pour la prévisualisation
- Statistiques GitHub: carte Stats, Langages les plus utilisés, Streak, et Graphique d’activité

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

## Personnalisation rapide

- Rendu/sections: `lib/template.ts`
- Formulaire/UI: `app/page.tsx`
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

- Les services d’images tiers (stats/langs/streak/graph) peuvent être soumis à du rate limiting

## Licence

À définir par le/la propriétaire du projet.
