"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Eye, FileUp, Link2, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { OutputPanel } from "@/components/OutputPanel";
import { ImportDialog, type ImportDialogHandle } from "@/components/ImportDialog";
import { Stepper, type StepInfo } from "@/components/Stepper";
import { ProfileStep } from "@/components/steps/ProfileStep";
import { SkillsStep } from "@/components/steps/SkillsStep";
import { BlocksStep } from "@/components/steps/BlocksStep";
import { FinishStep } from "@/components/steps/FinishStep";
import { primaryButtonClass, secondaryButtonClass } from "@/components/form/ui";
import { DEFAULT_VALUES, decodeConfig, encodeConfig, normalizeValues, type FormValues } from "@/lib/config";
import { parseReadme } from "@/lib/import";
import { generateReadme } from "@/lib/template";

const STORAGE_KEY = "readme-generator:v1";

const THEME_CYCLE = ["light", "dark", "system"] as const;
const THEME_LABELS = { light: "Clair", dark: "Sombre", system: "Système" } as const;

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const methods = useForm<FormValues>({ defaultValues: DEFAULT_VALUES, mode: "onChange" });
  const { watch, reset } = methods;

  const [step, setStep] = useState(0);
  const [manualMarkdown, setManualMarkdown] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState<"markdown" | "link" | null>(null);
  const [keptVersion, setKeptVersion] = useState<string | null>(null);
  const loaded = useRef(false);
  const importDialog = useRef<ImportDialogHandle>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);

  const announce = useCallback((message: string) => {
    // Vide puis remplit pour que le même message soit relu par les lecteurs d'écran
    setStatus("");
    requestAnimationFrame(() => setStatus(message));
  }, []);

  // Chargement : lien de partage (#c=…) en priorité, sinon dernière session
  useEffect(() => {
    setMounted(true);
    const hash = new URLSearchParams(window.location.hash.slice(1)).get("c");
    const fromHash = hash ? decodeConfig(hash) : null;
    if (fromHash) {
      reset(fromHash);
      history.replaceState(null, "", window.location.pathname);
      announce("Configuration chargée depuis le lien de partage.");
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) reset(normalizeValues(JSON.parse(saved)));
      } catch {}
    }
    loaded.current = true;
  }, [reset, announce]);

  const values = watch();
  const generated = useMemo(() => generateReadme(values), [values]);
  const markdown = manualMarkdown ?? generated;

  // Sauvegarde automatique dans le navigateur
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {}
  }, [values]);

  const steps: StepInfo[] = [
    { title: "Profil", description: "Qui êtes-vous ?", warning: values.username ? undefined : "Pseudo GitHub manquant" },
    { title: "Compétences", description: "Technos et qualités" },
    { title: "Blocs", description: "Ce que le README affiche" },
    { title: "Style & export", description: "Finaliser et publier" },
  ];

  function goToStep(index: number) {
    setStep(index);
    // Amène le focus au titre de l'étape pour les lecteurs d'écran et le clavier
    requestAnimationFrame(() => {
      stepHeading.current?.focus();
      stepHeading.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function flashCopied(kind: "markdown" | "link") {
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(markdown);
      flashCopied("markdown");
      announce("Markdown copié dans le presse-papiers.");
    } catch {
      announce("La copie a échoué : ouvrez l’onglet Markdown et copiez le texte manuellement.");
    }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}${window.location.pathname}#c=${encodeConfig(values)}`;
    try {
      await navigator.clipboard.writeText(url);
      flashCopied("link");
      announce("Lien de partage copié : il ouvre l’outil avec ce formulaire pré-rempli.");
    } catch {
      announce("La copie du lien a échoué.");
    }
  }

  function downloadFile() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    announce("README.md téléchargé.");
  }

  function importMarkdown(text: string) {
    if (!text.trim()) {
      announce("Le Markdown est vide : rien à importer.");
      return;
    }
    const result = parseReadme(text);
    reset(result.values);
    setManualMarkdown(null);
    if (result.source === "config") {
      setKeptVersion(result.hasManualEdits ? text : null);
      announce(
        result.hasManualEdits
          ? "Formulaire restauré. Ce README contenait des retouches manuelles qui ne sont pas reprises dans le formulaire."
          : "Formulaire restauré à l’identique ✓"
      );
    } else {
      setKeptVersion(null);
      announce(
        result.recovered.length
          ? `README analysé. Retrouvé : ${result.recovered.join(", ")}. Vérifiez chaque étape, la reconstruction peut être incomplète.`
          : "Rien de reconnaissable dans ce Markdown : le formulaire a été vidé."
      );
    }
    goToStep(0);
  }

  const currentTheme = mounted ? ((theme as keyof typeof THEME_LABELS) ?? "system") : "system";
  const nextTheme = THEME_CYCLE[(THEME_CYCLE.indexOf(currentTheme) + 1) % THEME_CYCLE.length];
  const ThemeIcon = currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;
  const isLast = step === steps.length - 1;

  return (
    <FormProvider {...methods}>
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Générateur de README GitHub</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Composez le README de votre profil en 4 étapes, avec l’aperçu en direct.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => importDialog.current?.open()} className={secondaryButtonClass}>
              <FileUp size={16} aria-hidden /> Importer un README
            </button>
            <button type="button" onClick={copyShareLink} className={secondaryButtonClass}>
              <Link2 size={16} aria-hidden /> {copied === "link" ? "Lien copié" : "Partager"}
            </button>
            <button
              type="button"
              onClick={() => setTheme(nextTheme)}
              aria-label={`Thème : ${THEME_LABELS[currentTheme]}. Passer au thème ${THEME_LABELS[nextTheme]}`}
              className={secondaryButtonClass}
            >
              <ThemeIcon size={16} aria-hidden />
              <span className="hidden sm:inline">{THEME_LABELS[currentTheme]}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <p
          role="status"
          aria-live="polite"
          className={status ? "mb-4 rounded-md border border-sky-700 bg-sky-50 px-3 py-2 text-sm dark:border-sky-400 dark:bg-sky-950/40" : "sr-only"}
        >
          {status}
        </p>
        {keptVersion ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setManualMarkdown(keptVersion);
                setKeptVersion(null);
                announce("Version retouchée conservée.");
              }}
              className={secondaryButtonClass}
            >
              Garder ma version retouchée
            </button>
            <button type="button" onClick={() => setKeptVersion(null)} className="underline">
              Non, utiliser le formulaire
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Stepper steps={steps} current={step} onSelect={goToStep} />
            <a href="#resultat" className={`${secondaryButtonClass} lg:hidden`}>
              <Eye size={16} aria-hidden /> Voir l’aperçu
            </a>

            <form onSubmit={(e) => e.preventDefault()} aria-labelledby="step-title" className="space-y-6">
              <h2 id="step-title" ref={stepHeading} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
                <span className="text-slate-600 dark:text-slate-400">{step + 1}/{steps.length} · </span>
                {steps[step].title}
              </h2>
              {step === 0 ? <ProfileStep announce={announce} /> : null}
              {step === 1 ? <SkillsStep /> : null}
              {step === 2 ? <BlocksStep goToStep={goToStep} /> : null}
              {step === 3 ? <FinishStep onCopy={copyToClipboard} onDownload={downloadFile} onShare={copyShareLink} /> : null}

              <div className="flex justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                {step > 0 ? (
                  <button type="button" onClick={() => goToStep(step - 1)} className={secondaryButtonClass}>
                    <ArrowLeft size={16} aria-hidden /> {steps[step - 1].title}
                  </button>
                ) : (
                  <span />
                )}
                {!isLast ? (
                  <button type="button" onClick={() => goToStep(step + 1)} className={primaryButtonClass}>
                    {steps[step + 1].title} <ArrowRight size={16} aria-hidden />
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div id="resultat" className="scroll-mt-4 lg:sticky lg:top-4 lg:self-start">
            <OutputPanel
              markdown={markdown}
              mounted={mounted}
              isManual={manualMarkdown !== null}
              copied={copied === "markdown"}
              onEdit={setManualMarkdown}
              onImport={importMarkdown}
              onResetToForm={() => {
                setManualMarkdown(null);
                announce("Retouches annulées : retour à la version du formulaire.");
              }}
              onCopy={copyToClipboard}
              onDownload={downloadFile}
            />
          </div>
        </div>
      </main>

      <ImportDialog ref={importDialog} onImport={importMarkdown} />
    </FormProvider>
  );
}
