"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import {
  DEFAULT_STATS_BASE_URL,
  DEFAULT_TROPHY_BASE_URL,
  SECTION_LABELS,
  SUMMARY_CARDS,
  type FormValues,
  type SectionKey,
  type SummaryCard,
} from "@/lib/config";
import { hintClass, inputClass, labelClass } from "@/components/form/ui";

type Props = {
  goToStep: (step: number) => void;
};

type BlockInfo = {
  description: string;
  /** Contenu saisi à une autre étape. */
  editAt?: { step: number; label: string };
  needsUsername?: boolean;
};

const BLOCKS: Record<SectionKey, BlockInfo> = {
  header: { description: "Une vague colorée avec votre nom, tout en haut." },
  typing: { description: "Des phrases qui s’écrivent toutes seules, l’effet « terminal »." },
  bio: { description: "Votre texte de présentation.", editAt: { step: 0, label: "Profil" } },
  badges: { description: "Vos technos, en badges ou en icônes.", editAt: { step: 1, label: "Compétences" } },
  softSkills: { description: "Vos qualités humaines, en liste.", editAt: { step: 1, label: "Compétences" } },
  keySkills: { description: "Jusqu’à 3 compétences avec une preuve.", editAt: { step: 1, label: "Compétences" } },
  projects: { description: "Des cartes cliquables vers vos dépôts.", needsUsername: true },
  stats: { description: "Statistiques, langages, série de contributions et calendrier.", needsUsername: true },
  summaryCards: { description: "Graphiques de langages et d’activité, au choix.", needsUsername: true },
  trophies: { description: "Des trophées débloqués selon votre activité GitHub.", needsUsername: true },
  links: { description: "Badges cliquables vers GitHub, LinkedIn et votre site.", editAt: { step: 0, label: "Profil" } },
  fun: { description: "Un fun fact et une citation pour finir sur une note perso." },
  changelog: { description: "Une image dynamique (GitClear ou autre) de vos dernières contributions." },
  visitors: { description: "Un compteur du nombre de visites de votre profil.", needsUsername: true },
};

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Afficher « ${label} »`}
      onClick={() => onChange(!checked)}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
        checked
          ? "border-sky-800 bg-sky-800 text-white dark:border-sky-300 dark:bg-sky-300 dark:text-slate-900"
          : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
      }`}
    >
      {checked ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
      {checked ? "Affiché" : "Masqué"}
    </button>
  );
}

function Advanced({ children }: { children: ReactNode }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-slate-700 dark:text-slate-300">Options avancées</summary>
      <div className="mt-2 space-y-2">{children}</div>
    </details>
  );
}

