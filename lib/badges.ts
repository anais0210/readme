export type BadgeDef = {
  label: string;
  logo?: string;
  color?: string;
  /** Identifiant skillicons.dev, quand l'icône existe (vérifié sur le service). */
  skillIcon?: string;
};

export const BADGE_DEFS: Record<string, BadgeDef> = {
  TypeScript: { label: "TypeScript", logo: "typescript", color: "3178C6", skillIcon: "ts" },
  JavaScript: { label: "JavaScript", logo: "javascript", color: "F7DF1E", skillIcon: "js" },
  React: { label: "React", logo: "react", color: "61DAFB", skillIcon: "react" },
  NextJS: { label: "Next.js", logo: "nextdotjs", color: "000000", skillIcon: "nextjs" },
  NodeJS: { label: "Node.js", logo: "nodedotjs", color: "339933", skillIcon: "nodejs" },
  Express: { label: "Express", logo: "express", color: "000000", skillIcon: "express" },
  Tailwind: { label: "Tailwind CSS", logo: "tailwindcss", color: "38B2AC", skillIcon: "tailwind" },
  CSS3: { label: "CSS3", logo: "css3", color: "1572B6", skillIcon: "css" },
  HTML5: { label: "HTML5", logo: "html5", color: "E34F26", skillIcon: "html" },
  Sass: { label: "Sass", logo: "sass", color: "CC6699", skillIcon: "sass" },
  StyledComponents: { label: "styled-components", logo: "styledcomponents", color: "DB7093", skillIcon: "styledcomponents" },
  Prisma: { label: "Prisma", logo: "prisma", color: "2D3748", skillIcon: "prisma" },
  MongoDB: { label: "MongoDB", logo: "mongodb", color: "47A248", skillIcon: "mongodb" },
  PostgreSQL: { label: "PostgreSQL", logo: "postgresql", color: "4169E1", skillIcon: "postgres" },
  MySQL: { label: "MySQL", logo: "mysql", color: "4479A1", skillIcon: "mysql" },
  SQLite: { label: "SQLite", logo: "sqlite", color: "003B57", skillIcon: "sqlite" },
  Redis: { label: "Redis", logo: "redis", color: "DC382D", skillIcon: "redis" },
  GraphQL: { label: "GraphQL", logo: "graphql", color: "E10098", skillIcon: "graphql" },
  Apollo: { label: "Apollo", logo: "apollographql", color: "311C87", skillIcon: "apollo" },
  Docker: { label: "Docker", logo: "docker", color: "2496ED", skillIcon: "docker" },
  Kubernetes: { label: "Kubernetes", logo: "kubernetes", color: "326CE5", skillIcon: "kubernetes" },
  AWS: { label: "AWS", logo: "amazonwebservices", color: "232F3E", skillIcon: "aws" },
  GCP: { label: "Google Cloud", logo: "googlecloud", color: "4285F4", skillIcon: "gcp" },
  Azure: { label: "Azure", logo: "microsoftazure", color: "0078D4", skillIcon: "azure" },
  Vercel: { label: "Vercel", logo: "vercel", color: "000000", skillIcon: "vercel" },
  Netlify: { label: "Netlify", logo: "netlify", color: "00C7B7", skillIcon: "netlify" },
  Git: { label: "Git", logo: "git", color: "F05032", skillIcon: "git" },
  GitHub: { label: "GitHub", logo: "github", color: "181717", skillIcon: "github" },
  GitLab: { label: "GitLab", logo: "gitlab", color: "FC6D26", skillIcon: "gitlab" },
  Bitbucket: { label: "Bitbucket", logo: "bitbucket", color: "0052CC", skillIcon: "bitbucket" },
  Storybook: { label: "Storybook", logo: "storybook", color: "FF4785" },
  Jest: { label: "Jest", logo: "jest", color: "C21325", skillIcon: "jest" },
  Vitest: { label: "Vitest", logo: "vitest", color: "6E9F18", skillIcon: "vitest" },
  Cypress: { label: "Cypress", logo: "cypress", color: "17202C", skillIcon: "cypress" },
  Playwright: { label: "Playwright", logo: "playwright", color: "2EAD33" },
  ESLint: { label: "ESLint", logo: "eslint", color: "4B32C3" },
  Prettier: { label: "Prettier", logo: "prettier", color: "F7B93E" },
  Webpack: { label: "Webpack", logo: "webpack", color: "8DD6F9", skillIcon: "webpack" },
  Vite: { label: "Vite", logo: "vite", color: "646CFF", skillIcon: "vite" },
  Turbopack: { label: "Turbopack", logo: "turbopack", color: "EF4444" },
  Redux: { label: "Redux", logo: "redux", color: "764ABC", skillIcon: "redux" },
  Zustand: { label: "Zustand", logo: "zustand", color: "000000" },
  ReactQuery: { label: "React Query", logo: "reactquery", color: "FF4154" },
  FramerMotion: { label: "Framer Motion", logo: "framer", color: "0055FF" },
  ReactNative: { label: "React Native", logo: "react", color: "61DAFB" },
  Expo: { label: "Expo", logo: "expo", color: "000020" },
  Python: { label: "Python", logo: "python", color: "3776AB", skillIcon: "py" },
  Django: { label: "Django", logo: "django", color: "092E20", skillIcon: "django" },
  Flask: { label: "Flask", logo: "flask", color: "000000", skillIcon: "flask" },
  FastAPI: { label: "FastAPI", logo: "fastapi", color: "009688", skillIcon: "fastapi" },
  Go: { label: "Go", logo: "go", color: "00ADD8", skillIcon: "go" },
  Rust: { label: "Rust", logo: "rust", color: "000000", skillIcon: "rust" },
  Java: { label: "Java", logo: "openjdk", color: "007396", skillIcon: "java" },
  Spring: { label: "Spring", logo: "spring", color: "6DB33F", skillIcon: "spring" },
  PHP: { label: "PHP", logo: "php", color: "777BB4", skillIcon: "php" },
  Laravel: { label: "Laravel", logo: "laravel", color: "FF2D20", skillIcon: "laravel" },
  Symfony: { label: "Symfony", logo: "symfony", color: "000000", skillIcon: "symfony" },
  Ruby: { label: "Ruby", logo: "ruby", color: "CC342D", skillIcon: "ruby" },
  Rails: { label: "Rails", logo: "rubyonrails", color: "CC0000", skillIcon: "rails" },
  CSharp: { label: "C#", logo: "csharp", color: "512BD4", skillIcon: "cs" },
  DotNet: { label: ".NET", logo: "dotnet", color: "512BD4", skillIcon: "dotnet" },
  CPlusPlus: { label: "C++", logo: "cplusplus", color: "00599C", skillIcon: "cpp" },
  Swift: { label: "Swift", logo: "swift", color: "FA7343", skillIcon: "swift" },
  Kotlin: { label: "Kotlin", logo: "kotlin", color: "7F52FF", skillIcon: "kotlin" },
  Android: { label: "Android", logo: "android", color: "3DDC84", skillIcon: "androidstudio" },
  iOS: { label: "iOS", logo: "apple", color: "000000", skillIcon: "apple" },
  Figma: { label: "Figma", logo: "figma", color: "F24E1E", skillIcon: "figma" },
  Jira: { label: "Jira", logo: "jira", color: "0052CC" },
};

