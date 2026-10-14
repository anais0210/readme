import { BADGE_DEFS, badgeUrl, parseCustomBadges, skillIconsUrl, type BadgeDef } from "./badges";
import {
  CONFIG_MARKER,
  DEFAULT_STATS_BASE_URL,
  DEFAULT_TROPHY_BASE_URL,
  encodeConfig,
  type FormValues,
  type SectionKey,
} from "./config";

export type { FormValues } from "./config";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function heading(values: FormValues, level: 2 | 3, emoji: string, text: string): string {
  const prefix = "#".repeat(level);
  return values.style === "emoji" ? `${prefix} ${emoji} ${text}` : `${prefix} ${text}`;
}

function htmlHeading(values: FormValues, emoji: string, text: string): string {
  return values.style === "emoji" ? `<h3>${emoji} ${text}</h3>` : `<h3>${text}</h3>`;
}

function allBadges(values: FormValues): BadgeDef[] {
  const presets = values.badgesPreset.map((key) => BADGE_DEFS[key]).filter(Boolean);
  return [...presets, ...parseCustomBadges(values.badgesCustom ?? "")];
}

// Style « Coloré » : badges grand format
function badgeSize(values: FormValues) {
  return values.style === "colorful" ? "for-the-badge" : "flat";
}

function renderBadges(values: FormValues, defs: BadgeDef[]): string {
  return defs.map((def) => `![${def.label}](${badgeUrl(def, badgeSize(values))})`).join("\n");
}

function renderBadgesHtml(values: FormValues, defs: BadgeDef[]): string {
  const imgs = defs.map((def) => `<img alt="${escapeHtml(def.label)}" src="${badgeUrl(def, badgeSize(values))}" />`).join("\n");
  return `<div>\n${imgs}\n</div>`;
}

/** Technos en HTML : rangée Skill Icons si demandée, badges pour celles sans icône. */
function renderTechHtml(values: FormValues, defs: BadgeDef[]): string {
  if (values.skillsDisplay !== "icons") return renderBadgesHtml(values, defs);
  const withIcon = defs.filter((d) => d.skillIcon);
  const without = defs.filter((d) => !d.skillIcon);
  const parts: string[] = [];
  if (withIcon.length) {
    const alt = escapeHtml(withIcon.map((d) => d.label).join(", "));
    parts.push(`<p><img alt="${alt}" src="${skillIconsUrl(withIcon.map((d) => d.skillIcon!))}" /></p>`);
  }
  if (without.length) parts.push(renderBadgesHtml(values, without));
  return parts.join("\n");
}

function allSoftSkills(values: FormValues): string[] {
  const customs = (values.softSkillsCustom ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...values.softSkillsPreset, ...customs];
}

function statsBase(values: FormValues): string {
  return (values.statsBaseUrl || DEFAULT_STATS_BASE_URL).replace(/\/+$/, "");
}

// Couleur du calendrier de contributions (ghchart) assortie au thème des cartes
const CHART_COLORS: Record<string, string> = {
  default: "216e39",
  radical: "fe428e",
  tokyonight: "70a5fd",
  github_dark: "2f81f7",
};

// Couleur du texte animé, assortie au thème des cartes
const TYPING_COLORS: Record<string, string> = {
  default: "0369A1",
  radical: "FE428E",
  tokyonight: "70A5FD",
  github_dark: "2F81F7",
};

// github-profile-trophy nomme ses thèmes différemment
const TROPHY_THEMES: Record<string, string> = {
  default: "flat",
  radical: "radical",
  tokyonight: "tokyonight",
  github_dark: "darkhub",
};

// streak-stats n'a pas de thème « github_dark »
const STREAK_THEMES: Record<string, string> = {
  default: "default",
  radical: "radical",
  tokyonight: "tokyonight",
  github_dark: "dark",
};

type Renderer = (values: FormValues) => string[];

