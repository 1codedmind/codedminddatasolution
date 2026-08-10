import { PDFDocument } from "pdf-lib";
import type { PDFResult } from "../types";

export interface SignOptions {
  signatureDataUrl: string; // PNG data URL of the signature (typed, drawn, or uploaded)
  pageNumber: number;       // 1-indexed page to stamp
  xFrac: number;            // top-left X of signature, as fraction of page width  (0–1)
  yFrac: number;            // top-left Y of signature, as fraction of page height (0–1, from top)
  widthFrac: number;        // signature width as fraction of page width (0–1)
}

export async function signProcessor(
  file: File,
  options: SignOptions,
  onProgress?: (pct: number) => void
): Promise<PDFResult> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  onProgress?.(30);

  const pageIndex = options.pageNumber - 1;
  if (pageIndex < 0 || pageIndex >= doc.getPageCount()) {
    throw new Error(`Page ${options.pageNumber} does not exist in this PDF.`);
  }
  const page = doc.getPage(pageIndex);
  const { width: pw, height: ph } = page.getSize();

  const pngBytes = await fetch(options.signatureDataUrl).then((r) => r.arrayBuffer());
  const img = await doc.embedPng(pngBytes);
  onProgress?.(60);

  const sigW = options.widthFrac * pw;
  const sigH = sigW * (img.height / img.width);

  // PDF origin is bottom-left; UI coordinates are from top-left
  page.drawImage(img, {
    x: options.xFrac * pw,
    y: ph - options.yFrac * ph - sigH,
    width: sigW,
    height: sigH,
  });

  const out = await doc.save();
  onProgress?.(100);

  return {
    blob: new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "-signed.pdf"),
    originalBytes: file.size,
    resultBytes: out.byteLength,
  };
}
