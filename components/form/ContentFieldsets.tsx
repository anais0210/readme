"use client";

import { useFormContext } from "react-hook-form";
import type { FormValues } from "@/lib/config";
import { inputClass, labelClass, legendClass } from "./ui";

export function LinksFieldset({ srLegend = false }: { srLegend?: boolean }) {
  const { register } = useFormContext<FormValues>();
  return (
    <fieldset className="space-y-3">
      <legend className={srLegend ? "sr-only" : legendClass}>Liens</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="lgh">GitHub (URL profil)</label>
          <input id="lgh" type="url" {...register("links.github")} className={inputClass} placeholder="https://github.com/mon-compte" />
        </div>
        <div>
          <label className={labelClass} htmlFor="lli">LinkedIn</label>
          <input id="lli" type="url" {...register("links.linkedin")} className={inputClass} placeholder="https://www.linkedin.com/in/xxx" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="lws">Site / Portfolio</label>
          <input id="lws" type="url" {...register("links.website")} className={inputClass} placeholder="https://mon-site.dev" />
        </div>
      </div>
    </fieldset>
  );
}
