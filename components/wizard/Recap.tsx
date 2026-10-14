"use client";

import { useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, Copy, Download, Link2, Pencil } from "lucide-react";
import {
  DEFAULT_STATS_BASE_URL,
  DEFAULT_TROPHY_BASE_URL,
  SECTION_LABELS,
  type FormValues,
  type SectionKey,
} from "@/lib/config";
import { cardClass, hintClass, inputClass, labelClass, legendClass, linkButtonClass, primaryButtonClass, secondaryButtonClass } from "@/components/form/ui";
import type { Question } from "./questions";

type Props = {
  questions: Question[];
  onEdit: (id: string) => void;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
};

function BlockOrder() {
  const { watch, setValue, register } = useFormContext<FormValues>();
  const order: SectionKey[] = watch("sectionOrder").filter((k) => k !== "header");

  function move(key: SectionKey, delta: -1 | 1) {
    const list = [...order];
    const i = list.indexOf(key);
    const j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setValue("sectionOrder", ["header", ...list], { shouldDirty: true });
    // Garde le focus sur le même bouton après le déplacement
    requestAnimationFrame(() => document.getElementById(`order-${key}-${delta}`)?.focus());
  }

  return (
    <ol className="space-y-2" aria-label="Blocs du README, dans l’ordre d’affichage">
      {order.map((key, i) => (
        <li key={key} className="flex items-center gap-3 rounded-lg border-2 border-slate-800 px-3 py-2 dark:border-slate-300">
          <label className="flex flex-1 items-center gap-3 text-base">
            <input type="checkbox" {...register(`sections.${key}` as const)} className="h-5 w-5 accent-slate-950 dark:accent-slate-50" />
            <span className="font-medium">{SECTION_LABELS[key]}</span>
          </label>
          <button
            id={`order-${key}--1`}
            type="button"
            onClick={() => move(key, -1)}
            disabled={i === 0}
            aria-label={`Monter « ${SECTION_LABELS[key]} »`}
            className="rounded-md border-2 border-slate-800 p-1 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowUp size={16} aria-hidden />
          </button>
          <button
            id={`order-${key}-1`}
            type="button"
            onClick={() => move(key, 1)}
            disabled={i === order.length - 1}
            aria-label={`Descendre « ${SECTION_LABELS[key]} »`}
            className="rounded-md border-2 border-slate-800 p-1 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowDown size={16} aria-hidden />
          </button>
        </li>
      ))}
    </ol>
  );
}

