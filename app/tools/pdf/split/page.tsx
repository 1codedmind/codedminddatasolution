"use client";

import { useState, useRef } from "react";
import { Scissors, Download, Loader2, RotateCcw, FileText, Package } from "lucide-react";
import { FileDropZone } from "@/components/pdf/FileDropZone";
import { ToolShell } from "@/components/pdf/ToolShell";
import { splitProcessor } from "@/lib/pdf/processors/split";

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

type Mode = "all" | "range";

export default function SplitPDFPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [mode, setMode]         = useState<Mode>("all");
  const [ranges, setRanges]     = useState("");
  const [status, setStatus]     = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults]   = useState<Array<{ blob: Blob; filename: string }>>([]);
  const [errMsg, setErrMsg]     = useState<string | null>(null);
  const linkRef                 = useRef<HTMLAnchorElement>(null);

  const handleFiles = (files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
    setResults([]);
    setErrMsg(null);
  };

  const split = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(0);
    setErrMsg(null);
    try {
      const res = await splitProcessor(file, { mode, ranges }, (pct) => setProgress(pct));
      setResults(res.files);
      setStatus("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Split failed. Please check the file and try again.");
      setStatus("error");
    }
  };

  const downloadAll = async () => {
    if (results.length === 1) {
      const url = URL.createObjectURL(results[0].blob);
      const a = linkRef.current!;
      a.href = url;
      a.download = results[0].filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
    // Download each file sequentially with small delay
    for (const r of results) {
      const url = URL.createObjectURL(r.blob);
      const a = linkRef.current!;
      a.href = url;
      a.download = r.filename;
      a.click();
      await new Promise((res) => setTimeout(res, 300));
      URL.revokeObjectURL(url);
    }
  };

  const reset = () => { setFile(null); setStatus("idle"); setResults([]); setErrMsg(null); setProgress(0); };

  return (
    <ToolShell
      title="Split PDF"
      description="Extract individual pages or custom page ranges from a PDF file."
      icon={<Scissors size={22} />}
    >
      <a ref={linkRef} className="hidden" aria-hidden />

      {!file && (
        <FileDropZone
          accept=".pdf,application/pdf"
          multiple={false}
          maxSizeMB={100}
          onFiles={handleFiles}
          label="Drop a PDF to split"
          sublabel="Single file · Max 100 MB · PDF only"
        />
      )}

      {file && status !== "done" && (
        <div className="mt-6 space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
              <FileText size={14} className="text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{file.name}</p>
              <p className="text-xs text-stone-400">{fmtBytes(file.size)}</p>
            </div>
            <button onClick={reset} className="text-xs text-stone-400 hover:text-stone-700 transition">
              Change
            </button>
          </div>

          {/* Mode selector */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-stone-700">Split mode</p>
            <div className="grid grid-cols-2 gap-3">
              {(["all", "range"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={[
                    "p-4 rounded-xl border text-left transition",
                    mode === m
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold">
                    {m === "all" ? "Extract all pages" : "Custom range"}
                  </p>
                  <p className="text-xs mt-0.5 opacity-70">
                    {m === "all"
                      ? "Each page becomes a separate PDF"
                      : "Specify pages like 1-3, 5, 7-9"}
                  </p>
                </button>
              ))}
            </div>

            {mode === "range" && (
              <div>
                <input
                  type="text"
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="e.g. 1-3, 5, 7-9"
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-rose-400 transition"
                />
                <p className="text-xs text-stone-400 mt-1.5 ml-1">
                  Pages are 1-indexed. Use commas to separate ranges.
                </p>
              </div>
            )}
          </div>

          {/* Split button */}
          {status === "processing" ? (
            <div className="space-y-2">
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                <Loader2 size={14} className="animate-spin" /> Splitting…
              </div>
            </div>
          ) : (
            <button
              onClick={split}
              disabled={mode === "range" && !ranges.trim()}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition disabled:opacity-40"
            >
              Split PDF
            </button>
          )}
          {errMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errMsg}</p>
          )}
        </div>
      )}

      {status === "done" && results.length > 0 && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-stone-900 mb-1">Split complete!</p>
          <p className="text-sm text-stone-500 mb-6">{results.length} file{results.length !== 1 ? "s" : ""} created</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={downloadAll}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition"
            >
              <Download size={15} />
              Download {results.length === 1 ? "file" : `all ${results.length} files`}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-semibold text-sm transition"
            >
              <RotateCcw size={14} /> Split another
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
