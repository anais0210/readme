export type FormValues = {
  name: string;
  username: string;
  bio: string;
  softSkillsPreset: string[];
  softSkillsCustom: string;
  keySkills: Array<{
    name: string;
    repo?: string;
    link?: string;
  }>;
  links: {
    github: string;
    linkedin: string;
    website: string;
  };
  badgesPreset: string[];
  style: "minimal" | "colorful" | "emoji";
  statsTheme: string;
  sections: {
    bio: boolean;
    softSkills: boolean;
    keySkills: boolean;
    projects: boolean;
    badges: boolean; // sera affiché comme "Compétences"
    stats: boolean;
    links: boolean;
    fun: boolean;
  };
  funFact: string;
  quote: string;
};

const BADGE_DEFS: Record<string, { label: string; logo?: string; color?: string }> = {
  TypeScript: { label: "TypeScript", logo: "typescript", color: "3178C6" },
  JavaScript: { label: "JavaScript", logo: "javascript", color: "F7DF1E" },
  React: { label: "React", logo: "react", color: "61DAFB" },
  NextJS: { label: "Next.js", logo: "nextdotjs", color: "000000" },
  NodeJS: { label: "Node.js", logo: "nodedotjs", color: "339933" },
  Express: { label: "Express", logo: "express", color: "000000" },
  Tailwind: { label: "Tailwind CSS", logo: "tailwindcss", color: "38B2AC" },
  CSS3: { label: "CSS3", logo: "css3", color: "1572B6" },
  HTML5: { label: "HTML5", logo: "html5", color: "E34F26" },
  Sass: { label: "Sass", logo: "sass", color: "CC6699" },
  StyledComponents: { label: "styled-components", logo: "styledcomponents", color: "DB7093" },
  Prisma: { label: "Prisma", logo: "prisma", color: "2D3748" },
  MongoDB: { label: "MongoDB", logo: "mongodb", color: "47A248" },
  PostgreSQL: { label: "PostgreSQL", logo: "postgresql", color: "4169E1" },
  MySQL: { label: "MySQL", logo: "mysql", color: "4479A1" },
  SQLite: { label: "SQLite", logo: "sqlite", color: "003B57" },
  Redis: { label: "Redis", logo: "redis", color: "DC382D" },
  GraphQL: { label: "GraphQL", logo: "graphql", color: "E10098" },
  Apollo: { label: "Apollo", logo: "apollographql", color: "311C87" },
  Docker: { label: "Docker", logo: "docker", color: "2496ED" },
  Kubernetes: { label: "Kubernetes", logo: "kubernetes", color: "326CE5" },
  AWS: { label: "AWS", logo: "amazonwebservices", color: "232F3E" },
  GCP: { label: "Google Cloud", logo: "googlecloud", color: "4285F4" },
  Azure: { label: "Azure", logo: "microsoftazure", color: "0078D4" },
  Vercel: { label: "Vercel", logo: "vercel", color: "000000" },
  Netlify: { label: "Netlify", logo: "netlify", color: "00C7B7" },
  Git: { label: "Git", logo: "git", color: "F05032" },
  GitHub: { label: "GitHub", logo: "github", color: "181717" },
  GitLab: { label: "GitLab", logo: "gitlab", color: "FC6D26" },
  Bitbucket: { label: "Bitbucket", logo: "bitbucket", color: "0052CC" },
  Storybook: { label: "Storybook", logo: "storybook", color: "FF4785" },
  Jest: { label: "Jest", logo: "jest", color: "C21325" },
  Vitest: { label: "Vitest", logo: "vitest", color: "6E9F18" },
  Cypress: { label: "Cypress", logo: "cypress", color: "17202C" },
  Playwright: { label: "Playwright", logo: "playwright", color: "2EAD33" },
  ESLint: { label: "ESLint", logo: "eslint", color: "4B32C3" },
  Prettier: { label: "Prettier", logo: "prettier", color: "F7B93E" },
  Webpack: { label: "Webpack", logo: "webpack", color: "8DD6F9" },
  Vite: { label: "Vite", logo: "vite", color: "646CFF" },
  Turbopack: { label: "Turbopack", logo: "turbopack", color: "EF4444" },
  Redux: { label: "Redux", logo: "redux", color: "764ABC" },
  Zustand: { label: "Zustand", logo: "zustand", color: "000000" },
  ReactQuery: { label: "React Query", logo: "reactquery", color: "FF4154" },
  FramerMotion: { label: "Framer Motion", logo: "framer", color: "0055FF" },
  ReactNative: { label: "React Native", logo: "react", color: "61DAFB" },
  Expo: { label: "Expo", logo: "expo", color: "000020" },
  Python: { label: "Python", logo: "python", color: "3776AB" },
  Django: { label: "Django", logo: "django", color: "092E20" },
  Flask: { label: "Flask", logo: "flask", color: "000000" },
  FastAPI: { label: "FastAPI", logo: "fastapi", color: "009688" },
  Go: { label: "Go", logo: "go", color: "00ADD8" },
  Rust: { label: "Rust", logo: "rust", color: "000000" },
  Java: { label: "Java", logo: "coffeescript", color: "007396" },
  Spring: { label: "Spring", logo: "spring", color: "6DB33F" },
  PHP: { label: "PHP", logo: "php", color: "777BB4" },
  Laravel: { label: "Laravel", logo: "laravel", color: "FF2D20" },
  Symfony: { label: "Symfony", logo: "symfony", color: "000000" },
  Ruby: { label: "Ruby", logo: "ruby", color: "CC342D" },
  Rails: { label: "Rails", logo: "rubyonrails", color: "CC0000" },
  CSharp: { label: "C#", logo: "csharp", color: "512BD4" },
  DotNet: { label: ".NET", logo: "dotnet", color: "512BD4" },
  CPlusPlus: { label: "C++", logo: "cplusplus", color: "00599C" },
  Swift: { label: "Swift", logo: "swift", color: "FA7343" },
  Kotlin: { label: "Kotlin", logo: "kotlin", color: "7F52FF" },
  Android: { label: "Android", logo: "android", color: "3DDC84" },
  iOS: { label: "iOS", logo: "apple", color: "000000" },
  Figma: { label: "Figma", logo: "figma", color: "F24E1E" },
  Jira: { label: "Jira", logo: "jira", color: "0052CC" },
};

