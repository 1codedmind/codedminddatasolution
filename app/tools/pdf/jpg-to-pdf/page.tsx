"use client";

import { useState, useRef } from "react";
import { FileImage, Download, Loader2, RotateCcw, X } from "lucide-react";
import { FileDropZone } from "@/components/pdf/FileDropZone";
import { ToolShell } from "@/components/pdf/ToolShell";
import { jpgToPdfProcessor } from "@/lib/pdf/processors/jpg-to-pdf";
import type { PageSize } from "@/lib/pdf/processors/jpg-to-pdf";

function uid() { return Math.random().toString(36).slice(2); }
function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

interface ImgItem { id: string; file: File; preview: string; }

export default function JpgToPDFPage() {
  const [items, setItems]       = useState<ImgItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [status, setStatus]     = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult]     = useState<{ blob: Blob; filename: string } | null>(null);
  const [errMsg, setErrMsg]     = useState<string | null>(null);
  const linkRef                 = useRef<HTMLAnchorElement>(null);

  const addFiles = (files: File[]) => {
    const newItems: ImgItem[] = files.map((file) => ({
      id: uid(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setItems((p) => [...p, ...newItems]);
    setStatus("idle");
    setResult(null);
  };

  const remove = (id: string) => {
    setItems((p) => {
      const item = p.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return p.filter((i) => i.id !== id);
    });
  };

  const convert = async () => {
    if (items.length === 0) return;
    setStatus("processing");
    setProgress(0);
    setErrMsg(null);
    try {
      const res = await jpgToPdfProcessor(items.map((i) => i.file), { pageSize, margin: 0 }, (pct) => setProgress(pct));
      setResult(res);
      setStatus("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Conversion failed.");
      setStatus("error");
    }
  };

  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = linkRef.current!;
    a.href = url; a.download = result.filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const reset = () => {
    items.forEach((i) => URL.revokeObjectURL(i.preview));
    setItems([]); setStatus("idle"); setResult(null); setErrMsg(null); setProgress(0);
  };

  const SIZE_OPTS: { value: PageSize; label: string; desc: string }[] = [
    { value: "A4",     label: "A4",     desc: "210 × 297 mm" },
    { value: "Letter", label: "Letter", desc: "8.5 × 11 in" },
    { value: "fit",    label: "Fit",    desc: "Match image size" },
  ];

  return (
    <ToolShell
      title="JPG to PDF"
      description="Convert JPG, PNG, or WebP images into a single PDF document. Supports multiple images."
      icon={<FileImage size={22} />}
    >
      <a ref={linkRef} className="hidden" aria-hidden />

      {status !== "done" && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          maxFiles={30}
          maxSizeMB={20}
          onFiles={addFiles}
          label={items.length > 0 ? "Drop more images to add" : "Drop JPG, PNG, or WebP images"}
          sublabel="Up to 30 images · Max 20 MB each"
        />
      )}

      {items.length > 0 && status !== "done" && (
        <div className="mt-6 space-y-5">
          {/* Thumbnail grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {items.map((item) => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => remove(item.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={10} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                  <p className="text-[9px] text-white truncate">{fmtBytes(item.file.size)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Page size */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-stone-700">Page size</p>
            <div className="flex gap-3 flex-wrap">
              {SIZE_OPTS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setPageSize(value)}
                  className={[
                    "px-4 py-2.5 rounded-xl border text-sm transition",
                    pageSize === value
                      ? "border-rose-400 bg-rose-50 text-rose-700 font-semibold"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300",
                  ].join(" ")}
                >
                  {label}
                  <span className="ml-1.5 text-xs font-normal opacity-60">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {status === "processing" ? (
            <div className="space-y-2">
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                <Loader2 size={14} className="animate-spin" /> Converting {items.length} image{items.length !== 1 ? "s" : ""}…
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={convert} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition">
                Convert {items.length} image{items.length !== 1 ? "s" : ""} to PDF
              </button>
              <button onClick={reset} className="px-4 py-3 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-sm transition">
                Clear
              </button>
            </div>
          )}
          {errMsg && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errMsg}</p>}
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <p className="text-xl font-bold text-stone-900 mb-1">Conversion complete!</p>
          <p className="text-sm text-stone-500 mb-6">{items.length} image{items.length !== 1 ? "s" : ""} → {fmtBytes(result.blob.size)}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={download} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition">
              <Download size={15} /> Download PDF
            </button>
            <button onClick={reset} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-semibold text-sm transition">
              <RotateCcw size={14} /> Convert more
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
