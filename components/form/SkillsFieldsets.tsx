"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { BADGE_CATEGORIES, BADGE_DEFS, SOFT_SKILLS } from "@/lib/badges";
import type { FormValues } from "@/lib/config";
import { chipClass, choiceCardClass, hintClass, inputClass, labelClass, legendClass } from "./ui";

function useToggleArray(field: "badgesPreset" | "softSkillsPreset") {
  const { watch, setValue } = useFormContext<FormValues>();
  const current = watch(field);
  const selected = useMemo(() => new Set(current), [current]);
  function toggle(item: string) {
    const set = new Set(current);
    if (set.has(item)) set.delete(item);
    else set.add(item);
    setValue(field, Array.from(set), { shouldDirty: true, shouldTouch: true });
  }
  return { selected, toggle };
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={chipClass(selected)}>
      {selected ? <Check size={14} aria-hidden /> : null}
      {label}
    </button>
  );
}

const DISPLAY_OPTIONS = [
  {
    value: "badges",
    label: "Badges",
    hint: "Compact, avec le nom écrit.",
    example: "https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white",
  },
  {
    value: "icons",
    label: "Icônes (Skill Icons)",
    hint: "Plus visuel. Les technos sans icône restent en badge.",
    example: "https://skillicons.dev/icons?i=ts,react,nextjs",
  },
] as const;

export function BadgesFieldset({ srLegend = false }: { srLegend?: boolean }) {
  const { register } = useFormContext<FormValues>();
  const { selected, toggle } = useToggleArray("badgesPreset");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const categories = Object.entries(BADGE_CATEGORIES)
    .map(([category, items]) => [
      category,
      items.filter((key) => !q || key.toLowerCase().includes(q) || BADGE_DEFS[key]?.label.toLowerCase().includes(q)),
    ] as const)
    .filter(([, items]) => items.length > 0);

  return (
    <fieldset className="space-y-3">
      <legend className={srLegend ? "sr-only" : legendClass}>Compétences techniques</legend>
      <p className={hintClass} aria-live="polite">{selected.size} techno{selected.size > 1 ? "s" : ""} sélectionnée{selected.size > 1 ? "s" : ""}</p>
      <div>
        <label className={labelClass} htmlFor="badge-search">Rechercher une techno</label>
        <input
          id="badge-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
          placeholder="react, docker, php…"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map(([category, items]) => {
          const count = items.filter((k) => selected.has(k)).length;
          return (
            <details key={category} open={!!q} className="rounded-lg border-2 border-slate-800 dark:border-slate-300">
              <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
                {category}
                {count ? <span className="ml-1 text-slate-700 dark:text-slate-300">({count})</span> : null}
              </summary>
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-2 mt-2">
                  {items.map((badge) => (
                    <Chip key={badge} label={BADGE_DEFS[badge]?.label ?? badge} selected={selected.has(badge)} onClick={() => toggle(badge)} />
                  ))}
                </div>
              </div>
            </details>
          );
        })}
        {categories.length === 0 ? (
          <p className="text-sm">Aucune techno trouvée : ajoute-la ci-dessous.</p>
        ) : null}
      </div>
      <div>
        <label className={labelClass} htmlFor="badgesCustom">Autres technos (séparées par des virgules)</label>
        <input id="badgesCustom" {...register("badgesCustom")} aria-describedby="badgesCustom-hint" className={inputClass} placeholder="Astro, Supabase, Svelte…" />
        <p id="badgesCustom-hint" className={hintClass}>
          Le logo est cherché automatiquement sur <a className="underline" href="https://simpleicons.org" target="_blank" rel="noreferrer">simpleicons.org</a>.
        </p>
      </div>
    </fieldset>
  );
}

/** Affichage des technos : badges shields ou rangée Skill Icons. */
export function SkillsDisplayChoice() {
  const { register } = useFormContext<FormValues>();
  return (
    <fieldset>
      <legend className="sr-only">Affichage des technos</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DISPLAY_OPTIONS.map((opt) => (
          <label key={opt.value} className={`${choiceCardClass} flex-col`}>
            <span className="flex items-center gap-2 text-base font-semibold">
              <input type="radio" value={opt.value} {...register("skillsDisplay")} className="h-5 w-5 accent-slate-950 dark:accent-slate-50" />
              {opt.label}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={opt.example} alt="" className="h-8 self-start" />
            <span className={hintClass}>{opt.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SoftSkillsFieldset({ srLegend = false }: { srLegend?: boolean }) {
  const { register } = useFormContext<FormValues>();
  const { selected, toggle } = useToggleArray("softSkillsPreset");
  return (
    <fieldset className="space-y-3">
      <legend className={srLegend ? "sr-only" : legendClass}>Soft skills</legend>
      <div className="flex flex-wrap gap-2">
        {SOFT_SKILLS.map((ss) => (
          <Chip key={ss} label={ss} selected={selected.has(ss)} onClick={() => toggle(ss)} />
        ))}
      </div>
      <div>
        <label className={labelClass} htmlFor="softSkillsCustom">Autres (séparées par des virgules)</label>
        <input id="softSkillsCustom" {...register("softSkillsCustom")} className={inputClass} placeholder="Communication interculturelle, Prise de parole…" />
      </div>
    </fieldset>
  );
}

export function KeySkillsFieldset({ srLegend = false }: { srLegend?: boolean }) {
  const { register } = useFormContext<FormValues>();
  return (
    <fieldset className="space-y-3">
      <legend className={srLegend ? "sr-only" : legendClass}>Compétences clés (jusqu’à 3)</legend>
      <p className={hintClass}>Une compétence dont tu es fier·e, avec un dépôt ou une ressource qui la prouve.</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-lg border-2 border-slate-800 dark:border-slate-300 p-2">
          <div>
            <label className={labelClass} htmlFor={`ks-name-${i}`}>Compétence {i + 1}</label>
            <input id={`ks-name-${i}`} {...register(`keySkills.${i}.name` as const)} className={inputClass} placeholder="Accessibilité (RGAA)" />
          </div>
          <div>
            <label className={labelClass} htmlFor={`ks-repo-${i}`}>Dépôt (URL)</label>
            <input id={`ks-repo-${i}`} {...register(`keySkills.${i}.repo` as const)} className={inputClass} placeholder="https://github.com/…" />
          </div>
          <div>
            <label className={labelClass} htmlFor={`ks-link-${i}`}>Ressource (URL)</label>
            <input id={`ks-link-${i}`} {...register(`keySkills.${i}.link` as const)} className={inputClass} placeholder="https://…" />
          </div>
        </div>
      ))}
    </fieldset>
  );
}
