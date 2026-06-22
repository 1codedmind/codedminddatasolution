"use client";

import { useState, useRef } from "react";
import { RotateCcw, Download, Loader2, FileText } from "lucide-react";
import { FileDropZone } from "@/components/pdf/FileDropZone";
import { ToolShell } from "@/components/pdf/ToolShell";
import { rotateProcessor } from "@/lib/pdf/processors/rotate";
import type { RotateAngle } from "@/lib/pdf/processors/rotate";

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

const ANGLES: { value: RotateAngle; label: string }[] = [
  { value: 90,  label: "90° clockwise" },
  { value: 180, label: "180°" },
  { value: 270, label: "90° counter-clockwise" },
];

export default function RotatePDFPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [angle, setAngle]       = useState<RotateAngle>(90);
  const [status, setStatus]     = useState<"idle" | "processing" | "done" | "error">("idle");
  const [result, setResult]     = useState<{ blob: Blob; filename: string } | null>(null);
  const [errMsg, setErrMsg]     = useState<string | null>(null);
  const linkRef                 = useRef<HTMLAnchorElement>(null);

  const handleFiles = (files: File[]) => { setFile(files[0]); setStatus("idle"); setResult(null); setErrMsg(null); };

  const rotate = async () => {
    if (!file) return;
    setStatus("processing");
    setErrMsg(null);
    try {
      const res = await rotateProcessor(file, { angle, pages: "all" });
      setResult(res);
      setStatus("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Rotation failed.");
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

  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setErrMsg(null); };

  return (
    <ToolShell
      title="Rotate PDF"
      description="Rotate all pages in a PDF by 90°, 180°, or 270°."
      icon={<RotateCcw size={22} />}
    >
      <a ref={linkRef} className="hidden" aria-hidden />

      {!file && (
        <FileDropZone
          accept=".pdf,application/pdf"
          multiple={false}
          maxSizeMB={100}
          onFiles={handleFiles}
          label="Drop a PDF to rotate"
          sublabel="Single file · Max 100 MB · PDF only"
        />
      )}

      {file && status !== "done" && (
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
              <FileText size={14} className="text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{file.name}</p>
              <p className="text-xs text-stone-400">{fmtBytes(file.size)}</p>
            </div>
            <button onClick={reset} className="text-xs text-stone-400 hover:text-stone-700 transition">Change</button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-stone-700">Rotation angle</p>
            <div className="grid grid-cols-3 gap-3">
              {ANGLES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setAngle(value)}
                  className={[
                    "p-4 rounded-xl border text-center transition",
                    angle === value
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300",
                  ].join(" ")}
                >
                  <RotateCcw size={20} className="mx-auto mb-2" style={{ transform: `rotate(${value === 270 ? 0 : -(value)}deg)` }} />
                  <p className="text-xs font-semibold">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {status === "processing" ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-stone-500">
              <Loader2 size={14} className="animate-spin" /> Rotating…
            </div>
          ) : (
            <button onClick={rotate} className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition">
              Rotate PDF
            </button>
          )}
          {errMsg && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errMsg}</p>}
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <p className="text-xl font-bold text-stone-900 mb-4">Rotation complete!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={download} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition">
              <Download size={15} /> Download
            </button>
            <button onClick={reset} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-semibold text-sm transition">
              <RotateCcw size={14} /> Rotate another
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