function BlockSettings({ blockKey }: { blockKey: SectionKey }) {
  const { register, watch, setValue } = useFormContext<FormValues>();
  const summaryCards = watch("summaryCards") ?? [];

  switch (blockKey) {
    case "typing":
      return (
        <div>
          <label className={labelClass} htmlFor="typingLines">Phrases (une par ligne, 5 maximum)</label>
          <textarea id="typingLines" {...register("typingLines")} rows={3} className={inputClass} />
        </div>
      );
    case "projects":
      return (
        <div>
          <label className={labelClass} htmlFor="pinnedRepos">Dépôts (jusqu’à 6, séparés par des virgules)</label>
          <input id="pinnedRepos" {...register("pinnedRepos")} aria-describedby="pinnedRepos-hint" className={inputClass} placeholder="mon-portfolio, octocat/hello-world" />
          <p id="pinnedRepos-hint" className={hintClass}>Nom du dépôt (le vôtre) ou <code>propriétaire/dépôt</code>.</p>
        </div>
      );
    case "stats":
      return (
        <Advanced>
          <label className={labelClass} htmlFor="statsBaseUrl">Instance github-readme-stats</label>
          <input id="statsBaseUrl" type="url" {...register("statsBaseUrl")} aria-describedby="statsBaseUrl-hint" className={inputClass} placeholder={DEFAULT_STATS_BASE_URL} />
          <p id="statsBaseUrl-hint" className={hintClass}>
            L’instance publique est parfois saturée. Pour un rendu fiable,{" "}
            <a className="underline" href="https://github.com/anuraghazra/github-readme-stats#deploy-on-your-own" target="_blank" rel="noreferrer">
              déployez la vôtre
            </a>{" "}
            (gratuit sur Vercel) et collez son URL ici.
          </p>
        </Advanced>
      );
    case "summaryCards":
      return (
        <fieldset>
          <legend className={labelClass}>Cartes à afficher</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {(Object.entries(SUMMARY_CARDS) as [SummaryCard, string][]).map(([card, label]) => (
              <label key={card} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={summaryCards.includes(card)}
                  onChange={(e) =>
                    setValue(
                      "summaryCards",
                      e.target.checked ? [...summaryCards, card] : summaryCards.filter((c) => c !== card),
                      { shouldDirty: true }
                    )
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "trophies":
      return (
        <Advanced>
          <label className={labelClass} htmlFor="trophyBaseUrl">Instance github-profile-trophy</label>
          <input id="trophyBaseUrl" type="url" {...register("trophyBaseUrl")} aria-describedby="trophyBaseUrl-hint" className={inputClass} placeholder={DEFAULT_TROPHY_BASE_URL} />
          <p id="trophyBaseUrl-hint" className={hintClass}>
            L’instance officielle est hors service : un miroir communautaire est utilisé par défaut. Pour plus de fiabilité,{" "}
            <a className="underline" href="https://github.com/ryo-ma/github-profile-trophy#about-self-hosting" target="_blank" rel="noreferrer">
              hébergez la vôtre
            </a>.
          </p>
        </Advanced>
      );
    case "fun":
      return (
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className={labelClass} htmlFor="ff">Fun fact</label>
            <input id="ff" {...register("funFact")} className={inputClass} placeholder="J’adore le café ☕ et le Rust 🦀" />
          </div>
          <div>
            <label className={labelClass} htmlFor="qt">Citation</label>
            <input id="qt" {...register("quote")} className={inputClass} placeholder="Talk is cheap. Show me the code. — Linus Torvalds" />
          </div>
        </div>
      );
    case "changelog":
      return (
        <div>
          <label className={labelClass} htmlFor="chg">URL de l’image</label>
          <input id="chg" type="url" {...register("changelogImageUrl")} className={inputClass} placeholder="https://cdn.gitclear.com/snap/uuid.png" />
        </div>
      );
    default:
      return null;
  }
}

function BlockCard({
  blockKey,
  index,
  total,
  onMove,
  goToStep,
}: {
  blockKey: SectionKey;
  index?: number;
  total?: number;
  onMove?: (key: SectionKey, delta: -1 | 1) => void;
  goToStep: (step: number) => void;
}) {
  const { watch, setValue } = useFormContext<FormValues>();
  const enabled = watch(`sections.${blockKey}`);
  const username = watch("username");
  const info = BLOCKS[blockKey];
  const label = SECTION_LABELS[blockKey];
  const titleId = `block-${blockKey}-title`;

  return (
    <li
      aria-labelledby={titleId}
      className={`rounded-lg border p-3 ${enabled ? "border-slate-300 dark:border-slate-600" : "border-dashed border-slate-300 dark:border-slate-700"}`}
    >
      <div className="flex items-start gap-3">
        {onMove && index !== undefined && total !== undefined ? (
          <span className="flex flex-col">
            <button
              id={`move-${blockKey}--1`}
              type="button"
              onClick={() => onMove(blockKey, -1)}
              disabled={index === 0}
              aria-label={`Monter « ${label} »`}
              className="rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            >
              <ArrowUp size={16} aria-hidden />
            </button>
            <button
              id={`move-${blockKey}-1`}
              type="button"
              onClick={() => onMove(blockKey, 1)}
              disabled={index === total - 1}
              aria-label={`Descendre « ${label} »`}
              className="rounded p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            >
              <ArrowDown size={16} aria-hidden />
            </button>
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className={`font-medium ${enabled ? "" : "text-slate-600 dark:text-slate-400"}`}>{label}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{info.description}</p>
        </div>
        <Switch checked={!!enabled} onChange={(v) => setValue(`sections.${blockKey}`, v, { shouldDirty: true })} label={label} />
      </div>

      {enabled ? (
        <div className="mt-3 space-y-2 pl-0 sm:pl-8">
          {info.needsUsername && !username ? (
            <p className="text-sm text-amber-800 dark:text-amber-300">
              ⚠ Ce bloc a besoin de votre pseudo GitHub.{" "}
              <button type="button" className="underline" onClick={() => goToStep(0)}>Le renseigner (étape 1)</button>
            </p>
          ) : null}
          {info.editAt ? (
            <p className="text-sm">
              <button type="button" className="underline" onClick={() => goToStep(info.editAt!.step)}>
                Modifier le contenu (étape « {info.editAt.label} »)
              </button>
            </p>
          ) : null}
          <BlockSettings blockKey={blockKey} />
        </div>
      ) : null}
    </li>
  );
}

export function BlocksStep({ goToStep }: Props) {
  const { watch, setValue } = useFormContext<FormValues>();
  const order: SectionKey[] = watch("sectionOrder").filter((k) => k !== "header");
  const enabledCount = order.filter((k) => watch(`sections.${k}`)).length;

  function move(key: SectionKey, delta: -1 | 1) {
    const list = [...order];
    const i = list.indexOf(key);
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setValue("sectionOrder", ["header", ...list], { shouldDirty: true });
    // Garde le focus sur le même bouton après le déplacement
    requestAnimationFrame(() => document.getElementById(`move-${key}-${delta}`)?.focus());
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Activez les blocs à afficher et rangez-les avec les flèches : l’ordre ici est celui du README.{" "}
        <span aria-live="polite">{enabledCount} bloc{enabledCount > 1 ? "s" : ""} affiché{enabledCount > 1 ? "s" : ""}.</span>
      </p>
      <ul className="space-y-2" aria-label="En-tête">
        <BlockCard blockKey="header" goToStep={goToStep} />
      </ul>
      <ol className="space-y-2" aria-label="Blocs du README, dans l’ordre d’affichage">
        {order.map((key, i) => (
          <BlockCard key={key} blockKey={key} index={i} total={order.length} onMove={move} goToStep={goToStep} />
        ))}
      </ol>
      <p className={hintClass}>Astuce : « Compétences techniques » et « Soft skills » côte à côte s’affichent en deux colonnes.</p>
    </div>
  );
}
