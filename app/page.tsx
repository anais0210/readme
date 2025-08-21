"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { generateReadme, type FormValues } from "@/lib/template";
import { Copy, Download, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Preview } from "@/components/Preview";

// (compétences techniques désormais via les badges ci-dessous)
const BADGE_CATEGORIES = {
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

const SOFT_SKILLS = [
  "Communication", "Travail d’équipe", "Autonomie", "Résolution de problèmes", "Créativité",
  "Esprit d’analyse", "Empathie", "Curiosité", "Gestion du temps", "Organisation",
  "Leadership", "Adaptabilité", "Esprit critique", "Pédagogie",
];

export default function Page() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      name: "",
      username: "",
      bio: "Développeur·euse passionné·e par le web moderne.",
      softSkillsPreset: ["Communication","Travail d’équipe","Résolution de problèmes"],
      softSkillsCustom: "",
      links: {
        github: "https://github.com/anais0210/",
        linkedin: "https://www.linkedin.com/in/anais-sparesotto-formatrice/",
        website: "https://anais-formation-tech.fr/",
      },
      badgesPreset: ["TypeScript","React","NextJS","Tailwind","GitHub"],
      style: "emoji",
      statsTheme: "radical",
      sections: { bio: true, softSkills: true, projects: false, badges: true, stats: true, links: true, fun: false, changelog: false },
      funFact: "",
      quote: "",
      changelogImageUrl: "",
    },
    mode: "onChange",
  });

  const values = watch();
  const markdown = useMemo(() => generateReadme(values), [values]);
  const [previewCols, setPreviewCols] = useState(1);
  const previewColsClass = previewCols === 3 ? "columns-1 sm:columns-2 xl:columns-3 gap-6" : previewCols === 2 ? "columns-1 md:columns-2 gap-6" : "columns-1";

  const selectedBadges = useMemo(() => new Set(values.badgesPreset), [values.badgesPreset]);
  const selectedSoft = useMemo(() => new Set(values.softSkillsPreset), [values.softSkillsPreset]);
  const categoryList = Object.entries(BADGE_CATEGORIES) as [string, readonly string[]][];
  const categoryContainerClass = categoryList.length > 5 ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2" : "space-y-2";

  function toggleArrayField(field: "badgesPreset" | "softSkillsPreset", item: string) {
    const set = new Set(values[field]);
    if (set.has(item)) {
      set.delete(item);
    } else {
      set.add(item);
    }
    setValue(field, Array.from(set), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {}
  }

  function downloadFile() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Générateur de README GitHub</h1>
        <button
          aria-label="Basculer le thème"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {mounted ? (resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />) : null}
          {mounted ? (resolvedTheme === "dark" ? "Clair" : "Sombre") : ""}
        </button>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} aria-label="Formulaire de génération README">
          {/* */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-medium">Identité</legend>
            <div>
              <label className="block text-sm mb-1" htmlFor="name">Prénom / Pseudo</label>
              <input id="name" {...register("name")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="Ada Lovelace" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="username">Nom d’utilisateurice GitHub</label>
              <input id="username" {...register("username")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="octocat" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="bio">Bio</label>
              <textarea id="bio" {...register("bio")} rows={3} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
            </div>
          </fieldset>

          {/* Compétences techniques = ci-dessous via les badges */}
          <fieldset className="space-y-3">
            <legend className="text-lg font-medium">Compétences</legend>
            <div className={categoryContainerClass}>
              {Object.entries(BADGE_CATEGORIES).map(([category, items]) => (
                <details key={category} className="rounded-md border border-slate-300 dark:border-slate-700">
                  <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
                    {category}
                  </summary>
                  <div className="px-3 pb-3">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {items.map((badge) => (
                        <button
                          key={badge}
                          type="button"
                          aria-pressed={selectedBadges.has(badge)}
                          onClick={() => toggleArrayField("badgesPreset", badge)}
                          className={`rounded-full border px-3 py-1 text-sm ${selectedBadges.has(badge)
                              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
                              : "border-slate-300 dark:border-slate-700"
                            }`}
                        >
                          {badge}
                        </button>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </fieldset>
          
          <fieldset className="space-y-3">
            <legend className="text-lg font-medium">Soft skills</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Soft skills (cases à cocher)">
              {SOFT_SKILLS.map((ss) => (
                <button
                  key={ss}
                  type="button"
                  aria-pressed={selectedSoft.has(ss)}
                  onClick={() => toggleArrayField("softSkillsPreset", ss)}
                  className={`rounded-full border px-3 py-1 text-sm ${selectedSoft.has(ss)
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
                      : "border-slate-300 dark:border-slate-700"
                    }`}
                >
                  {ss}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="softSkillsCustom">Autres (séparées par des virgules)</label>
              <input id="softSkillsCustom" {...register("softSkillsCustom")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="Communication interculturelle, Prise de parole…" />
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-lg font-medium">Liens</legend>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm mb-1" htmlFor="lgh">GitHub (URL profil)</label>
                <input id="lgh" {...register("links.github")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="https://github.com/mon-compte" />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="lli">LinkedIn</label>
                <input id="lli" {...register("links.linkedin")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="https://www.linkedin.com/in/xxx" />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="lws">Site / Portfolio</label>
                <input id="lws" {...register("links.website")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="https://mon-site.dev" />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="chg">Changelog dynamique (URL d’image)</label>
                <input id="chg" {...register("changelogImageUrl")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="https://cdn.gitclear.com/snap/uuid.png" />
              </div>
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-lg font-medium">Options d’affichage</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1" htmlFor="style">Style</label>
                <select id="style" {...register("style")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2">
                  <option value="minimal">Minimal</option>
                  <option value="colorful">Coloré</option>
                  <option value="emoji">Avec emojis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="statsTheme">Thème stats GitHub</label>
                <select id="statsTheme" {...register("statsTheme")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2">
                  <option value="default">Default</option>
                  <option value="radical">Radical</option>
                  <option value="tokyonight">Tokyo Night</option>
                  <option value="github_dark">GitHub Dark</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {([
                ["bio","Bio"],
                ["softSkills","Soft skills"],
                ["badges","Compétences"],
                ["stats","Stats GitHub"],
                ["links","Liens"],
                ["fun","Fun/Citation"],
                ["changelog","Changelog"],
              ] as const).map(([k, label]) => (
                <label key={k} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={values.sections[k]}
                    onChange={(e) =>
                      setValue("sections", { ...values.sections, [k]: e.target.checked }, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-lg font-medium">Fun</legend>
            <div>
              <label className="block text-sm mb-1" htmlFor="ff">Fun fact (optionnel)</label>
              <input id="ff" {...register("funFact")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="J’adore le café ☕ et le Rust 🦀" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="qt">Citation (optionnel)</label>
              <input id="qt" {...register("quote")} className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="Talk is cheap. Show me the code. — Linus Torvalds" />
            </div>
          </fieldset>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Prévisualisation</h2>
            <div className="flex items-center gap-2">
              <label className="hidden md:block text-sm">Colonnes</label>
              <select
                aria-label="Nombre de colonnes de prévisualisation"
                value={previewCols}
                onChange={(e) => setPreviewCols(Number(e.target.value))}
                className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1 text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Copy size={16} /> Copier
              </button>
              <button
                onClick={downloadFile}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-2 text-sm hover:opacity-90"
              >
                <Download size={16} /> Télécharger
              </button>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 overflow-auto max-h-[70vh]" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            <div className={previewColsClass}>
              <Preview markdown={markdown} />
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            <label className="block text-sm mb-2">Markdown brut</label>
            <textarea
              readOnly
              value={markdown}
              rows={12}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
      </section>
      </main>
  );
}
