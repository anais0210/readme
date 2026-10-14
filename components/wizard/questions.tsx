"use client";

import { useState, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Github, Loader2 } from "lucide-react";
import { SECTION_KEYS, SECTION_LABELS, SUMMARY_CARDS, type FormValues, type SectionKey, type SummaryCard } from "@/lib/config";
import { fetchGitHubProfile } from "@/lib/github";
import { PRESETS } from "@/lib/presets";
import { BadgesFieldset, KeySkillsFieldset, SkillsDisplayChoice, SoftSkillsFieldset } from "@/components/form/SkillsFieldsets";
import { LinksFieldset } from "@/components/form/ContentFieldsets";
import { choiceCardClass, inputClass, labelClass, secondaryButtonClass } from "@/components/form/ui";

export type QuestionContext = {
  announce: (message: string) => void;
};

export type Question = {
  id: string;
  title: string;
  help?: string;
  /** Seul le pseudo est obligatoire : les autres questions peuvent être passées. */
  required?: boolean;
  /** Question affichée seulement si la condition est vraie (ex. bloc activé). */
  show?: (v: FormValues) => boolean;
  /** Message d'erreur si la réponse ne permet pas de continuer. */
  validate?: (v: FormValues) => string | null;
  /** Résumé de la réponse pour le récapitulatif (null : absente du récapitulatif). */
  summary: (v: FormValues) => string | null;
  render: (ctx: QuestionContext) => ReactNode;
};

const radioClass = "mt-1 h-5 w-5 shrink-0 accent-slate-950 dark:accent-slate-50";
const checkboxClass = "mt-1 h-5 w-5 shrink-0 accent-slate-950 dark:accent-slate-50";

function list(items: string[], empty = "Rien pour l’instant") {
  return items.length ? items.join(", ") : empty;
}

// --- Questions

function UsernameQuestion({ announce }: QuestionContext) {
  const { register, getValues, setValue, formState: { errors } } = useFormContext<FormValues>();
  const [loading, setLoading] = useState(false);

  async function prefill() {
    const username = getValues("username").trim();
    if (!username) {
      announce("Écris d’abord ton pseudo GitHub.");
      return;
    }
    setLoading(true);
    const result = await fetchGitHubProfile(username);
    setLoading(false);
    if (!result.ok) {
      announce(
        result.reason === "not-found"
          ? `Aucun compte GitHub « ${username} » trouvé. Vérifie l’orthographe.`
          : "GitHub ne répond pas pour le moment. Tu peux remplir les questions à la main."
      );
      return;
    }
    const { profile } = result;
    const opts = { shouldDirty: true };
    const filled: string[] = [];
    if (profile.name) { setValue("name", profile.name, opts); filled.push("ton nom"); }
    if (profile.bio) { setValue("bio", profile.bio, opts); filled.push("ta bio"); }
    if (profile.website) { setValue("links.website", profile.website, opts); filled.push("ton site"); }
    setValue("links.github", profile.url, opts);
    filled.push("ton lien GitHub");
    announce(`Récupéré depuis GitHub : ${filled.join(", ")}. Tu pourras tout modifier.`);
  }

  return (
    <div className="space-y-3">
      <label htmlFor="username" className="sr-only">Pseudo GitHub</label>
      <input
        id="username"
        {...register("username")}
        aria-required="true"
        aria-invalid={!!errors.username}
        aria-describedby="question-help username-error"
        className={`${inputClass} text-lg`}
        placeholder="octocat"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
      />
      <button type="button" onClick={prefill} disabled={loading} className={secondaryButtonClass}>
        {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Github size={16} aria-hidden />}
        Récupérer mon nom et ma bio depuis GitHub
      </button>
    </div>
  );
}