// Plus d'alias nécessaires pour skills, la section Compétences utilise directement badges

function renderBadges(preset: string[]) {
  const presetBadges = preset
    .map((key) => BADGE_DEFS[key])
    .filter(Boolean)
    .map((def) => {
      const label = encodeURIComponent(def.label);
      const color = def.color || "informational";
      const logo = def.logo ? `&logo=${encodeURIComponent(def.logo)}` : "";
      return `![${def.label}](https://img.shields.io/badge/${label}-${color}?style=flat${logo}&logoColor=white)`;
    });

  return presetBadges.join("\n");
}

// (obsolete) rendu en liste, remplacé par des badges

function renderSoftSkills(preset: string[], custom: string) {
  const customs = custom
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [...preset, ...customs];
  if (all.length === 0) return "";
  return all.map((s) => `- ${s}`).join("\n");
}
// plus de rendu skillsAsBadges: on réutilise directement renderBadges pour "Compétences"

export function generateReadme(values: FormValues): string {
  const lines: string[] = [];

  const title = values.name || values.username || "Mon profil";
  const heading = values.style === "emoji" ? `# ${title} ✨` : `# ${title}`;
  lines.push(heading);

  if (values.sections.bio && values.bio) {
    lines.push("\n" + values.bio + "\n");
  }

  // Colonnes: Compétences (badges) vs Soft skills
  if (values.sections.badges && values.sections.softSkills) {
    const hard = renderBadges(values.badgesPreset);
    const soft = renderSoftSkills(values.softSkillsPreset, values.softSkillsCustom);
    lines.push("## Compétences et Soft skills");
    lines.push(
      [
        "<table><tr>",
        "<td>",
        "<h3>Compétences</h3>",
        hard || "",
        "</td>",
        "<td>",
        "<h3>Soft skills</h3>",
        soft || "",
        "</td>",
        "</tr></table>",
      ].join("\n")
    );
    lines.push("");
  } else {
    if (values.sections.badges) {
      lines.push("## Compétences");
      const skills = renderBadges(values.badgesPreset);
      if (skills) lines.push(skills);
      lines.push("");
    }
    if (values.sections.softSkills) {
      lines.push("## Soft skills");
      const soft = renderSoftSkills(values.softSkillsPreset, values.softSkillsCustom);
      if (soft) lines.push(soft);
      lines.push("");
    }
  }
  // Plus de section Badges séparée: renommée en Compétences

  if (values.sections.keySkills && values.keySkills?.length) {
    lines.push("## Compétences clés");
    values.keySkills.slice(0, 3).forEach((item) => {
      const parts: string[] = [];
      if (!item || !item.name?.trim()) return;
      let line = `- ${item.name.trim()}`;
      if (item.repo?.trim()) parts.push(`[Repo](${item.repo.trim()})`);
      if (item.link?.trim()) parts.push(`[Lien](${item.link.trim()})`);
      if (parts.length) line += ` — ${parts.join(" · ")}`;
      lines.push(line);
    });
    lines.push("");
  }

  if (values.sections.stats && values.username) {
    lines.push("## Stats GitHub");
    const theme = encodeURIComponent(values.statsTheme || "radical");
    lines.push(
      `![GitHub Stats](https://github-readme-stats.vercel.app/api?username=${values.username}&show_icons=true&theme=${theme})`
    );
    lines.push("");
  }

  if (values.sections.links) {
    lines.push("## Liens");
    const links: string[] = [];
    if (values.links.github) links.push(`- GitHub: ${values.links.github}`);
    if (values.links.linkedin) links.push(`- LinkedIn: ${values.links.linkedin}`);
    if (values.links.website) links.push(`- Site: ${values.links.website}`);
    if (links.length) lines.push(links.join("\n"));
    lines.push("");
  }

  if (values.sections.fun && (values.funFact || values.quote)) {
    lines.push("## Fun");
    if (values.funFact) lines.push(`- Fun fact: ${values.funFact}`);
    if (values.quote) lines.push(`> ${values.quote}`);
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}


