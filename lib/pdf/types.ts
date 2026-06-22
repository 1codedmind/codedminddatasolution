// ─────────────────────────────────────────────────────────────────────────────
// PDF Processor contract
//
// Every processor (browser-side or future server-side) must satisfy this
// interface. This is the boundary that lets us swap implementations without
// touching the UI layer.
//
// Browser implementations live in: lib/pdf/processors/
// Future server implementations:   app/api/pdf/<tool>/route.ts
// ─────────────────────────────────────────────────────────────────────────────

export type ProcessorStatus = "idle" | "processing" | "done" | "error";

export interface PDFResult {
  blob: Blob;
  filename: string;
  originalBytes: number;
  resultBytes: number;
}

// Multi-file result (used by split)
export interface PDFResultSet {
  files: Array<{ blob: Blob; filename: string }>;
  originalBytes: number;
}

// The contract every processor must implement
export interface PDFProcessor<TOptions = Record<string, never>> {
  process(
    files: File[],
    options?: Partial<TOptions>,
    onProgress?: (percent: number) => void
  ): Promise<PDFResult>;
}

// File item tracked in UI state
export interface FileItem {
  id: string;     // random uuid for React key + reorder tracking
  file: File;
  pageCount?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Future: when a server processor is added, swap the import in the tool page:
//
//   import { mergeProcessor } from "@/lib/pdf/processors/merge";        // browser
//   import { mergeProcessor } from "@/lib/pdf/processors/server/merge"; // server
//
// Both implement PDFProcessor<MergeOptions>, so the UI never changes.
// ─────────────────────────────────────────────────────────────────────────────
