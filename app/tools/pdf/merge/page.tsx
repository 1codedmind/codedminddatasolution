"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Files, X, Download, Loader2, RotateCcw,
  GripVertical, Plus,
} from "lucide-react";
import { FileDropZone } from "@/components/pdf/FileDropZone";
import { ToolShell } from "@/components/pdf/ToolShell";
import { mergeOrderedProcessor } from "@/lib/pdf/processors/merge";
import { renderPageToDataURL, getPDFPageCountPdfjs } from "@/lib/pdf/renderPage";

function uid() { return Math.random().toString(36).slice(2, 9); }
function fmtBytes(b: number) {
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

interface PageItem {
  id: string;
  file: File;
  pageIndex: number;   // 0-based
  pageLabel: string;   // "MyFile.pdf · p1"
  thumbnail?: string;  // data URL, loaded async
  loading: boolean;
}

export default function MergePDFPage() {
  const [pages, setPages]       = useState<PageItem[]>([]);
  const [status, setStatus]     = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult]     = useState<{ blob: Blob; filename: string; originalBytes: number; resultBytes: number } | null>(null);
  const [errMsg, setErrMsg]     = useState<string | null>(null);

  // Drag state
  const [dragId, setDragId]       = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const downloadRef = useRef<HTMLAnchorElement>(null);
  const renderQueue = useRef<PageItem[]>([]);
  const rendering   = useRef(false);

  // Progressive thumbnail rendering — runs 1 at a time off a queue
  const drainRenderQueue = useCallback(async () => {
    if (rendering.current) return;
    rendering.current = true;
    while (renderQueue.current.length > 0) {
      const item = renderQueue.current.shift()!;
      try {
        const thumb = await renderPageToDataURL(item.file, item.pageIndex, 160);
        setPages((prev) =>
          prev.map((p) => p.id === item.id ? { ...p, thumbnail: thumb, loading: false } : p)
        );
      } catch {
        setPages((prev) =>
          prev.map((p) => p.id === item.id ? { ...p, loading: false } : p)
        );
      }
    }
    rendering.current = false;
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const newPages: PageItem[] = [];

    for (const file of files) {
      let count = 0;
      try { count = await getPDFPageCountPdfjs(file); } catch { count = 1; }

      for (let i = 0; i < count; i++) {
        const item: PageItem = {
          id: uid(),
          file,
          pageIndex: i,
          pageLabel: `${file.name.replace(/\.pdf$/i, "")} · p${i + 1}`,
          loading: true,
        };
        newPages.push(item);
        renderQueue.current.push(item);
      }
    }

    setPages((prev) => [...prev, ...newPages]);
    setStatus("idle");
    setResult(null);
    setErrMsg(null);
    drainRenderQueue();
  }, [drainRenderQueue]);

  // Clean up object URLs on unmount
  useEffect(() => () => { renderQueue.current = []; }, []);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onDragStart = (id: string) => setDragId(id);
  const onDragOver  = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const onDragEnd   = () => { setDragId(null); setDragOverId(null); };
  const onDrop      = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { onDragEnd(); return; }
    setPages((prev) => {
      const arr = [...prev];
      const from = arr.findIndex((p) => p.id === dragId);
      const to   = arr.findIndex((p) => p.id === targetId);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    onDragEnd();
  };

  const removePage = (id: string) => setPages((p) => p.filter((x) => x.id !== id));
  const reset = () => { setPages([]); setStatus("idle"); setResult(null); setErrMsg(null); setProgress(0); renderQueue.current = []; };

  // ── Merge ──────────────────────────────────────────────────────────────────
  const merge = async () => {
    if (pages.length < 2) return;
    setStatus("processing");
    setProgress(0);
    setErrMsg(null);
    try {
      const order = pages.map(({ file, pageIndex }) => ({ file, pageIndex }));
      const res = await mergeOrderedProcessor(order, (pct) => setProgress(pct));
      setResult(res);
      setStatus("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Merge failed. Please check your files.");
      setStatus("error");
    }
  };

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = downloadRef.current!;
    a.href = url; a.download = result.filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const loadedCount = pages.filter((p) => !p.loading).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ToolShell
      title="Merge PDF"
      description="Combine PDF files into one. Drag pages to reorder them before merging."
      icon={<Files size={22} />}
    >
      <a ref={downloadRef} className="hidden" aria-hidden />

      {/* Drop zone */}
      {status !== "done" && (
        <FileDropZone
          accept=".pdf,application/pdf"
          multiple
          maxFiles={20}
          maxSizeMB={50}
          onFiles={addFiles}
          label={pages.length > 0 ? "Drop more PDFs to add their pages" : "Drop PDF files here or click to browse"}
          sublabel="Up to 20 files · Max 50 MB each · PDF only"
        />
      )}

      {/* Page grid */}
      {pages.length > 0 && status !== "done" && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-stone-700">
                {pages.length} page{pages.length !== 1 ? "s" : ""}
                {loadedCount < pages.length && (
                  <span className="ml-2 text-xs font-normal text-stone-400">
                    Loading thumbnails {loadedCount}/{pages.length}…
                  </span>
                )}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">Drag pages to reorder · click × to remove</p>
            </div>
            <button onClick={reset} className="text-xs text-stone-400 hover:text-stone-700 transition flex items-center gap-1">
              <RotateCcw size={11} /> Clear all
            </button>
          </div>

          {/* Thumbnail grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {pages.map((page) => {
              const isDragging  = dragId === page.id;
              const isDragOver  = dragOverId === page.id && dragId !== page.id;

              return (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => onDragStart(page.id)}
                  onDragOver={(e) => onDragOver(e, page.id)}
                  onDragEnd={onDragEnd}
                  onDrop={(e) => onDrop(e, page.id)}
                  className={[
                    "relative group rounded-xl border overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-150 select-none",
                    isDragging  ? "opacity-30 scale-95 border-rose-400 ring-2 ring-rose-300" : "border-stone-200",
                    isDragOver  ? "border-rose-400 ring-2 ring-rose-300 scale-[1.03]" : "",
                    !isDragging && !isDragOver ? "hover:border-stone-300 hover:shadow-sm" : "",
                  ].join(" ")}
                >
                  {/* Thumbnail or skeleton */}
                  <div className="aspect-[3/4] bg-stone-100 w-full flex items-center justify-center overflow-hidden">
                    {page.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={page.thumbnail}
                        alt={page.pageLabel}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <Loader2 size={16} className="animate-spin text-stone-300" />
                        <span className="text-[9px] text-stone-300">Loading</span>
                      </div>
                    )}
                  </div>

                  {/* Drag handle overlay */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition">
                    <div className="bg-black/40 rounded-md p-0.5">
                      <GripVertical size={10} className="text-white" />
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                  >
                    <X size={9} />
                  </button>

                  {/* Page label */}
                  <div className="bg-white border-t border-stone-100 px-1.5 py-1">
                    <p className="text-[9px] text-stone-500 truncate leading-tight">{page.pageLabel}</p>
                  </div>
                </div>
              );
            })}

            {/* Add more pages button */}
            <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition text-stone-300 hover:text-rose-400">
              <Plus size={20} />
              <span className="text-[9px] mt-1 font-medium">Add more</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
              />
            </label>
          </div>

          {/* Merge button */}
          <div className="mt-6">
            {status === "processing" ? (
              <div className="space-y-2">
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                  <Loader2 size={14} className="animate-spin" />
                  Merging {pages.length} pages…
                </div>
              </div>
            ) : (
              <button
                onClick={merge}
                disabled={pages.length < 2}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pages.length < 2 ? "Add at least 2 pages to merge" : `Merge ${pages.length} page${pages.length !== 1 ? "s" : ""} into 1 PDF`}
              </button>
            )}
            {errMsg && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errMsg}</p>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {status === "done" && result && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Files size={24} className="text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-stone-900 mb-1">Merge complete!</p>
          <p className="text-sm text-stone-500 mb-1">{pages.length} pages merged</p>
          <p className="text-xs text-stone-400 mb-6">
            {fmtBytes(result.originalBytes)} → {fmtBytes(result.resultBytes)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={download}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition"
            >
              <Download size={15} /> Download {result.filename}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-semibold text-sm transition"
            >
              <RotateCcw size={14} /> Merge more files
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
