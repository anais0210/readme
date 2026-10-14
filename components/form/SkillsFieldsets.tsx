"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { BADGE_CATEGORIES, BADGE_DEFS, SOFT_SKILLS } from "@/lib/badges";
import type { FormValues } from "@/lib/config";
import { chipClass, hintClass, inputClass, labelClass, legendClass } from "./ui";

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

export function BadgesFieldset() {
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
      <legend className={legendClass}>Compétences techniques</legend>
      <div role="radiogroup" aria-label="Affichage des technos" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DISPLAY_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer flex-col gap-2 rounded-md border border-slate-300 dark:border-slate-700 p-3 has-[:checked]:border-sky-700 has-[:checked]:ring-2 has-[:checked]:ring-sky-700/30 dark:has-[:checked]:border-sky-400"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <input type="radio" value={opt.value} {...register("skillsDisplay")} />
              {opt.label}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={opt.example} alt="" className="h-6 self-start" />
            <span className={hintClass}>{opt.hint}</span>
          </label>
        ))}
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {categories.map(([category, items]) => {
          const count = items.filter((k) => selected.has(k)).length;
          return (
            <details key={category} open={!!q} className="rounded-md border border-slate-300 dark:border-slate-700">
              <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
                {category}
                {count ? <span className="ml-1 text-slate-600 dark:text-slate-400">({count})</span> : null}
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
          <p className="text-sm">Aucune techno trouvée : ajoutez-la ci-dessous.</p>
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

export function SoftSkillsFieldset() {
  const { register } = useFormContext<FormValues>();
  const { selected, toggle } = useToggleArray("softSkillsPreset");
  return (
    <fieldset className="space-y-3">
      <legend className={legendClass}>Soft skills</legend>
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

export function KeySkillsFieldset() {
  const { register } = useFormContext<FormValues>();
  return (
    <fieldset className="space-y-3">
      <legend className={legendClass}>Compétences clés (jusqu’à 3)</legend>
      <p className={hintClass}>Une compétence dont vous êtes fier·e, avec un dépôt ou une ressource qui la prouve.</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-md border border-slate-200 dark:border-slate-800 p-2">
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
