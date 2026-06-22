import { PDFDocument } from "pdf-lib";
import type { PDFResultSet } from "../types";

export type SplitMode = "all" | "range";

export interface SplitOptions {
  mode: SplitMode;
  ranges?: string; // e.g. "1-3,5,7-9"
}

// Parse "1-3,5,7-9" → [0,1,2,4,6,7,8] (0-indexed)
function parseRanges(raw: string, total: number): number[] {
  const indices = new Set<number>();
  raw.split(",").forEach((part) => {
    const [a, b] = part.trim().split("-").map(Number);
    const start = Math.max(1, a);
    const end = b ? Math.min(total, b) : start;
    for (let i = start; i <= end; i++) indices.add(i - 1);
  });
  return Array.from(indices).sort((a, b) => a - b);
}

export async function splitProcessor(
  file: File,
  options: SplitOptions,
  onProgress?: (pct: number) => void
): Promise<PDFResultSet> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();

  const pageGroups: number[][] =
    options.mode === "all"
      ? Array.from({ length: total }, (_, i) => [i])
      : [parseRanges(options.ranges ?? "", total)];

  const results: Array<{ blob: Blob; filename: string }> = [];
  const baseName = file.name.replace(/\.pdf$/i, "");

  for (let g = 0; g < pageGroups.length; g++) {
    const group = pageGroups[g];
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(src, group);
    pages.forEach((p) => doc.addPage(p));
    const out = await doc.save();
    const label =
      options.mode === "all"
        ? `${baseName}-page-${group[0] + 1}.pdf`
        : `${baseName}-pages-${group[0] + 1}-${group[group.length - 1] + 1}.pdf`;
    results.push({ blob: new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" }), filename: label });
    onProgress?.(Math.round(((g + 1) / pageGroups.length) * 100));
  }

  return { files: results, originalBytes: file.size };
}