const RENDERERS: Record<Exclude<SectionKey, "header">, Renderer> = {
  typing: (v) => {
    const lines = (v.typingLines ?? "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 5);
    if (!lines.length) return [];
    const color = TYPING_COLORS[v.statsTheme] ?? TYPING_COLORS.default;
    const params = `font=Fira+Code&weight=500&size=22&pause=1000&color=${color}&center=true&vCenter=true&width=600`;
    const src = `https://readme-typing-svg.demolab.com?${params}&lines=${lines.map(encodeURIComponent).join(";")}`;
    // L'alt reprend le texte : l'animation n'est pas lisible par les lecteurs d'écran
    return [`<p align="center"><img alt="${escapeHtml(lines.join(". "))}" src="${src}" /></p>`, ""];
  },

  bio: (v) => (v.bio ? [v.bio, ""] : []),

  badges: (v) => {
    const defs = allBadges(v);
    if (!defs.length) return [];
    const body = v.skillsDisplay === "icons" ? renderTechHtml(v, defs) : renderBadges(v, defs);
    return [heading(v, 2, "🛠️", "Compétences techniques"), body, ""];
  },

  softSkills: (v) => {
    const soft = allSoftSkills(v);
    if (!soft.length) return [];
    return [heading(v, 2, "🤝", "Soft skills"), soft.map((s) => `- ${s}`).join("\n"), ""];
  },

  keySkills: (v) => {
    const items = (v.keySkills ?? []).slice(0, 3).filter((k) => k?.name?.trim());
    if (!items.length) return [];
    const lines = [heading(v, 2, "💡", "Compétences clés")];
    items.forEach((item) => {
      const parts: string[] = [];
      let line = v.style === "emoji" ? `- ⭐ ${item.name.trim()}` : `- ${item.name.trim()}`;
      if (item.repo?.trim()) parts.push(`[Dépôt](${item.repo.trim()})`);
      if (item.link?.trim()) parts.push(`[Ressource](${item.link.trim()})`);
      if (parts.length) line += ` — ${parts.join(" · ")}`;
      lines.push(line);
    });
    lines.push("");
    return lines;
  },

  projects: (v) => {
    const repos = (v.pinnedRepos ?? "")
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);
    if (!repos.length) return [];
    const theme = encodeURIComponent(v.statsTheme || "default");
    const cards = repos.map((r) => {
      const [owner, repo] = r.includes("/") ? r.split("/", 2) : [v.username, r];
      if (!owner || !repo) return "";
      const o = encodeURIComponent(owner);
      const n = encodeURIComponent(repo);
      return `<a href="https://github.com/${o}/${n}"><img alt="Dépôt ${escapeHtml(repo)}" src="${statsBase(v)}/api/pin/?username=${o}&repo=${n}&theme=${theme}" /></a>`;
    });
    return [heading(v, 2, "📌", "Projets épinglés"), `<p>\n${cards.filter(Boolean).join("\n")}\n</p>`, ""];
  },

  stats: (v) => {
    if (!v.username) return [];
    const theme = encodeURIComponent(v.statsTheme || "radical");
    const uname = encodeURIComponent(v.username);
    const base = statsBase(v);
    const chartColor = CHART_COLORS[v.statsTheme] ?? CHART_COLORS.default;
    return [
      heading(v, 2, "📊", "Statistiques GitHub"),
      `![Statistiques GitHub](${base}/api?username=${uname}&show_icons=true&theme=${theme})`,
      "",
      [
        "<table><tr>",
        '<td valign="top">',
        htmlHeading(v, "💻", "Langages les plus utilisés"),
        `<img alt="Langages les plus utilisés" src="${base}/api/top-langs/?username=${uname}&layout=compact&theme=${theme}" />`,
        "</td>",
        '<td valign="top">',
        htmlHeading(v, "🔥", "Série de contributions"),
        `<img alt="Série de contributions" src="https://streak-stats.demolab.com?user=${uname}&theme=${STREAK_THEMES[v.statsTheme] ?? "default"}&hide_border=true" />`,
        "</td>",
        "</tr></table>",
      ].join("\n"),
      "",
      heading(v, 3, "📈", "Contributions"),
      `![Calendrier des contributions GitHub](https://ghchart.rshah.org/${chartColor}/${uname})`,
      "",
    ];
  },

  summaryCards: (v) => {
    const cards = v.summaryCards ?? [];
    if (!v.username || !cards.length) return [];
    const uname = encodeURIComponent(v.username);
    const theme = encodeURIComponent(v.statsTheme || "default");
    const url = (card: string) => `https://github-profile-summary-cards.vercel.app/api/cards/${card}?username=${uname}&theme=${theme}`;
    const lines = [heading(v, 2, "🗂️", "Résumé du profil")];
    if (cards.includes("profile-details")) {
      lines.push(`<p><img width="100%" alt="Activité du profil GitHub" src="${url("profile-details")}" /></p>`);
    }
    const small = cards.filter((c) => c !== "profile-details");
    const alts: Record<string, string> = {
      "repos-per-language": "Dépôts par langage",
      "most-commit-language": "Langages les plus commités",
      stats: "Statistiques GitHub",
    };
    if (small.length) {
      lines.push(`<p>\n${small.map((c) => `<img width="32%" alt="${alts[c]}" src="${url(c)}" />`).join("\n")}\n</p>`);
    }
    lines.push("");
    return lines;
  },

  trophies: (v) => {
    if (!v.username) return [];
    const base = (v.trophyBaseUrl || DEFAULT_TROPHY_BASE_URL).replace(/\/+$/, "");
    const theme = TROPHY_THEMES[v.statsTheme] ?? "flat";
    const src = `${base}/?username=${encodeURIComponent(v.username)}&theme=${theme}&no-frame=true&no-bg=true&margin-w=4&row=1&column=6`;
    return [heading(v, 2, "🏆", "Trophées"), `<p><img alt="Trophées GitHub" src="${src}" /></p>`, ""];
  },

  links: (v) => {
    const badges: string[] = [];
    const size = badgeSize(v);
    if (v.links.github) {
      badges.push(`[![GitHub](https://img.shields.io/badge/GitHub-181717?style=${size}&logo=github&logoColor=white)](${v.links.github})`);
    }
    if (v.links.linkedin) {
      badges.push(`[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=${size}&logo=linkedin&logoColor=white)](${v.links.linkedin})`);
    }
    if (v.links.website) {
      badges.push(`[![Site web](https://img.shields.io/badge/Site%20web-0369a1?style=${size}&logoColor=white)](${v.links.website})`);
    }
    if (!badges.length) return [];
    return [heading(v, 2, "🔗", "Liens"), badges.join("\n"), ""];
  },

  fun: (v) => {
    if (!v.funFact && !v.quote) return [];
    const lines = [heading(v, 2, "🎉", "Fun")];
    if (v.funFact) lines.push(v.style === "emoji" ? `- 🎯 Fun fact : ${v.funFact}` : `- Fun fact : ${v.funFact}`);
    if (v.funFact && v.quote) lines.push("");
    if (v.quote) lines.push(v.style === "emoji" ? `> 💬 ${v.quote}` : `> ${v.quote}`);
    lines.push("");
    return lines;
  },

  // Changelog dynamique (GitClear ou autre image dynamique)
  changelog: (v) =>
    v.changelogImageUrl ? [heading(v, 2, "📰", "Changelog dynamique"), `![Changelog](${v.changelogImageUrl})`, ""] : [],

  visitors: (v) =>
    v.username
      ? [
          `![Visites du profil](https://komarev.com/ghpvc/?username=${encodeURIComponent(v.username)}&label=Visites&color=0369a1&style=flat)`,
          "",
        ]
      : [],
};

