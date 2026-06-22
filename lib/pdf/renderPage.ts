let pdfjs: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (pdfjs) return pdfjs;
  pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

// Render a single PDF page to a JPEG data URL
// pageIndex is 0-indexed; pdfjs uses 1-indexed internally
export async function renderPageToDataURL(
  file: File,
  pageIndex: number,
  targetWidth = 160
): Promise<string> {
  const lib = await getPdfjs();
  const bytes = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(pageIndex + 1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  await page.render({ canvas, viewport }).promise;

  const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
  pdf.cleanup();
  return dataUrl;
}

// Get total page count without rendering
export async function getPDFPageCountPdfjs(file: File): Promise<number> {
  const lib = await getPdfjs();
  const bytes = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: bytes }).promise;
  const count = pdf.numPages;
  pdf.cleanup();
  return count;
}
