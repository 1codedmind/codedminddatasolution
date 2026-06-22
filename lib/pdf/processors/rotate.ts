import { PDFDocument, degrees } from "pdf-lib";
import type { PDFResult } from "../types";

export type RotateAngle = 90 | 180 | 270;

export interface RotateOptions {
  angle: RotateAngle;
  pages: "all" | number[]; // 1-indexed page numbers
}

export async function rotateProcessor(
  file: File,
  options: RotateOptions,
  onProgress?: (pct: number) => void
): Promise<PDFResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = doc.getPageCount();

  const indices: number[] =
    options.pages === "all"
      ? Array.from({ length: total }, (_, i) => i)
      : (options.pages as number[]).map((p) => p - 1).filter((i) => i >= 0 && i < total);

  indices.forEach((i, idx) => {
    const page = doc.getPage(i);
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + options.angle));
    onProgress?.(Math.round(((idx + 1) / indices.length) * 95));
  });

  const out = await doc.save();
  onProgress?.(100);

  return {
    blob: new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "-rotated.pdf"),
    originalBytes: file.size,
    resultBytes: out.byteLength,
  };
}