/** Compétences techniques + soft skills côte à côte quand elles se suivent. */
function renderSkillsTable(v: FormValues): string[] {
  const defs = allBadges(v);
  const soft = allSoftSkills(v);
  if (!defs.length || !soft.length) return [...RENDERERS.badges(v), ...RENDERERS.softSkills(v)];
  return [
    heading(v, 2, "🧰", "Compétences"),
    [
      "<table><tr>",
      '<td valign="top">',
      htmlHeading(v, "🛠️", "Techniques"),
      renderTechHtml(v, defs),
      "</td>",
      '<td valign="top">',
      htmlHeading(v, "🤝", "Soft skills"),
      "<ul>",
      ...soft.map((s) => `<li>${escapeHtml(s)}</li>`),
      "</ul>",
      "</td>",
      "</tr></table>",
    ].join("\n"),
    "",
  ];
}

export function generateReadme(values: FormValues): string {
  const lines: string[] = [];
  const title = values.name || values.username || "Mon profil";

  if (values.sections.header) {
    const text = encodeURIComponent(title);
    lines.push(
      `<img width="100%" alt="" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=160&section=header&text=${text}&fontSize=42&fontAlignY=35" />`,
      ""
    );
  }

  lines.push(values.style === "emoji" ? `# ${title} ✨` : `# ${title}`, "");

  const order = values.sectionOrder.filter((k) => k !== "header" && values.sections[k]) as Exclude<SectionKey, "header">[];
  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    const next = order[i + 1];
    if ((key === "badges" && next === "softSkills") || (key === "softSkills" && next === "badges")) {
      lines.push(...renderSkillsTable(values));
      i++;
      continue;
    }
    lines.push(...RENDERERS[key](values));
  }

  let out = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  if (values.embedConfig) {
    // Invisible sur GitHub : permet de recoller le README dans l'outil pour le modifier
    out += `\n<!-- ${CONFIG_MARKER} ${encodeConfig(values)} -->\n`;
  }
  return out;
}
