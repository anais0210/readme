"use client";

import { useFormContext } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { SECTION_KEYS, type FormValues } from "@/lib/config";
import { PRESETS } from "@/lib/presets";
import { IdentityFieldset } from "@/components/form/IdentityFieldset";
import { LinksFieldset } from "@/components/form/ContentFieldsets";
import { hintClass, legendClass } from "@/components/form/ui";

type Props = {
  announce: (message: string) => void;
};

function PresetCards({ announce }: Props) {
  const { setValue } = useFormContext<FormValues>();

  function apply(id: string) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const opts = { shouldDirty: true };
    setValue("bio", preset.values.bio, opts);
    setValue("badgesPreset", preset.values.badgesPreset, opts);
    setValue("softSkillsPreset", preset.values.softSkillsPreset, opts);
    setValue("style", preset.values.style, opts);
    for (const key of SECTION_KEYS) setValue(`sections.${key}`, preset.values.sections[key] ?? false, opts);
    announce(`Modèle « ${preset.label} » appliqué. Votre identité et vos liens sont conservés.`);
  }

  return (
    <fieldset className="space-y-2">
      <legend className={legendClass}>Partir d’un modèle <span className="text-sm font-normal text-slate-600 dark:text-slate-400">(facultatif)</span></legend>
      <p className={hintClass}>Pré-remplit la bio, les compétences, le style et les blocs. Vous pourrez tout modifier ensuite.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => apply(p.id)}
            className="flex flex-col items-start gap-1 rounded-lg border border-slate-300 dark:border-slate-700 p-3 text-left hover:border-sky-700 hover:bg-sky-50 dark:hover:border-sky-400 dark:hover:bg-sky-950/30"
          >
            <span className="inline-flex items-center gap-1 text-sm font-medium">
              <Sparkles size={14} aria-hidden /> {p.label}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">{p.description}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ProfileStep({ announce }: Props) {
  return (
    <div className="space-y-8">
      <IdentityFieldset announce={announce} />
      <LinksFieldset />
      <PresetCards announce={announce} />
    </div>
  );
}
