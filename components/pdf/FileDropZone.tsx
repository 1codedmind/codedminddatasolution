"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileText } from "lucide-react";

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  maxFiles?: number;
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
}

export function FileDropZone({
  accept = ".pdf",
  multiple = true,
  maxSizeMB = 50,
  maxFiles = 20,
  onFiles,
  label,
  sublabel,
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (raw: File[]): { valid: File[]; error: string | null } => {
      const oversized = raw.filter((f) => f.size > maxSizeMB * 1024 * 1024);
      if (oversized.length) {
        return {
          valid: raw.filter((f) => f.size <= maxSizeMB * 1024 * 1024),
          error: `${oversized.length} file(s) exceed the ${maxSizeMB} MB limit and were skipped.`,
        };
      }
      if (raw.length > maxFiles) {
        return {
          valid: raw.slice(0, maxFiles),
          error: `Maximum ${maxFiles} files allowed. Only the first ${maxFiles} were added.`,
        };
      }
      return { valid: raw, error: null };
    },
    [maxSizeMB, maxFiles]
  );

  const handle = useCallback(
    (raw: File[]) => {
      const { valid, error } = validate(raw);
      setError(error);
      if (valid.length > 0) onFiles(valid);
    },
    [validate, onFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handle(Array.from(e.dataTransfer.files));
    },
    [handle]
  );

  return (
    <div className="space-y-2">
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={[
          "border-2 border-dashed rounded-2xl p-14 flex flex-col items-center gap-4 cursor-pointer",
          "transition-all duration-200 select-none",
          dragging
            ? "border-rose-400 bg-rose-50 scale-[1.01]"
            : "border-stone-300 hover:border-rose-300 hover:bg-rose-50/40",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handle(Array.from(e.target.files ?? []))}
        />

        <div className={[
          "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
          dragging ? "bg-rose-100 text-rose-500" : "bg-stone-100 text-stone-400",
        ].join(" ")}>
          {dragging ? <FileText size={28} /> : <Upload size={28} />}
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-stone-700">
            {label ?? "Drop files here or click to browse"}
          </p>
          <p className="text-sm text-stone-400 mt-1">
            {sublabel ?? `Up to ${maxFiles} files · Max ${maxSizeMB} MB each`}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
