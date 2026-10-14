"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Github, Loader2 } from "lucide-react";
import type { FormValues } from "@/lib/config";
import { hintClass, inputClass, labelClass, legendClass, secondaryButtonClass } from "./ui";

type Props = {
  announce: (message: string) => void;
};

export function IdentityFieldset({ announce }: Props) {
  const { register, getValues, setValue, formState: { errors } } = useFormContext<FormValues>();
  const [loading, setLoading] = useState(false);

  async function prefillFromGitHub() {
    const username = getValues("username").trim();
    if (!username) {
      announce("Renseignez d’abord votre nom d’utilisateurice GitHub.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      if (res.status === 404) {
        announce(`Aucun compte GitHub « ${username} » trouvé.`);
        return;
      }
      if (!res.ok) {
        announce("GitHub ne répond pas (limite de requêtes atteinte ?). Réessayez dans quelques minutes.");
        return;
      }
      const user: { name?: string | null; bio?: string | null; blog?: string | null; html_url: string } = await res.json();
      const opts = { shouldDirty: true, shouldTouch: true };
      const filled: string[] = [];
      const name = user.name?.trim();
      const bio = user.bio?.trim();
      const blog = user.blog?.trim();
      if (name) { setValue("name", name, opts); filled.push("nom"); }
      if (bio) { setValue("bio", bio, opts); filled.push("bio"); }
      if (blog) {
        setValue("links.website", /^https?:\/\//.test(blog) ? blog : `https://${blog}`, opts);
        filled.push("site");
      }
      setValue("links.github", user.html_url, opts);
      filled.push("lien GitHub");
      announce(`Rempli depuis GitHub : ${filled.join(", ")}.`);
    } catch {
      announce("Impossible de contacter GitHub. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <fieldset className="space-y-3">
      <legend className={legendClass}>Identité</legend>
      <div>
        <label className={labelClass} htmlFor="name">Prénom / Pseudo</label>
        <input id="name" {...register("name")} className={inputClass} placeholder="Ada Lovelace" />
      </div>
      <div>
        <label className={labelClass} htmlFor="username">Nom d’utilisateurice GitHub (obligatoire)</label>
        <div className="flex gap-2">
          <input
            id="username"
            {...register("username", { required: "Nom d’utilisateurice GitHub obligatoire" })}
            aria-required="true"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "username-error username-hint" : "username-hint"}
            className={`${inputClass} ${errors.username ? "border-red-600 dark:border-red-400" : ""}`}
            placeholder="octocat"
            autoComplete="username"
          />
          <button type="button" onClick={prefillFromGitHub} disabled={loading} className={`${secondaryButtonClass} shrink-0`}>
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Github size={16} aria-hidden />}
            Remplir depuis GitHub
          </button>
        </div>
        <p id="username-hint" className={hintClass}>Le bouton récupère votre nom, bio et site depuis votre profil public.</p>
        {errors.username ? (
          <p id="username-error" role="alert" className="mt-1 text-sm text-red-700 dark:text-red-400">
            ⚠ {errors.username.message?.toString() || "Champ obligatoire"}
          </p>
        ) : null}
      </div>
      <div>
        <label className={labelClass} htmlFor="bio">Bio</label>
        <textarea id="bio" {...register("bio")} rows={3} className={inputClass} />
      </div>
    </fieldset>
  );
}