export const BADGE_CATEGORIES = {
  "Front-end": [
    "TypeScript","JavaScript","React","NextJS","Tailwind","CSS3","HTML5","Sass","StyledComponents",
    "Storybook","ESLint","Prettier","FramerMotion","Redux","Zustand","ReactQuery","Webpack","Vite","Turbopack",
  ],
  "Back-end": [
    "NodeJS","Express","GraphQL","Apollo","Python","Django","Flask","FastAPI","Go","Rust","Java","Spring","PHP","Laravel","Symfony","Ruby","Rails","DotNet","CSharp","CPlusPlus",
  ],
  "Data & DB": [
    "Prisma","MongoDB","PostgreSQL","MySQL","SQLite","Redis",
  ],
  "Cloud & DevOps": [
    "Docker","Kubernetes","AWS","GCP","Azure","Vercel","Netlify",
  ],
  "Mobile": [
    "ReactNative","Expo","Android","iOS","Swift","Kotlin",
  ],
  "Outils": [
    "Git","GitHub","GitLab","Bitbucket","Figma","Jira","Jest","Vitest","Cypress","Playwright",
  ],
} as const;

export const SOFT_SKILLS = [
  "Communication", "Travail d’équipe", "Autonomie", "Résolution de problèmes", "Créativité",
  "Esprit d’analyse", "Empathie", "Curiosité", "Gestion du temps", "Organisation",
  "Leadership", "Adaptabilité", "Esprit critique", "Pédagogie",
];

/** Slug simple-icons approximatif : « Next.js » → « nextdotjs », « C++ » → « cplusplus ». */
export function toSimpleIconSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]/g, "");
}

/** Badges libres saisis par l'utilisateur·ice (« Astro, Supabase »). */
export function parseCustomBadges(input: string): BadgeDef[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({ label, logo: toSimpleIconSlug(label), color: "555555" }));
}

export function badgeUrl(def: BadgeDef, size: "flat" | "for-the-badge" = "flat"): string {
  // Shields : les tirets et underscores du libellé doivent être doublés
  const label = encodeURIComponent(def.label.replace(/-/g, "--").replace(/_/g, "__"));
  const color = def.color || "informational";
  const logo = def.logo ? `&logo=${encodeURIComponent(def.logo)}` : "";
  return `https://img.shields.io/badge/${label}-${color}?style=${size}${logo}&logoColor=white`;
}

export function skillIconsUrl(ids: string[]): string {
  return `https://skillicons.dev/icons?i=${ids.join(",")}&perline=12`;
}
