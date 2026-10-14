"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, FileCheck2 } from "lucide-react";
import type { FormValues } from "@/lib/config";
import { hintClass, linkButtonClass, primaryButtonClass } from "@/components/form/ui";
import { QUESTIONS, type QuestionContext } from "./questions";
import { Recap } from "./Recap";

export type ImportSummary = {
  source: "config" | "analyse";
  recovered: string[];
  hasManualEdits: boolean;
};

type Props = QuestionContext & {
  /** Change à chaque import : le parcours saute alors au récapitulatif. */
  importSummary: (ImportSummary & { at: number }) | null;
  onDismissImport: () => void;
  /** Proposé quand le README importé contenait des retouches manuelles. */
  onKeepManual: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onShare: () => void;
};

const RECAP = "recap";

export function Wizard({ announce, importSummary, onDismissImport, onKeepManual, onCopy, onDownload, onShare }: Props) {
  const { watch, setError, clearErrors, formState: { errors } } = useFormContext<FormValues>();
  const values = watch();
  const visible = QUESTIONS.filter((q) => !q.show || q.show(values));
  const [currentId, setCurrentId] = useState<string>(QUESTIONS[0].id);
  const [fromRecap, setFromRecap] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const index = visible.findIndex((q) => q.id === currentId);
  const question = index >= 0 ? visible[index] : null;
  const isRecap = currentId === RECAP || !question;

  // Focus sur le titre à chaque changement d'écran (clavier et lecteurs d'écran)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "nearest" });
  }, [currentId]);

  // Après un import : direction le récapitulatif
  useEffect(() => {
    if (importSummary) {
      setFromRecap(false);
      setCurrentId(RECAP);
    }
  }, [importSummary]);

  function goTo(id: string) {
    clearErrors();
    setCurrentId(id);
  }

  function next(e?: FormEvent) {
    e?.preventDefault();
    if (question?.validate) {
      const error = question.validate(values);
      if (error) {
        setError(question.id as "username", { message: error });
        // Ramène le focus dans le champ à corriger
        requestAnimationFrame(() => document.getElementById(question.id)?.focus());
        return;
      }
    }
    if (fromRecap) {
      setFromRecap(false);
      goTo(RECAP);
      return;
    }
    goTo(visible[index + 1]?.id ?? RECAP);
  }

  function previous() {
    if (isRecap) goTo(visible[visible.length - 1].id);
    else if (index > 0) goTo(visible[index - 1].id);
  }

  function edit(id: string) {
    setFromRecap(true);
    goTo(id);
  }

  const progress = isRecap ? 100 : Math.round((index / visible.length) * 100);
  const error = question ? errors[question.id as keyof FormValues]?.message : undefined;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-800 dark:text-slate-200">
          <span>{isRecap ? "Terminé" : `Question ${index + 1} sur ${visible.length}`}</span>
          {!isRecap ? (
            <button type="button" onClick={() => goTo(RECAP)} className="underline underline-offset-4">
              Aller au récapitulatif
            </button>
          ) : null}
        </div>
        <div
          role="progressbar"
          aria-label="Progression"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 overflow-hidden rounded-full border-2 border-slate-800 dark:border-slate-300"
        >
          <div className="h-full bg-slate-950 transition-[width] dark:bg-slate-50" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {isRecap ? (
        <div className="space-y-6">
          <h2 ref={heading} tabIndex={-1} className="text-3xl font-bold text-slate-950 focus:outline-none dark:text-slate-50">
            {importSummary ? "Ton README est importé" : "Ton README est prêt 🎉"}
          </h2>

          {importSummary ? (
            <section
              aria-labelledby="import-result-title"
              className="space-y-3 rounded-xl border-[3px] border-emerald-800 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-300 dark:bg-emerald-950 dark:text-emerald-50"
            >
              <h3 id="import-result-title" className="flex items-center gap-2 text-lg font-semibold">
                <FileCheck2 size={22} aria-hidden />
                {importSummary.source === "config"
                  ? "Toutes tes réponses ont été restaurées"
                  : `${importSummary.recovered.length} élément${importSummary.recovered.length > 1 ? "s" : ""} retrouvé${importSummary.recovered.length > 1 ? "s" : ""}`}
              </h3>
              {importSummary.source === "analyse" ? (
                <>
                  <ul className="flex flex-wrap gap-2">
                    {importSummary.recovered.map((item) => (
                      <li key={item} className="inline-flex items-center gap-1 rounded-full border-2 border-current px-3 py-1 text-sm font-medium">
                        <Check size={14} aria-hidden /> {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-base">
                    Ce README n’a pas été créé ici : vérifie tes réponses ci-dessous. Ce qui n’a pas été reconnu n’apparaît plus dans l’aperçu.
                  </p>
                </>
              ) : (
                <p className="text-base">
                  {importSummary.hasManualEdits
                    ? "Attention : ce README contenait des retouches faites à la main, elles ne sont pas reprises."
                    : "Le README est identique à celui que tu avais généré. Modifie ce que tu veux ci-dessous."}
                </p>
              )}
              {importSummary.hasManualEdits ? (
                <button type="button" onClick={onKeepManual} className={primaryButtonClass}>
                  Garder ma version retouchée
                </button>
              ) : null}
              <button type="button" onClick={onDismissImport} className="text-sm font-medium underline underline-offset-4">
                Masquer ce message
              </button>
            </section>
          ) : null}

          <Recap questions={visible} onEdit={edit} onCopy={onCopy} onDownload={onDownload} onShare={onShare} />

          <div className="border-t-2 border-slate-200 pt-4 dark:border-slate-700">
            <button type="button" onClick={previous} className={`${linkButtonClass} inline-flex items-center gap-1.5`}>
              <ArrowLeft size={16} aria-hidden /> Question précédente
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={next} noValidate className="space-y-6" aria-labelledby="question-title">
          <div className="space-y-2">
            <h2 id="question-title" ref={heading} tabIndex={-1} className="text-3xl font-bold leading-tight text-slate-950 focus:outline-none dark:text-slate-50">
              {question!.title}
            </h2>
            {question!.help ? (
              <p id="question-help" className="text-lg text-slate-700 dark:text-slate-300">{question!.help}</p>
            ) : null}
          </div>

          {question!.render({ announce })}

          {error ? (
            <p id={`${question!.id}-error`} role="alert" className="rounded-lg border-2 border-red-700 bg-red-50 px-3 py-2 text-base font-medium text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-200">
              ⚠ {String(error)}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-200 pt-5 dark:border-slate-700">
            <div className="flex items-center gap-5">
              {index > 0 ? (
                <button type="button" onClick={previous} className={`${linkButtonClass} inline-flex items-center gap-1.5`}>
                  <ArrowLeft size={16} aria-hidden /> Précédent
                </button>
              ) : null}
              {!question!.required && !fromRecap ? (
                <button type="button" onClick={() => goTo(visible[index + 1]?.id ?? RECAP)} className={linkButtonClass}>
                  Passer
                </button>
              ) : null}
            </div>
            <button type="submit" className={primaryButtonClass}>
              {fromRecap ? "Revenir au récapitulatif" : index === visible.length - 1 ? "Voir mon README" : "Continuer"}
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
          {question!.required ? <p className={hintClass}>Seule cette question est obligatoire.</p> : null}
        </form>
      )}
    </div>
  );
}
