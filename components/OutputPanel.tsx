"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Check, Code2, Copy, Download, Eye, RotateCcw, Upload } from "lucide-react";
import { Preview } from "./Preview";
import { hintClass, optionClass, primaryButtonClass, secondaryButtonClass } from "./form/ui";

type Tab = "preview" | "markdown";

type Props = {
  markdown: string;
  mounted: boolean;
  isManual: boolean;
  copied: boolean;
  onEdit: (markdown: string) => void;
  onImport: (markdown: string) => void;
  onResetToForm: () => void;
  onCopy: () => void;
  onDownload: () => void;
};

const TABS: { id: Tab; label: string; Icon: typeof Eye }[] = [
  { id: "preview", label: "Aperçu", Icon: Eye },
  { id: "markdown", label: "Markdown", Icon: Code2 },
];

export function OutputPanel({ markdown, mounted, isManual, copied, onEdit, onImport, onResetToForm, onCopy, onDownload }: Props) {
  const [tab, setTab] = useState<Tab>("preview");
  const [cols, setCols] = useState(1);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ preview: null, markdown: null });
  const colsClass = cols === 3 ? "columns-1 sm:columns-2 xl:columns-3 gap-6" : cols === 2 ? "columns-1 md:columns-2 gap-6" : "columns-1";

  // Navigation clavier des onglets (flèches gauche/droite)
  function onTabKey(e: KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next: Tab = tab === "preview" ? "markdown" : "preview";
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section aria-label="Résultat" className="flex flex-col rounded-xl border-2 border-slate-800 dark:border-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-800 dark:border-slate-300 p-2">
        <div role="tablist" aria-label="Affichage du résultat" className="flex gap-1" onKeyDown={onTabKey}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              id={`tab-${id}`}
              role="tab"
              type="button"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                tab === id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} aria-hidden /> {label}
              {id === "markdown" && isManual ? <span className="text-xs">(retouché)</span> : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onCopy} className={secondaryButtonClass}>
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? "Copié" : "Copier"}
          </button>
          <button type="button" onClick={onDownload} className={primaryButtonClass}>
            <Download size={16} aria-hidden /> Télécharger
          </button>
        </div>
      </div>

      {isManual ? (
        <div role="status" className="m-2 space-y-2 rounded-md border border-amber-600 bg-amber-50 p-3 text-sm dark:border-amber-500 dark:bg-amber-950/40">
          <p>
            ✎ <strong>Markdown retouché à la main.</strong> L’aperçu et l’export utilisent ta version ; tes réponses ne s’appliquent plus.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onImport(markdown)} className={primaryButtonClass}>
              <Upload size={16} aria-hidden /> Reprendre dans mes réponses
            </button>
            <button type="button" onClick={onResetToForm} className={secondaryButtonClass}>
              <RotateCcw size={16} aria-hidden /> Annuler mes retouches
            </button>
          </div>
        </div>
      ) : null}

      <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" hidden={tab !== "preview"} className="p-4">
        <div className="mb-2 flex items-center justify-end gap-2 text-sm">
          <label htmlFor="preview-cols">Colonnes</label>
          <select
            id="preview-cols"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="rounded-md border-2 border-slate-800 bg-transparent px-2 py-1 dark:border-slate-300"
          >
            <option className={optionClass} value={1}>1</option>
            <option className={optionClass} value={2}>2</option>
            <option className={optionClass} value={3}>3</option>
          </select>
        </div>
        <div className="max-h-[calc(100vh-14rem)] overflow-auto" style={{ background: "var(--background)", color: "var(--foreground)" }}>
          <div className={colsClass}>{mounted ? <Preview markdown={markdown} /> : null}</div>
        </div>
      </div>

      <div id="panel-markdown" role="tabpanel" aria-labelledby="tab-markdown" hidden={tab !== "markdown"} className="space-y-2 p-4">
        <label htmlFor="raw-markdown" className="text-sm font-medium">Markdown (modifiable)</label>
        <textarea
          id="raw-markdown"
          value={markdown}
          onChange={(e) => onEdit(e.target.value)}
          spellCheck={false}
          aria-describedby="raw-markdown-hint"
          className="h-[calc(100vh-20rem)] min-h-64 w-full rounded-lg border-2 border-slate-800 bg-transparent px-3 py-2 font-mono text-sm dark:border-slate-300"
        />
        <p id="raw-markdown-hint" className={hintClass}>
          Retouche librement le texte. Pour modifier un README existant, utilise plutôt « Importer un README » en haut de page.
        </p>
      </div>
    </section>
  );
}
