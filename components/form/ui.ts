// Contraste renforcé : bordures 2px quasi noires / quasi blanches (≥ 3:1, WCAG 1.4.11),
// textes d'aide foncés, un seul bouton plein par écran.

export const inputClass =
  "w-full rounded-lg border-2 border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-950 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400";

export const labelClass = "block text-base font-semibold mb-1.5 text-slate-950 dark:text-slate-50";

export const hintClass = "mt-1.5 text-sm text-slate-700 dark:text-slate-300";

export const legendClass = "text-lg font-semibold text-slate-950 dark:text-slate-50";

export const optionClass = "bg-white text-black dark:bg-black dark:text-white";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-900 dark:border-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 dark:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-950 bg-slate-950 px-5 py-2.5 text-base font-semibold text-white hover:bg-slate-800 dark:border-slate-50 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200";

/** Action discrète : lien souligné. */
export const linkButtonClass =
  "text-base font-medium text-slate-950 underline underline-offset-4 hover:no-underline dark:text-slate-50";

export function chipClass(selected: boolean) {
  return `inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-medium ${
    selected
      ? "border-slate-950 bg-slate-950 text-white dark:border-slate-50 dark:bg-slate-50 dark:text-slate-950"
      : "border-slate-800 text-slate-950 hover:bg-slate-100 dark:border-slate-300 dark:text-slate-50 dark:hover:bg-slate-800"
  }`;
}

/** Grande carte de choix (radio / case à cocher). L'état coché est porté par la bordure ET une coche. */
export const choiceCardClass =
  "group flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-800 p-4 text-left text-slate-950 hover:bg-slate-50 has-[:checked]:border-[3px] has-[:checked]:bg-slate-100 dark:border-slate-300 dark:text-slate-50 dark:hover:bg-slate-900 dark:has-[:checked]:bg-slate-800";

export const cardClass = "rounded-xl border-2 border-slate-800 dark:border-slate-300 p-4";