function PresetQuestion({ announce }: QuestionContext) {
  const { setValue } = useFormContext<FormValues>();
  const [choice, setChoice] = useState<string | null>(null);

  function apply(id: string) {
    setChoice(id);
    if (id === "none") return;
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const opts = { shouldDirty: true };
    setValue("bio", preset.values.bio, opts);
    setValue("badgesPreset", preset.values.badgesPreset, opts);
    setValue("softSkillsPreset", preset.values.softSkillsPreset, opts);
    setValue("style", preset.values.style, opts);
    for (const key of SECTION_KEYS) setValue(`sections.${key}`, preset.values.sections[key] ?? false, opts);
    announce(`Profil « ${preset.label} » appliqué : bio, technos et blocs pré-remplis.`);
  }

  const options = [...PRESETS.map((p) => ({ id: p.id, label: p.label, description: p.description })), { id: "none", label: "Aucun, je pars de zéro", description: "Rien n’est pré-rempli" }];
  return (
    <fieldset>
      <legend className="sr-only">Profil</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.id} className={choiceCardClass}>
            <input type="radio" name="preset" value={o.id} checked={choice === o.id} onChange={() => apply(o.id)} className={radioClass} />
            <span>
              <span className="block text-base font-semibold">{o.label}</span>
              <span className="block text-sm text-slate-700 dark:text-slate-300">{o.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Blocs facultatifs proposés en plus des sections de base (bio, technos, qualités, liens). */
const EXTRA_BLOCKS: { key: SectionKey; hint: string }[] = [
  { key: "header", hint: "Une vague colorée avec ton nom" },
  { key: "typing", hint: "Des phrases qui s’écrivent toutes seules" },
  { key: "projects", hint: "Des cartes vers tes dépôts" },
  { key: "stats", hint: "Statistiques et calendrier de contributions" },
  { key: "summaryCards", hint: "Graphiques de langages" },
  { key: "trophies", hint: "Des trophées selon ton activité" },
  { key: "keySkills", hint: "3 compétences avec une preuve" },
  { key: "fun", hint: "Un fun fact ou une citation" },
  { key: "visitors", hint: "Le nombre de visites du profil" },
  { key: "changelog", hint: "Une image de tes dernières contributions" },
];

function BlocksQuestion() {
  const { register } = useFormContext<FormValues>();
  return (
    <fieldset>
      <legend className="sr-only">Blocs à afficher</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EXTRA_BLOCKS.map(({ key, hint }) => (
          <label key={key} className={choiceCardClass}>
            <input type="checkbox" {...register(`sections.${key}` as const)} className={checkboxClass} />
            <span>
              <span className="block text-base font-semibold">{SECTION_LABELS[key]}</span>
              <span className="block text-sm text-slate-700 dark:text-slate-300">{hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SummaryCardsQuestion() {
  const { watch, setValue } = useFormContext<FormValues>();
  const cards = watch("summaryCards") ?? [];
  return (
    <fieldset>
      <legend className="sr-only">Cartes de résumé</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.entries(SUMMARY_CARDS) as [SummaryCard, string][]).map(([card, label]) => (
          <label key={card} className={choiceCardClass}>
            <input
              type="checkbox"
              checked={cards.includes(card)}
              onChange={(e) => setValue("summaryCards", e.target.checked ? [...cards, card] : cards.filter((c) => c !== card), { shouldDirty: true })}
              className={checkboxClass}
            />
            <span className="text-base font-semibold">{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const STYLES = [
  { value: "emoji", label: "Avec emojis", example: "## 🛠️ Compétences" },
  { value: "colorful", label: "Coloré", example: "Badges grand format" },
  { value: "minimal", label: "Minimal", example: "## Compétences" },
] as const;

function StyleQuestion() {
  const { register } = useFormContext<FormValues>();
  return (
    <fieldset>
      <legend className="sr-only">Style</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STYLES.map((s) => (
          <label key={s.value} className={choiceCardClass}>
            <input type="radio" value={s.value} {...register("style")} className={radioClass} />
            <span>
              <span className="block text-base font-semibold">{s.label}</span>
              <code className="block text-sm text-slate-700 dark:text-slate-300">{s.example}</code>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const THEMES = [
  { value: "default", label: "Clair", colors: ["#fffefe", "#2f80ed", "#434d58"] },
  { value: "radical", label: "Radical", colors: ["#141321", "#fe428e", "#a9fef7"] },
  { value: "tokyonight", label: "Tokyo Night", colors: ["#1a1b27", "#70a5fd", "#38bdae"] },
  { value: "github_dark", label: "GitHub sombre", colors: ["#0d1117", "#58a6ff", "#c3d1d9"] },
] as const;

function ThemeQuestion() {
  const { register } = useFormContext<FormValues>();
  return (
    <fieldset>
      <legend className="sr-only">Couleurs des cartes</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {THEMES.map((t) => (
          <label key={t.value} className={choiceCardClass}>
            <input type="radio" value={t.value} {...register("statsTheme")} className={radioClass} />
            <span className="flex flex-col gap-2">
              <span className="text-base font-semibold">{t.label}</span>
              <span className="flex" aria-hidden>
                {t.colors.map((c) => (
                  <span key={c} className="h-5 w-8 border-2 border-slate-800 first:rounded-l last:rounded-r dark:border-slate-300" style={{ background: c }} />
                ))}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TextField({ id, label, field, placeholder, rows }: { id: string; label: string; field: "name" | "bio" | "typingLines" | "pinnedRepos" | "funFact" | "quote" | "changelogImageUrl"; placeholder?: string; rows?: number }) {
  const { register } = useFormContext<FormValues>();
  return (
    <div>
      <label htmlFor={id} className={label.startsWith("sr:") ? "sr-only" : labelClass}>{label.replace(/^sr:/, "")}</label>
      {rows ? (
        <textarea id={id} {...register(field)} rows={rows} aria-describedby="question-help" className={`${inputClass} text-lg`} placeholder={placeholder} />
      ) : (
        <input id={id} {...register(field)} aria-describedby="question-help" className={`${inputClass} text-lg`} placeholder={placeholder} />
      )}
    </div>
  );
}

const hasCards = (v: FormValues) => v.sections.stats || v.sections.summaryCards || v.sections.trophies || v.sections.projects || v.sections.typing;

export const QUESTIONS: Question[] = [
  {
    id: "username",
    title: "Quel est ton pseudo GitHub ?",
    help: "C’est ce qui suit github.com/ dans l’adresse de ton profil. Il sert aux statistiques et aux cartes.",
    required: true,
    validate: (v) => (v.username.trim() ? null : "Écris ton pseudo GitHub pour continuer."),
    summary: (v) => v.username || "Non renseigné",
    render: (ctx) => <UsernameQuestion {...ctx} />,
  },
  {
    id: "preset",
    title: "Quel profil te ressemble le plus ?",
    help: "On pré-remplit la bio, les technos et les blocs. Tu pourras tout changer ensuite.",
    summary: () => null,
    render: (ctx) => <PresetQuestion {...ctx} />,
  },
  {
    id: "name",
    title: "Quel nom veux-tu afficher en titre ?",
    help: "Ton prénom, ton nom complet ou un pseudo.",
    summary: (v) => v.name || v.username || "Non renseigné",
    render: () => <TextField id="name" label="sr:Nom affiché" field="name" placeholder="Ada Lovelace" />,
  },
  {
    id: "bio",
    title: "Présente-toi en une ou deux phrases",
    help: "Ce que tu fais, ce qui te motive, ce que tu cherches.",
    summary: (v) => v.bio || "Pas de bio",
    render: () => <TextField id="bio" label="sr:Bio" field="bio" rows={4} placeholder="Développeuse web en reconversion, passionnée d’accessibilité." />,
  },
  {
    id: "techs",
    title: "Avec quelles technos travailles-tu ?",
    help: "Clique pour sélectionner. Tu peux chercher, ou ajouter une techno absente de la liste.",
    summary: (v) => `${v.badgesPreset.length + (v.badgesCustom ? v.badgesCustom.split(",").filter((s) => s.trim()).length : 0)} techno(s)`,
    render: () => <BadgesFieldset srLegend />,
  },
  {
    id: "techDisplay",
    title: "Tu préfères des badges ou des icônes ?",
    summary: (v) => (v.skillsDisplay === "icons" ? "Icônes" : "Badges"),
    render: () => <SkillsDisplayChoice />,
  },
  {
    id: "softSkills",
    title: "Quelles sont tes qualités ?",
    help: "Choisis-en 3 ou 4, ou écris les tiennes.",
    summary: (v) => list([...v.softSkillsPreset, ...v.softSkillsCustom.split(",").map((s) => s.trim()).filter(Boolean)]),
    render: () => <SoftSkillsFieldset srLegend />,
  },
  {
    id: "links",
    title: "Où peut-on te trouver ?",
    help: "Laisse vide ce que tu ne veux pas afficher.",
    summary: (v) => list([v.links.github && "GitHub", v.links.linkedin && "LinkedIn", v.links.website && "Site"].filter(Boolean) as string[], "Aucun lien"),
    render: () => <LinksFieldset srLegend />,
  },
  {
    id: "blocks",
    title: "Que veux-tu ajouter à ton README ?",
    help: "Coche ce qui te plaît : on te posera ensuite quelques questions sur ces blocs.",
    summary: (v) => list(EXTRA_BLOCKS.filter((b) => v.sections[b.key]).map((b) => SECTION_LABELS[b.key]), "Aucun bloc en plus"),
    render: () => <BlocksQuestion />,
  },
  {
    id: "typing",
    title: "Quelles phrases doivent s’écrire toutes seules ?",
    help: "Une phrase par ligne, 5 au maximum.",
    show: (v) => v.sections.typing,
    summary: (v) => v.typingLines.split("\n").filter(Boolean).join(" / ") || "Aucune phrase",
    render: () => <TextField id="typingLines" label="sr:Phrases animées" field="typingLines" rows={4} />,
  },
  {
    id: "projects",
    title: "Quels projets veux-tu mettre en avant ?",
    help: "Les noms de tes dépôts, séparés par des virgules (6 maximum). Pour le dépôt de quelqu’un d’autre : propriétaire/dépôt.",
    show: (v) => v.sections.projects,
    summary: (v) => v.pinnedRepos || "Aucun projet",
    render: () => <TextField id="pinnedRepos" label="sr:Dépôts" field="pinnedRepos" placeholder="mon-portfolio, ma-todo-app" />,
  },
  {
    id: "keySkills",
    title: "Quelles compétences veux-tu prouver ?",
    help: "Jusqu’à 3, avec un dépôt ou une ressource qui le montre.",
    show: (v) => v.sections.keySkills,
    summary: (v) => list(v.keySkills.map((k) => k.name).filter(Boolean)),
    render: () => <KeySkillsFieldset srLegend />,
  },
  {
    id: "summaryCards",
    title: "Quelles cartes de résumé veux-tu ?",
    show: (v) => v.sections.summaryCards,
    summary: (v) => list(v.summaryCards.map((c) => SUMMARY_CARDS[c])),
    render: () => <SummaryCardsQuestion />,
  },
  {
    id: "fun",
    title: "Un fun fact ou une citation ?",
    help: "Pour finir sur une note perso.",
    show: (v) => v.sections.fun,
    summary: (v) => list([v.funFact, v.quote].filter(Boolean)),
    render: () => (
      <div className="space-y-4">
        <TextField id="ff" label="Fun fact" field="funFact" placeholder="Je bois trop de café ☕" />
        <TextField id="qt" label="Citation" field="quote" placeholder="Talk is cheap. Show me the code. — Linus Torvalds" />
      </div>
    ),
  },
  {
    id: "changelog",
    title: "Quelle image de changelog veux-tu afficher ?",
    help: "L’adresse d’une image dynamique, par exemple un instantané GitClear.",
    show: (v) => v.sections.changelog,
    summary: (v) => v.changelogImageUrl || "Aucune image",
    render: () => <TextField id="chg" label="sr:URL de l’image" field="changelogImageUrl" placeholder="https://cdn.gitclear.com/snap/…png" />,
  },
  {
    id: "style",
    title: "Quel style te plaît ?",
    summary: (v) => STYLES.find((s) => s.value === v.style)?.label ?? v.style,
    render: () => <StyleQuestion />,
  },
  {
    id: "theme",
    title: "Quelles couleurs pour les cartes ?",
    help: "Pour les statistiques, trophées, projets et le texte animé.",
    show: hasCards,
    summary: (v) => THEMES.find((t) => t.value === v.statsTheme)?.label ?? v.statsTheme,
    render: () => <ThemeQuestion />,
  },
];

