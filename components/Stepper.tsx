"use client";

import { Check } from "lucide-react";

export type StepInfo = {
  title: string;
  description: string;
  /** Message affiché quand un champ obligatoire de l'étape manque. */
  warning?: string;
};

type Props = {
  steps: StepInfo[];
  current: number;
  onSelect: (index: number) => void;
};

export function Stepper({ steps, current, onSelect }: Props) {
  return (
    <nav aria-label="Étapes">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((step, i) => {
          const isCurrent = i === current;
          const isDone = i < current && !step.warning;
          return (
            <li key={step.title}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex w-full items-start gap-2 rounded-lg border p-2 text-left ${
                  isCurrent
                    ? "border-sky-700 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/40"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isCurrent
                      ? "bg-sky-800 text-white dark:bg-sky-300 dark:text-slate-900"
                      : isDone
                        ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
                        : "border border-slate-400 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {isDone ? <Check size={14} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    <span className="sr-only">Étape {i + 1} : </span>
                    {step.title}
                    {isDone ? <span className="sr-only"> (vue)</span> : null}
                  </span>
                  <span className="block text-xs text-slate-600 dark:text-slate-400">
                    {step.warning ? <span className="text-amber-800 dark:text-amber-300">⚠ {step.warning}</span> : step.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
