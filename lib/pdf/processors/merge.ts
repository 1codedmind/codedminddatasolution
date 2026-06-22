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
