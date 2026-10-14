export const inputClass =
  "w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2";

export const labelClass = "block text-sm mb-1";

export const hintClass = "mt-1 text-xs text-slate-600 dark:text-slate-400";

export const legendClass = "text-lg font-medium";

export const optionClass = "bg-white text-black dark:bg-black dark:text-white";

export const secondaryButtonClass =
  "inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50";

export const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-2 text-sm hover:opacity-90";

export function chipClass(selected: boolean) {
  return `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${
    selected
      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
      : "border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
  }`;
}

export const cardClass = "rounded-lg border border-slate-200 dark:border-slate-800 p-4";