export function Recap({ questions, onEdit, onCopy, onDownload, onShare }: Props) {
  const { register, watch } = useFormContext<FormValues>();
  const values = watch();
  const username = values.username;

  return (
    <div className="space-y-8">
      <section aria-labelledby="export-title" className={`${cardClass} space-y-3`}>
        <h3 id="export-title" className={legendClass}>Récupère ton README</h3>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onDownload} className={primaryButtonClass}>
            <Download size={18} aria-hidden /> Télécharger README.md
          </button>
          <button type="button" onClick={onCopy} className={secondaryButtonClass}>
            <Copy size={16} aria-hidden /> Copier le Markdown
          </button>
          <button type="button" onClick={onShare} className={`${linkButtonClass} inline-flex items-center gap-1.5`}>
            <Link2 size={16} aria-hidden /> Copier un lien de partage
          </button>
        </div>
      </section>

      <section aria-labelledby="publish-title" className={`${cardClass} space-y-2`}>
        <h3 id="publish-title" className={legendClass}>Publie-le sur ton profil</h3>
        <ol className="list-decimal space-y-1.5 pl-5 text-base">
          <li>
            Crée un dépôt <strong>public</strong> nommé exactement <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{username || "ton-pseudo"}</code>{" "}
            (<a className="underline underline-offset-4" href="https://github.com/new" target="_blank" rel="noreferrer">créer le dépôt</a>).
          </li>
          <li>Coche « Add a README file ».</li>
          <li>Ouvre le README, clique sur le crayon ✎, colle ton Markdown, puis « Commit changes ».</li>
          <li>
            C’est en ligne sur{" "}
            {username ? (
              <a className="underline underline-offset-4" href={`https://github.com/${encodeURIComponent(username)}`} target="_blank" rel="noreferrer">github.com/{username}</a>
            ) : (
              <code>github.com/ton-pseudo</code>
            )}
            .
          </li>
        </ol>
      </section>

      <section aria-labelledby="answers-title" className="space-y-3">
        <h3 id="answers-title" className={legendClass}>Tes réponses</h3>
        <dl className="divide-y-2 divide-slate-200 rounded-xl border-2 border-slate-800 dark:divide-slate-700 dark:border-slate-300">
          {questions.filter((q) => q.summary(values) !== null).map((q) => (
            <div key={q.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <dt className="text-sm font-semibold text-slate-700 dark:text-slate-300">{q.title}</dt>
                <dd className="truncate text-base text-slate-950 dark:text-slate-50">{q.summary(values)}</dd>
              </div>
              <button type="button" onClick={() => onEdit(q.id)} className={`${linkButtonClass} inline-flex shrink-0 items-center gap-1 text-sm`}>
                <Pencil size={14} aria-hidden /> Modifier<span className="sr-only"> : {q.title}</span>
              </button>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="order-title" className="space-y-3">
        <h3 id="order-title" className={legendClass}>Ordre des blocs</h3>
        <p className={hintClass}>Décoche pour masquer un bloc, utilise les flèches pour le déplacer.</p>
        <label className="flex items-center gap-3 text-base">
          <input type="checkbox" {...register("sections.header")} className="h-5 w-5 accent-slate-950 dark:accent-slate-50" />
          <span className="font-medium">Bannière en haut</span>
        </label>
        <BlockOrder />
      </section>

      <details className="rounded-xl border-2 border-slate-800 p-4 dark:border-slate-300">
        <summary className="cursor-pointer text-base font-semibold">Options avancées</summary>
        <div className="mt-4 space-y-4">
          <label className="flex items-start gap-3 text-base">
            <input type="checkbox" {...register("embedConfig")} className="mt-1 h-5 w-5 accent-slate-950 dark:accent-slate-50" aria-describedby="embedConfig-hint" />
            <span>
              <span className="font-medium">Pouvoir modifier ce README plus tard</span>
              <span id="embedConfig-hint" className={`block ${hintClass}`}>
                Ajoute un commentaire invisible sur GitHub. Recolle le README ici (« Importer un README ») pour retrouver toutes tes réponses.
              </span>
            </span>
          </label>
          <div>
            <label className={labelClass} htmlFor="statsBaseUrl">Instance github-readme-stats</label>
            <input id="statsBaseUrl" type="url" {...register("statsBaseUrl")} aria-describedby="statsBaseUrl-hint" className={inputClass} placeholder={DEFAULT_STATS_BASE_URL} />
            <p id="statsBaseUrl-hint" className={hintClass}>
              L’instance publique est parfois saturée.{" "}
              <a className="underline underline-offset-4" href="https://github.com/anuraghazra/github-readme-stats#deploy-on-your-own" target="_blank" rel="noreferrer">Déployer la sienne</a>{" "}
              (gratuit sur Vercel).
            </p>
          </div>
          <div>
            <label className={labelClass} htmlFor="trophyBaseUrl">Instance github-profile-trophy</label>
            <input id="trophyBaseUrl" type="url" {...register("trophyBaseUrl")} aria-describedby="trophyBaseUrl-hint" className={inputClass} placeholder={DEFAULT_TROPHY_BASE_URL} />
            <p id="trophyBaseUrl-hint" className={hintClass}>
              L’instance officielle est hors service : un miroir communautaire est utilisé par défaut.{" "}
              <a className="underline underline-offset-4" href="https://github.com/ryo-ma/github-profile-trophy#about-self-hosting" target="_blank" rel="noreferrer">Héberger la sienne</a>.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
