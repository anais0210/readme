"use client";

import { useFormContext } from "react-hook-form";
import { Copy, Download, Link2 } from "lucide-react";
import type { FormValues } from "@/lib/config";
import { cardClass, hintClass, legendClass, primaryButtonClass, secondaryButtonClass } from "@/components/form/ui";

type Props = {
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
};

const STYLES = [
  { value: "emoji", label: "Avec emojis", example: "## 🛠️ Compétences, badges compacts" },
  { value: "colorful", label: "Coloré", example: "badges grand format" },
  { value: "minimal", label: "Minimal", example: "## Compétences, badges compacts" },
] as const;

const THEMES = [
  { value: "default", label: "Default", colors: ["#fffefe", "#2f80ed", "#434d58"] },
  { value: "radical", label: "Radical", colors: ["#141321", "#fe428e", "#a9fef7"] },
  { value: "tokyonight", label: "Tokyo Night", colors: ["#1a1b27", "#70a5fd", "#38bdae"] },
  { value: "github_dark", label: "GitHub Dark", colors: ["#0d1117", "#58a6ff", "#c3d1d9"] },
] as const;

const radioCardClass =
  "flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 p-3 text-sm has-[:checked]:border-sky-700 has-[:checked]:ring-2 has-[:checked]:ring-sky-700/30 dark:has-[:checked]:border-sky-400";

export function FinishStep({ onCopy, onDownload, onShare }: Props) {
  const { register, watch } = useFormContext<FormValues>();
  const username = watch("username");

  return (
    <div className="space-y-8">
      <fieldset className="space-y-2">
        <legend className={legendClass}>Style</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {STYLES.map((s) => (
            <label key={s.value} className={radioCardClass}>
              <input type="radio" value={s.value} {...register("style")} />
              <span>
                <span className="block font-medium">{s.label}</span>
                <code className="text-xs text-slate-600 dark:text-slate-400">{s.example}</code>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className={legendClass}>Thème des cartes</legend>
        <p className={hintClass}>S’applique aux stats, trophées, cartes de résumé et au texte animé.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <label key={t.value} className={radioCardClass}>
              <input type="radio" value={t.value} {...register("statsTheme")} />
              <span className="flex flex-col gap-1">
                <span className="font-medium">{t.label}</span>
                <span className="flex" aria-hidden>
                  {t.colors.map((c) => (
                    <span key={c} className="h-3 w-5 border border-slate-400/50 first:rounded-l last:rounded-r" style={{ background: c }} />
                  ))}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" {...register("embedConfig")} className="mt-1" aria-describedby="embedConfig-hint" />
        <span>
          <span className="font-medium">Pouvoir modifier ce README plus tard</span>
          <span id="embedConfig-hint" className={`block ${hintClass}`}>
            Ajoute un commentaire invisible sur GitHub. Recollez le README ici (« Importer un README ») pour retrouver tout le formulaire.
          </span>
        </span>
      </label>

      <section aria-labelledby="export-title" className={`${cardClass} space-y-3`}>
        <h3 id="export-title" className={legendClass}>Récupérer le README</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onDownload} className={primaryButtonClass}>
            <Download size={16} aria-hidden /> Télécharger README.md
          </button>
          <button type="button" onClick={onCopy} className={secondaryButtonClass}>
            <Copy size={16} aria-hidden /> Copier le Markdown
          </button>
          <button type="button" onClick={onShare} className={secondaryButtonClass}>
            <Link2 size={16} aria-hidden /> Copier un lien de partage
          </button>
        </div>
      </section>

      <section aria-labelledby="publish-title" className={`${cardClass} space-y-2`}>
        <h3 id="publish-title" className={legendClass}>Publier sur votre profil GitHub</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>
            Créez un dépôt <strong>public</strong> qui porte exactement votre pseudo :{" "}
            <code>{username || "votre-pseudo"}</code>.{" "}
            <a className="underline" href="https://github.com/new" target="_blank" rel="noreferrer">Créer le dépôt</a>
          </li>
          <li>Cochez « Add a README file » à la création.</li>
          <li>Ouvrez ce README, cliquez sur le crayon ✎, collez votre Markdown puis « Commit changes ».</li>
          <li>
            C’est en ligne sur{" "}
            {username ? (
              <a className="underline" href={`https://github.com/${encodeURIComponent(username)}`} target="_blank" rel="noreferrer">
                github.com/{username}
              </a>
            ) : (
              <code>github.com/votre-pseudo</code>
            )}{" "}
            🎉
          </li>
        </ol>
      </section>
    </div>
  );
}
