import { describe, expect, it } from "vitest";
import { DEFAULT_VALUES, decodeConfig, encodeConfig, normalizeValues, type FormValues } from "./config";
import { parseReadme } from "./import";
import { generateReadme } from "./template";

const base: FormValues = normalizeValues({
  ...DEFAULT_VALUES,
  name: "Ada Lovelace",
  username: "ada",
  bio: "Première programmeuse 💜",
});

describe("generateReadme", () => {
  it("génère titre, bio et compétences côte à côte", () => {
    const md = generateReadme(base);
    expect(md).toMatch(/^# Ada Lovelace ✨/);
    expect(md).toContain("Première programmeuse 💜");
    expect(md).toContain("<h3>🛠️ Techniques</h3>");
    expect(md).toContain("<h3>🤝 Soft skills</h3>");
  });

  it("applique le thème choisi à toutes les cartes de stats", () => {
    const md = generateReadme({ ...base, statsTheme: "tokyonight" });
    expect(md).toContain("/api?username=ada&show_icons=true&theme=tokyonight");
    expect(md).toContain("top-langs/?username=ada&layout=compact&theme=tokyonight");
    expect(md).toContain("streak-stats.demolab.com?user=ada&theme=tokyonight");
    expect(md).not.toContain("dracula");
  });

  it("respecte l'ordre des sections", () => {
    const md = generateReadme({
      ...base,
      sectionOrder: ["links", "bio", "stats", "badges", "softSkills"] as FormValues["sectionOrder"],
    });
    expect(md.indexOf("## 🔗 Liens")).toBeLessThan(md.indexOf("Première programmeuse"));
    expect(md.indexOf("Statistiques GitHub")).toBeLessThan(md.indexOf("Compétences"));
  });

  it("ajoute les badges libres et les projets épinglés", () => {
    const md = generateReadme({
      ...base,
      badgesCustom: "Astro, Supabase",
      pinnedRepos: "readme, octocat/hello-world",
      sections: { ...base.sections, projects: true },
    });
    expect(md).toContain('alt="Astro"');
    expect(md).toContain("logo=supabase");
    expect(md).toContain("/api/pin/?username=ada&repo=readme");
    expect(md).toContain("/api/pin/?username=octocat&repo=hello-world");
  });

  it("utilise le bon logo pour Java", () => {
    const md = generateReadme({ ...base, badgesPreset: ["Java"] });
    expect(md).toContain("logo=openjdk");
  });

  it("échappe le HTML des soft skills personnalisées", () => {
    const md = generateReadme({ ...base, softSkillsCustom: "<script>x</script>" });
    expect(md).toContain("&lt;script&gt;");
  });

  it("n'ajoute la config cachée que si demandé", () => {
    expect(generateReadme(base)).toContain("<!-- readme-generator:config");
    expect(generateReadme({ ...base, embedConfig: false })).not.toContain("readme-generator:config");
  });
});

describe("encodeConfig / decodeConfig", () => {
  it("fait l'aller-retour avec accents et emojis", () => {
    const decoded = decodeConfig(encodeConfig(base));
    expect(decoded?.bio).toBe("Première programmeuse 💜");
    expect(decoded?.name).toBe("Ada Lovelace");
  });

  it("renvoie null si la chaîne est invalide", () => {
    expect(decodeConfig("pas-du-base64!!")).toBeNull();
  });
});

describe("parseReadme", () => {
  it("restaure exactement la config d'un README généré", () => {
    const values = { ...base, quote: "Hello", sections: { ...base.sections, fun: true } };
    const result = parseReadme(generateReadme(values));
    expect(result.source).toBe("config");
    expect(result.hasManualEdits).toBe(false);
    expect(result.values.quote).toBe("Hello");
  });

  it("signale les retouches manuelles", () => {
    const md = generateReadme(base).replace("Première programmeuse", "Première développeuse");
    expect(parseReadme(md).hasManualEdits).toBe(true);
  });

  it("reconstruit un README sans config", () => {
    const md = generateReadme({
      ...base,
      embedConfig: false,
      badgesCustom: "Astro",
      softSkillsCustom: "Prise de parole",
      funFact: "J’adore le café",
      sections: { ...base.sections, fun: true },
    });
    const { values, source } = parseReadme(md);
    expect(source).toBe("analyse");
    expect(values.name).toBe("Ada Lovelace");
    expect(values.username).toBe("ada");
    expect(values.bio).toBe("Première programmeuse 💜");
    expect(values.badgesPreset).toEqual(["TypeScript", "React", "NextJS", "Tailwind", "GitHub"]);
    expect(values.badgesCustom).toBe("Astro");
    expect(values.softSkillsPreset).toContain("Communication");
    expect(values.softSkillsCustom).toBe("Prise de parole");
    expect(values.links.linkedin).toBe(DEFAULT_VALUES.links.linkedin);
    expect(values.links.website).toBe(DEFAULT_VALUES.links.website);
    expect(values.funFact).toBe("J’adore le café");
    expect(values.sections.stats).toBe(true);
  });

  it("remplace l'instance officielle des trophées, hors service", () => {
    const { values } = parseReadme("# Jo\n\n![T](https://github-profile-trophy.vercel.app/?username=jo)");
    expect(values.sections.trophies).toBe(true);
    expect(values.trophyBaseUrl).toBe(DEFAULT_VALUES.trophyBaseUrl);
  });

  it("garde les Skill Icons hors catalogue comme technos libres", () => {
    const { values } = parseReadme('# Jo\n\n<img src="https://skillicons.dev/icons?i=ts,vue" />');
    expect(values.badgesPreset).toEqual(["TypeScript"]);
    expect(values.badgesCustom).toBe("Vue");
  });

  it("lit un README écrit à la main", () => {
    const md = [
      "# Jo",
      "",
      "Dev front à Nantes.",
      "",
      "## Soft skills",
      "- Curiosité",
      "- Humour",
      "",
      "![React](https://img.shields.io/badge/React-61DAFB?logo=react)",
      "",
      "Retrouvez-moi sur [LinkedIn](https://www.linkedin.com/in/jo/)",
    ].join("\n");
    const { values } = parseReadme(md);
    expect(values.name).toBe("Jo");
    expect(values.bio).toBe("Dev front à Nantes.");
    expect(values.softSkillsPreset).toEqual(["Curiosité"]);
    expect(values.softSkillsCustom).toBe("Humour");
    expect(values.badgesPreset).toEqual(["React"]);
    expect(values.links.linkedin).toBe("https://www.linkedin.com/in/jo/");
  });
});

describe("widgets", () => {
  const withWidgets: FormValues = {
    ...base,
    skillsDisplay: "icons",
    badgesPreset: ["TypeScript", "React", "Storybook"],
    typingLines: "Bonjour 👋\nJe code; et j’enseigne",
    summaryCards: ["profile-details", "stats"],
    statsTheme: "github_dark",
    sections: { ...base.sections, typing: true, trophies: true, summaryCards: true },
  };

  it("génère texte animé, Skill Icons, trophées et cartes de résumé", () => {
    const md = generateReadme(withWidgets);
    expect(md).toContain("readme-typing-svg.demolab.com");
    expect(md).toContain("lines=Bonjour%20%F0%9F%91%8B;Je%20code%3B%20et%20j%E2%80%99enseigne");
    expect(md).toContain('alt="Bonjour 👋. Je code; et j’enseigne"');
    expect(md).toContain("skillicons.dev/icons?i=ts,react");
    // Storybook n'a pas d'icône : il reste en badge
    expect(md).toContain('<img alt="Storybook" src="https://img.shields.io/badge/');
    expect(md).toContain("theme=darkhub");
    expect(md).toContain("/api/cards/profile-details?username=ada&theme=github_dark");
    expect(md).toContain("/api/cards/stats?username=ada");
  });

  it("retrouve les widgets dans un README sans config", () => {
    const { values } = parseReadme(generateReadme({ ...withWidgets, embedConfig: false }));
    expect(values.sections.typing).toBe(true);
    expect(values.typingLines).toBe("Bonjour 👋\nJe code; et j’enseigne");
    expect(values.skillsDisplay).toBe("icons");
    expect(values.badgesPreset).toEqual(expect.arrayContaining(["TypeScript", "React", "Storybook"]));
    expect(values.sections.trophies).toBe(true);
    expect(values.summaryCards).toEqual(["profile-details", "stats"]);
  });
});
