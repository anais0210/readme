"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Eye, FileUp, Link2, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { OutputPanel } from "@/components/OutputPanel";
import { ImportDialog, type ImportDialogHandle } from "@/components/ImportDialog";
import { Wizard, type ImportSummary } from "@/components/wizard/Wizard";
import { secondaryButtonClass } from "@/components/form/ui";
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

  const [manualMarkdown, setManualMarkdown] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState<"markdown" | "link" | null>(null);
  const [importSummary, setImportSummary] = useState<(ImportSummary & { at: number }) | null>(null);
  const [importedText, setImportedText] = useState<string | null>(null);
  const loaded = useRef(false);
  const importDialog = useRef<ImportDialogHandle>(null);

  const statusTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const announce = useCallback((message: string) => {
    // Vide puis remplit pour que le même message soit relu par les lecteurs d'écran
    setStatus("");
    requestAnimationFrame(() => setStatus(message));
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 8000);
  }, []);

  // Chargement : lien de partage (#c=…) en priorité, sinon dernière session
  useEffect(() => {
    setMounted(true);
    const hash = new URLSearchParams(window.location.hash.slice(1)).get("c");
    const fromHash = hash ? decodeConfig(hash) : null;
    if (fromHash) {
      reset(fromHash);
      history.replaceState(null, "", window.location.pathname);
      announce("Réponses chargées depuis le lien de partage.");
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
      announce("La copie a échoué : ouvre l’onglet Markdown et copie le texte à la main.");
    }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}${window.location.pathname}#c=${encodeConfig(values)}`;
    try {
      await navigator.clipboard.writeText(url);
      flashCopied("link");
      announce("Lien de partage copié : il ouvre l’outil avec tes réponses.");
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
    setImportedText(result.hasManualEdits ? text : null);
    setImportSummary({ source: result.source, recovered: result.recovered, hasManualEdits: result.hasManualEdits, at: Date.now() });
    announce(
      result.source === "config"
        ? "README importé : toutes tes réponses sont restaurées."
        : result.recovered.length
          ? `README importé : ${result.recovered.length} éléments retrouvés.`
          : "README importé, mais rien n’a été reconnu."
    );
  }

  const currentTheme = mounted ? ((theme as keyof typeof THEME_LABELS) ?? "system") : "system";
  const nextTheme = THEME_CYCLE[(THEME_CYCLE.indexOf(currentTheme) + 1) % THEME_CYCLE.length];
  const ThemeIcon = currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;

  return (
    <FormProvider {...methods}>
      <header className="border-b-2 border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="text-xl font-bold text-slate-950 dark:text-slate-50">Générateur de README GitHub</p>
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

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="sr-only">Générateur de README GitHub</h1>
        <p
          role="status"
          aria-live="polite"
          className={status ? "mb-6 rounded-lg border-2 border-sky-800 bg-sky-50 px-4 py-3 text-base font-medium text-sky-950 dark:border-sky-300 dark:bg-sky-950 dark:text-sky-50" : "sr-only"}
        >
          {status}
        </p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <a href="#resultat" className={`${secondaryButtonClass} lg:hidden`}>
              <Eye size={16} aria-hidden /> Voir mon README
            </a>
            <Wizard
              announce={announce}
              importSummary={importSummary}
              onDismissImport={() => setImportSummary(null)}
              onKeepManual={() => {
                if (importedText) setManualMarkdown(importedText);
                setImportedText(null);
                setImportSummary((s) => (s ? { ...s, hasManualEdits: false } : s));
                announce("Ta version retouchée est conservée pour l’aperçu et l’export.");
              }}
              onCopy={copyToClipboard}
              onDownload={downloadFile}
              onShare={copyShareLink}
            />
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
                announce("Retouches annulées : retour à tes réponses.");
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
