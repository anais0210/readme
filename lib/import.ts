import { BADGE_DEFS, SOFT_SKILLS } from "./badges";
import {
  CONFIG_MARKER,
  DEFAULT_VALUES,
  SECTION_KEYS,
  SUMMARY_CARDS,
  decodeConfig,
  normalizeValues,
  type FormValues,
  type SectionKey,
  type SummaryCard,
} from "./config";
import { generateReadme } from "./template";

export type ImportResult = {
  values: FormValues;
  /** « config » : README généré par l'outil, restauré à l'identique. « analyse » : reconstruction approximative. */
  source: "config" | "analyse";
  /** Ce qui a été retrouvé (pour informer l'utilisateur·ice). */
  recovered: string[];
  /** Le README contient des retouches manuelles qui ne peuvent pas être reprises dans le formulaire. */
  hasManualEdits: boolean;
};

const CONFIG_RE = new RegExp(`<!--\\s*${CONFIG_MARKER}\\s+([A-Za-z0-9_-]+)\\s*-->`);

function normalizeWs(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function parseReadme(markdown: string): ImportResult {
  const match = markdown.match(CONFIG_RE);
  if (match) {
    const values = decodeConfig(match[1]);
    if (values) {
      const regenerated = generateReadme({ ...values, embedConfig: true });
      return {
        values,
        source: "config",
        recovered: ["configuration complète"],
        hasManualEdits: normalizeWs(regenerated) !== normalizeWs(markdown),
      };
    }
  }
  return analyse(markdown);
}

/** Section (heading Markdown) dont le titre contient `needle`, jusqu'au heading suivant. */
function sectionBody(md: string, needle: RegExp): string | null {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => /^#{2,3}\s/.test(l) && needle.test(l));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#{1,3}\s/.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

const LABEL_TO_KEY = new Map(Object.entries(BADGE_DEFS).map(([key, def]) => [def.label.toLowerCase(), key]));

function analyse(md: string): ImportResult {
  const recovered: string[] = [];
  const found = new Set<SectionKey>();
  const positions: Partial<Record<SectionKey, number>> = {};
  const mark = (key: SectionKey, needle: string | RegExp) => {
    found.add(key);
    const idx = typeof needle === "string" ? md.indexOf(needle) : md.search(needle);
    if (idx >= 0 && positions[key] === undefined) positions[key] = idx;
  };

  const values: FormValues = normalizeValues({
    ...DEFAULT_VALUES,
    name: "",
    username: "",
    bio: "",
    badgesPreset: [],
    softSkillsPreset: [],
    links: { github: "", linkedin: "", website: "" },
  });

  // Titre
  const h1 = md.match(/^#\s+(.+)$/m);
  if (h1) {
    values.name = h1[1].replace(/\s*✨\s*$/, "").trim();
    values.style = /✨\s*$/.test(h1[1]) ? "emoji" : "minimal";
    recovered.push("nom");
  }

  // Pseudo GitHub (cartes de stats, compteur, streak…)
  const user = md.match(/[?&](?:username|user)=([^&"')\s]+)/);
  if (user) {
    values.username = safeDecode(user[1]);
    recovered.push("pseudo GitHub");
  }

  // Bannière et compteur
  if (md.includes("capsule-render.vercel.app")) mark("header", "capsule-render");
  if (md.includes("komarev.com/ghpvc")) mark("visitors", "komarev.com");

  // Bio : premier paragraphe de texte après le titre
  if (h1) {
    const after = md.slice(md.indexOf(h1[0]) + h1[0].length).split(/\n\s*\n/);
    const para = after.map((p) => p.trim()).find((p) => p && !/^(#|<|!\[|\[!\[|>|-|\||<!--)/.test(p));
    const firstHeading = md.search(/^##\s/m);
    if (para && (firstHeading === -1 || md.indexOf(para) < firstHeading)) {
      values.bio = para;
      mark("bio", para);
      recovered.push("bio");
    }
  }

  // Badges de compétences (hors badges-liens « [![…](…)](…) »)
  const customBadges: string[] = [];
  const badgeRe = /(?<!\[)!\[([^\]]+)\]\(https:\/\/img\.shields\.io\/badge\/[^)]+\)|<img[^>]*alt="([^"]+)"[^>]*src="https:\/\/img\.shields\.io\/badge\//g;
  let m: RegExpExecArray | null;
  while ((m = badgeRe.exec(md))) {
    const label = (m[1] ?? m[2]).replace(/&amp;/g, "&").trim();
    const key = LABEL_TO_KEY.get(label.toLowerCase());
    if (key) {
      if (!values.badgesPreset.includes(key)) values.badgesPreset.push(key);
    } else if (!customBadges.includes(label)) {
      customBadges.push(label);
    }
    mark("badges", m[0]);
  }
  values.badgesCustom = customBadges.join(", ");
  if (found.has("badges")) recovered.push("compétences techniques");

  // Soft skills : liste sous un titre « Soft skills » ou dans le tableau HTML
  const softItems: string[] = [];
  const softBody = sectionBody(md, /soft skills|🤝/i);
  if (softBody) softBody.split("\n").forEach((l) => { const li = l.match(/^\s*[-*]\s+(.+)$/); if (li) softItems.push(li[1].trim()); });
  const htmlSoft = md.match(/Soft skills<\/h3>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (htmlSoft) for (const li of htmlSoft[1].matchAll(/<li>([\s\S]*?)<\/li>/g)) softItems.push(li[1].replace(/&amp;/g, "&").trim());
  if (softItems.length) {
    values.softSkillsPreset = softItems.filter((s) => SOFT_SKILLS.includes(s));
    values.softSkillsCustom = softItems.filter((s) => !SOFT_SKILLS.includes(s)).join(", ");
    mark("softSkills", /soft skills|🤝/i);
    recovered.push("soft skills");
  }

  // Compétences clés
  const keyBody = sectionBody(md, /compétences clés/i);
  if (keyBody) {
    const items = keyBody
      .split("\n")
      .map((l) => l.match(/^\s*-\s+(?:⭐\s*)?(.+?)(?:\s+—\s+(.*))?$/))
      .filter((x): x is RegExpMatchArray => !!x)
      .slice(0, 3)
      .map((x) => ({
        name: x[1].trim(),
        repo: x[2]?.match(/\[Dépôt\]\(([^)]+)\)/)?.[1] ?? "",
        link: x[2]?.match(/\[Ressource\]\(([^)]+)\)/)?.[1] ?? "",
      }));
    if (items.length) {
      values.keySkills = normalizeValues({ keySkills: items }).keySkills;
      mark("keySkills", /compétences clés/i);
      recovered.push("compétences clés");
    }
  }

  // Projets épinglés
  const pins = [...md.matchAll(/\/api\/pin\/?\?username=([^&"]+)&(?:amp;)?repo=([^&"]+)/g)].map(([, o, r]) => {
    const owner = safeDecode(o);
    const repo = safeDecode(r);
    return owner === values.username ? repo : `${owner}/${repo}`;
  });
  if (pins.length) {
    values.pinnedRepos = pins.join(", ");
    mark("projects", "/api/pin/");
    recovered.push("projets épinglés");
  }

  // Stats
  const statsCard = md.match(/\/api\?username=[^)"\s]*?theme=([^&)"\s]+)/);
  if (md.match(/\/api\?username=|streak-stats|ghchart|activity-graph/)) {
    mark("stats", /\/api\?username=|streak-stats|ghchart|activity-graph/);
    if (statsCard) values.statsTheme = safeDecode(statsCard[1]);
    const base = md.match(/(https:\/\/[^/\s"')]+)\/api\?username=/);
    if (base) values.statsBaseUrl = base[1];
    recovered.push("stats GitHub");
  }

  // Liens (badges cliquables ou liens simples)
  const linkRe = /\]\((https?:\/\/[^)\s]+)\)/g;
  const linkBadges = [...md.matchAll(/\[!\[([^\]]+)\]\([^)]*\)\]\((https?:\/\/[^)\s]+)\)/g)];
  for (const [, label, url] of linkBadges) {
    if (/linkedin\.com/.test(url)) values.links.linkedin = url;
    else if (/^https?:\/\/(www\.)?github\.com\//.test(url) && /github/i.test(label)) values.links.github = url;
    else if (/site|web|portfolio/i.test(label)) values.links.website = url;
  }
  if (!values.links.linkedin) {
    for (const [, url] of md.matchAll(linkRe)) if (/linkedin\.com\/in\//.test(url)) values.links.linkedin = url;
  }
  if (linkBadges.length || values.links.linkedin) {
    mark("links", linkBadges[0]?.[0] ?? "linkedin.com");
    recovered.push("liens");
  }

  // Fun
  const fun = md.match(/Fun fact\s*:?\s*(.+)$/im);
  const quote = md.match(/^>\s*(?:💬\s*)?(.+)$/m);
  if (fun) values.funFact = fun[1].trim();
  if (quote) values.quote = quote[1].trim();
  if (fun || quote) {
    mark("fun", fun?.[0] ?? quote![0]);
    recovered.push("fun / citation");
  }

  // Changelog
  const changelog = md.match(/!\[Changelog\]\(([^)]+)\)/);
  if (changelog) {
    values.changelogImageUrl = changelog[1];
    mark("changelog", changelog[0]);
    recovered.push("changelog");
  }

  // Texte animé (readme-typing-svg)
  const typing = md.match(/readme-typing-svg\.demolab\.com\/?\?[^"')\s]*?lines=([^&"')\s]+)/);
  if (typing) {
    values.typingLines = typing[1].split(";").map(safeDecode).map((l) => l.replace(/\+/g, " ")).join("\n");
    mark("typing", "readme-typing-svg");
    recovered.push("texte animé");
  }

  // Skill Icons : on retrouve les technos du catalogue
  const icons = md.match(/skillicons\.dev\/icons\?i=([a-z0-9,]+)/);
  if (icons) {
    const byIcon = new Map(Object.entries(BADGE_DEFS).filter(([, d]) => d.skillIcon).map(([key, d]) => [d.skillIcon!, key]));
    const unknown: string[] = [];
    for (const id of icons[1].split(",")) {
      const key = byIcon.get(id);
      if (key) {
        if (!values.badgesPreset.includes(key)) values.badgesPreset.push(key);
      } else {
        // Hors catalogue : gardée comme techno libre plutôt que perdue
        unknown.push(id.charAt(0).toUpperCase() + id.slice(1));
      }
    }
    values.badgesCustom = [values.badgesCustom, ...unknown].filter(Boolean).join(", ");
    values.skillsDisplay = "icons";
    mark("badges", "skillicons.dev");
    if (!recovered.includes("compétences techniques")) recovered.push("compétences techniques");
  }

  // Trophées
  const trophy = md.match(/(https?:\/\/[^/\s"')]*troph[^/\s"')]*)\/?\?username=/);
  if (trophy) {
    // L'instance officielle est hors service : on garde le miroir par défaut
    if (!/github-profile-trophy\.vercel\.app/.test(trophy[1])) values.trophyBaseUrl = trophy[1];
    mark("trophies", trophy[0]);
    recovered.push("trophées");
  }

  // Cartes de résumé
  const cards = [...md.matchAll(/github-profile-summary-cards\.vercel\.app\/api\/cards\/([a-z-]+)/g)]
    .map(([, c]) => c)
    .filter((c): c is SummaryCard => c in SUMMARY_CARDS);
  if (cards.length) {
    values.summaryCards = [...new Set(cards)];
    mark("summaryCards", "github-profile-summary-cards");
    recovered.push("cartes de résumé");
  }

  if (!values.style || values.style === "minimal") {
    if (/^##\s+\p{Extended_Pictographic}/mu.test(md)) values.style = "emoji";
  }

  // Sections présentes, dans l'ordre où elles apparaissent
  for (const key of SECTION_KEYS) values.sections[key] = found.has(key);
  values.sectionOrder = normalizeValues({
    sectionOrder: [...found].sort((a, b) => (positions[a] ?? 0) - (positions[b] ?? 0)),
  }).sectionOrder;

  return { values, source: "analyse", recovered, hasManualEdits: false };
}
