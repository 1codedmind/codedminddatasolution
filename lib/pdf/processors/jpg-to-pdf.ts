import { PDFDocument, PageSizes } from "pdf-lib";
import type { PDFResult } from "../types";

export type PageSize = "A4" | "Letter" | "fit";

export interface JpgToPdfOptions {
  pageSize: PageSize;
  margin: number; // px
}

const SIZE_MAP: Record<string, [number, number]> = {
  A4: PageSizes.A4,
  Letter: PageSizes.Letter,
};

export async function jpgToPdfProcessor(
  files: File[],
  options: JpgToPdfOptions = { pageSize: "A4", margin: 0 },
  onProgress?: (pct: number) => void
): Promise<PDFResult> {
  const doc = await PDFDocument.create();
  const originalBytes = files.reduce((s, f) => s + f.size, 0);

  for (let i = 0; i < files.length; i++) {
    const bytes = await files[i].arrayBuffer();
    const mime = files[i].type;

    const img =
      mime === "image/png"
        ? await doc.embedPng(bytes)
        : await doc.embedJpg(bytes);

    let [pw, ph] =
      options.pageSize === "fit"
        ? [img.width, img.height]
        : SIZE_MAP[options.pageSize];

    const m = options.margin;
    const maxW = pw - m * 2;
    const maxH = ph - m * 2;
    const scale = Math.min(maxW / img.width, maxH / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;

    const page = doc.addPage([pw, ph]);
    page.drawImage(img, {
      x: (pw - w) / 2,
      y: (ph - h) / 2,
      width: w,
      height: h,
    });

    onProgress?.(Math.round(((i + 1) / files.length) * 95));
  }

  const out = await doc.save();
  onProgress?.(100);

  return {
    blob: new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: files.length === 1 ? files[0].name.replace(/\.(jpe?g|png|webp)$/i, ".pdf") : "images.pdf",
    originalBytes,
    resultBytes: out.byteLength,
  };
}
