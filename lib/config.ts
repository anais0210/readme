export const SECTION_KEYS = [
  "header",
  "typing",
  "bio",
  "badges",
  "softSkills",
  "keySkills",
  "projects",
  "stats",
  "summaryCards",
  "trophies",
  "links",
  "fun",
  "changelog",
  "visitors",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  header: "Bannière",
  typing: "Texte animé",
  bio: "Bio",
  badges: "Compétences techniques",
  softSkills: "Soft skills",
  keySkills: "Compétences clés",
  projects: "Projets épinglés",
  stats: "Stats GitHub",
  summaryCards: "Cartes de résumé",
  trophies: "Trophées",
  links: "Liens",
  fun: "Fun / Citation",
  changelog: "Changelog",
  visitors: "Compteur de visites",
};

export const SUMMARY_CARDS = {
  "profile-details": "Activité du profil (large)",
  "repos-per-language": "Dépôts par langage",
  "most-commit-language": "Langages les plus commités",
  stats: "Statistiques",
} as const;

export type SummaryCard = keyof typeof SUMMARY_CARDS;

export type KeySkill = { name: string; repo?: string; link?: string };

export type FormValues = {
  name: string;
  username: string;
  bio: string;
  softSkillsPreset: string[];
  softSkillsCustom: string;
  keySkills: KeySkill[];
  pinnedRepos: string;
  changelogImageUrl?: string;
  links: {
    github: string;
    linkedin: string;
    website: string;
  };
  badgesPreset: string[];
  badgesCustom: string;
  /** « icons » : rangée Skill Icons (les technos sans icône restent en badges). */
  skillsDisplay: "badges" | "icons";
  typingLines: string;
  summaryCards: SummaryCard[];
  trophyBaseUrl: string;
  style: "minimal" | "colorful" | "emoji";
  statsTheme: string;
  statsBaseUrl: string;
  sections: Record<SectionKey, boolean>;
  sectionOrder: SectionKey[];
  funFact: string;
  quote: string;
  embedConfig: boolean;
};

export const DEFAULT_STATS_BASE_URL = "https://github-readme-stats.vercel.app";
// L'instance officielle (github-profile-trophy.vercel.app) est désactivée : miroir communautaire
export const DEFAULT_TROPHY_BASE_URL = "https://trophy.ryglcloud.net";

export const DEFAULT_VALUES: FormValues = {
  name: "",
  username: "",
  bio: "Développeur·euse passionné·e par le web moderne.",
  softSkillsPreset: ["Communication", "Travail d’équipe", "Résolution de problèmes"],
  softSkillsCustom: "",
  keySkills: [
    { name: "", repo: "", link: "" },
    { name: "", repo: "", link: "" },
    { name: "", repo: "", link: "" },
  ],
  pinnedRepos: "",
  links: {
    github: "https://github.com/anais0210/",
    linkedin: "https://www.linkedin.com/in/anais-sparesotto-formatrice/",
    website: "https://anais-formation-tech.fr/",
  },
  badgesPreset: ["TypeScript", "React", "NextJS", "Tailwind", "GitHub"],
  badgesCustom: "",
  skillsDisplay: "badges",
  typingLines: "Bienvenue sur mon profil 👋\nJ’aime apprendre et partager",
  summaryCards: ["repos-per-language", "most-commit-language"],
  trophyBaseUrl: DEFAULT_TROPHY_BASE_URL,
  style: "emoji",
  statsTheme: "radical",
  statsBaseUrl: DEFAULT_STATS_BASE_URL,
  sections: {
    header: false,
    typing: false,
    bio: true,
    badges: true,
    softSkills: true,
    keySkills: false,
    projects: false,
    stats: true,
    summaryCards: false,
    trophies: false,
    links: true,
    fun: false,
    changelog: false,
    visitors: false,
  },
  sectionOrder: [...SECTION_KEYS],
  funFact: "",
  quote: "",
  changelogImageUrl: "",
  embedConfig: true,
};

/**
 * Complète une config partielle (localStorage, lien de partage, README importé)
 * avec les valeurs par défaut, en tolérant les anciennes versions.
 */
export function normalizeValues(input: Partial<FormValues> | null | undefined): FormValues {
  const v = input ?? {};
  const order = Array.isArray(v.sectionOrder)
    ? v.sectionOrder.filter((k): k is SectionKey => (SECTION_KEYS as readonly string[]).includes(k))
    : [];
  // Les sections absentes (ajoutées depuis) sont ajoutées à la fin
  const fullOrder = [...new Set([...order, ...SECTION_KEYS])];
  const keySkills = Array.isArray(v.keySkills) ? v.keySkills.slice(0, 3) : [];
  while (keySkills.length < 3) keySkills.push({ name: "", repo: "", link: "" });

  return {
    ...DEFAULT_VALUES,
    ...v,
    links: { ...DEFAULT_VALUES.links, ...(v.links ?? {}) },
    sections: { ...DEFAULT_VALUES.sections, ...(v.sections ?? {}) },
    sectionOrder: fullOrder,
    keySkills,
    badgesPreset: Array.isArray(v.badgesPreset) ? v.badgesPreset : DEFAULT_VALUES.badgesPreset,
    softSkillsPreset: Array.isArray(v.softSkillsPreset) ? v.softSkillsPreset : DEFAULT_VALUES.softSkillsPreset,
    summaryCards: Array.isArray(v.summaryCards)
      ? v.summaryCards.filter((c): c is SummaryCard => c in SUMMARY_CARDS)
      : DEFAULT_VALUES.summaryCards,
  };
}

// --- Encodage base64url (UTF-8 safe) pour le lien de partage et le commentaire caché du README

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64.length + 3) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeConfig(values: FormValues): string {
  return toBase64Url(JSON.stringify(values));
}

export function decodeConfig(encoded: string): FormValues | null {
  try {
    return normalizeValues(JSON.parse(fromBase64Url(encoded.trim())));
  } catch {
    return null;
  }
}

export const CONFIG_MARKER = "readme-generator:config";
