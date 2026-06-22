"use client";

import { useState, useCallback, useRef } from "react";
import { Files, X, ChevronUp, ChevronDown, Download, Loader2, RotateCcw, FileText } from "lucide-react";
import { FileDropZone } from "@/components/pdf/FileDropZone";
import { ToolShell } from "@/components/pdf/ToolShell";
import { mergeProcessor, getPDFPageCount } from "@/lib/pdf/processors/merge";
import type { FileItem } from "@/lib/pdf/types";

function uid() { return Math.random().toString(36).slice(2); }

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

export default function MergePDFPage() {
  const [items, setItems]       = useState<FileItem[]>([]);
  const [status, setStatus]     = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult]     = useState<{ blob: Blob; filename: string; originalBytes: number; resultBytes: number } | null>(null);
  const [errMsg, setErrMsg]     = useState<string | null>(null);
  const downloadRef             = useRef<HTMLAnchorElement>(null);

  const addFiles = useCallback(async (files: File[]) => {
    const newItems: FileItem[] = files.map((file) => ({ id: uid(), file }));
    // Load page counts in background
    newItems.forEach(async (item) => {
      const count = await getPDFPageCount(item.file);
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, pageCount: count } : i));
    });
    setItems((prev) => [...prev, ...newItems]);
    setStatus("idle");
    setResult(null);
  }, []);

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setItems((p) => { const a = [...p]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  };
  const moveDown = (idx: number) => {
    setItems((p) => { if (idx === p.length - 1) return p; const a = [...p]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a; });
  };

  const merge = async () => {
    if (items.length < 2) return;
    setStatus("processing");
    setProgress(0);
    setErrMsg(null);
    try {
      const files = items.map((i) => i.file);
      const res = await mergeProcessor.process(files, {}, (pct) => setProgress(pct));
      setResult(res);
      setStatus("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Merge failed. Please check the files and try again.");
      setStatus("error");
    }
  };

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = downloadRef.current!;
    a.href = url;
    a.download = result.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const reset = () => { setItems([]); setStatus("idle"); setResult(null); setErrMsg(null); setProgress(0); };

  const totalPages = items.reduce((s, i) => s + (i.pageCount ?? 0), 0);

  return (
    <ToolShell
      title="Merge PDF"
      description="Combine multiple PDF files into one. Drag files in, reorder them, then download the merged result."
      icon={<Files size={22} />}
    >
      <a ref={downloadRef} className="hidden" aria-hidden />

      {/* ── Drop zone (only show when not done) ── */}
      {status !== "done" && (
        <FileDropZone
          accept=".pdf,application/pdf"
          multiple
          maxFiles={20}
          maxSizeMB={50}
          onFiles={addFiles}
          label={items.length > 0 ? "Drop more PDFs to add them" : "Drop PDF files here or click to browse"}
          sublabel="Up to 20 files · Max 50 MB each · PDF only"
        />
      )}

      {/* ── File list ── */}
      {items.length > 0 && status !== "done" && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-stone-700">
              {items.length} file{items.length !== 1 ? "s" : ""}
              {totalPages > 0 && <span className="font-normal text-stone-400 ml-2">· {totalPages} pages total</span>}
            </p>
            <button onClick={reset} className="text-xs text-stone-400 hover:text-stone-700 transition flex items-center gap-1">
              <RotateCcw size={11} /> Clear all
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3 group hover:border-stone-300 transition"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-stone-300 hover:text-stone-600 disabled:opacity-20 transition">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1} className="text-stone-300 hover:text-stone-600 disabled:opacity-20 transition">
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Index badge */}
              <span className="text-xs font-bold text-stone-400 w-5 text-center shrink-0">{idx + 1}</span>

              {/* File icon */}
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-rose-400" />
              </div>

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{item.file.name}</p>
                <p className="text-xs text-stone-400">
                  {fmtBytes(item.file.size)}
                  {item.pageCount !== undefined && item.pageCount > 0 && (
                    <span className="ml-2">{item.pageCount} page{item.pageCount !== 1 ? "s" : ""}</span>
                  )}
                </p>
              </div>

              {/* Remove */}
              <button onClick={() => remove(item.id)} className="text-stone-300 hover:text-red-400 transition shrink-0 p-1">
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Merge button */}
          <div className="pt-3">
            {status === "processing" ? (
              <div className="space-y-2">
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                  <Loader2 size={14} className="animate-spin" />
                  Merging {items.length} files…
                </div>
              </div>
            ) : (
              <button
                onClick={merge}
                disabled={items.length < 2}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {items.length < 2 ? "Add at least 2 PDFs to merge" : `Merge ${items.length} PDFs`}
              </button>
            )}
            {errMsg && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {errMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {status === "done" && result && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-stone-900 mb-1">Merge complete!</p>
          <p className="text-sm text-stone-500 mb-1">
            {items.length} files · {totalPages} pages
          </p>
          <p className="text-xs text-stone-400 mb-6">
            {fmtBytes(result.originalBytes)} → {fmtBytes(result.resultBytes)}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={download}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition"
            >
              <Download size={15} />
              Download {result.filename}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-semibold text-sm transition"
            >
              <RotateCcw size={14} />
              Merge more files
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
