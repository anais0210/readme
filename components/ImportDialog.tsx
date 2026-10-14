"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FileUp, Upload, X } from "lucide-react";
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "./form/ui";

export type ImportDialogHandle = { open: () => void };

type Props = {
  onImport: (markdown: string) => void;
};

export const ImportDialog = forwardRef<ImportDialogHandle, Props>(function ImportDialog({ onImport }, ref) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  useImperativeHandle(ref, () => ({
    open: () => {
      setText("");
      dialog.current?.showModal();
    },
  }));

  function submit(markdown: string) {
    if (!markdown.trim()) return;
    onImport(markdown);
    dialog.current?.close();
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    submit(await file.text());
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="import-title"
      className="m-auto w-[min(42rem,calc(100vw-2rem))] rounded-xl border border-slate-300 bg-[var(--background)] p-0 text-[var(--foreground)] shadow-xl backdrop:bg-black/50 dark:border-slate-700"
    >
      <form
        method="dialog"
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit(text);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="import-title" className="text-lg font-semibold">Importer un README</h2>
            <p className={hintClass}>
              Un README créé ici est restauré à l’identique. Un autre README est analysé : nom, bio, technos, liens et widgets sont repris.
            </p>
          </div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Fermer" className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} aria-hidden />
          </button>
        </div>
        <div>
          <label htmlFor="import-text" className={labelClass}>Collez le Markdown</label>
          <textarea
            id="import-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck={false}
            className={`${inputClass} font-mono text-sm`}
            placeholder="# Mon profil…"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <input
              ref={fileInput}
              id="import-file"
              type="file"
              accept=".md,.markdown,text/markdown,text/plain"
              className="sr-only"
              onChange={(e) => importFile(e.target.files?.[0])}
            />
            <button type="button" onClick={() => fileInput.current?.click()} className={secondaryButtonClass}>
              <FileUp size={16} aria-hidden /> Ou ouvrir un fichier .md
            </button>
          </div>
          <button type="submit" disabled={!text.trim()} className={`${primaryButtonClass} disabled:opacity-50`}>
            <Upload size={16} aria-hidden /> Importer
          </button>
        </div>
      </form>
    </dialog>
  );
});
