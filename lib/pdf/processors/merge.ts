import { PDFDocument } from "pdf-lib";
import type { PDFProcessor, PDFResult } from "../types";

export type MergeOptions = Record<string, never>;

export const mergeProcessor: PDFProcessor<MergeOptions> = {
  async process(files, _options, onProgress): Promise<PDFResult> {
    const originalBytes = files.reduce((sum, f) => sum + f.size, 0);
    const merged = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const bytes = await files[i].arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const indices = doc.getPageIndices();
      const pages = await merged.copyPages(doc, indices);
      pages.forEach((p) => merged.addPage(p));
      onProgress?.(Math.round(((i + 1) / files.length) * 90));
    }

    const out = await merged.save();
    onProgress?.(100);

    return {
      blob: new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" }),
      filename: "merged.pdf",
      originalBytes,
      resultBytes: out.byteLength,
    };
  },
};

export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch {
    return 0;
  }
}

// Merge with a custom page order — each entry specifies which file and page index (0-based)
// Files are cached in memory so the same PDF isn't read from disk multiple times
export async function mergeOrderedProcessor(
  pageOrder: Array<{ file: File; pageIndex: number }>,
  onProgress?: (pct: number) => void
): Promise<PDFResult> {
  const merged = await PDFDocument.create();
  const cache = new Map<File, PDFDocument>();
  const originalBytes = pageOrder.reduce((s, { file }) => s + file.size, 0);

  for (let i = 0; i < pageOrder.length; i++) {
    const { file, pageIndex } = pageOrder[i];

    if (!cache.has(file)) {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      cache.set(file, doc);
    }

    const src = cache.get(file)!;
    const [page] = await merged.copyPages(src, [pageIndex]);
    merged.addPage(page);
    onProgress?.(Math.round(((i + 1) / pageOrder.length) * 90));
  }

  const out = await merged.save();
  onProgress?.(100);

  return {
    blob: new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: "merged.pdf",
    originalBytes,
    resultBytes: out.byteLength,
  };
}
