"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PenLine, Download, Loader2, Type, Upload, Eraser, ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { FileDropZone } from "@/components/pdf/FileDropZone";
import { ToolShell } from "@/components/pdf/ToolShell";
import { signProcessor } from "@/lib/pdf/processors/sign";

// pdfjs touches browser globals (DOMMatrix) at import time, so it must be
// loaded lazily on the client — a static import breaks server rendering.
async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs;
}

type SigMode = "type" | "draw" | "upload";

const SIG_FONTS = [
  { label: "Dancing Script", css: "'Dancing Script', cursive", google: "Dancing+Script:wght@600" },
  { label: "Great Vibes",    css: "'Great Vibes', cursive",    google: "Great+Vibes" },
  { label: "Caveat",         css: "'Caveat', cursive",          google: "Caveat:wght@600" },
];

function loadSigFonts() {
  SIG_FONTS.forEach((f) => {
    const id = `sigfont-${f.google}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
    document.head.appendChild(link);
  });
}

/** Render typed text to a transparent PNG data URL. */
async function textToDataUrl(text: string, fontCss: string): Promise<string> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontSize = 72;
  ctx.font = `${fontSize}px ${fontCss}`;
  const metrics = ctx.measureText(text);
  const pad = 24;
  canvas.width = Math.ceil(metrics.width) + pad * 2;
  canvas.height = fontSize * 1.6;
  const ctx2 = canvas.getContext("2d")!;
  ctx2.font = `${fontSize}px ${fontCss}`;
  ctx2.fillStyle = "#1a1a2e";
  ctx2.textBaseline = "middle";
  ctx2.fillText(text, pad, canvas.height / 2);
  return canvas.toDataURL("image/png");
}

export default function SignPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Signature creation
  const [mode, setMode] = useState<SigMode>("type");
  const [typedName, setTypedName] = useState("");
  const [fontIdx, setFontIdx] = useState(0);
  const [sigDataUrl, setSigDataUrl] = useState<string | null>(null);
  const [sigAspect, setSigAspect] = useState(3); // width / height

  // Placement (fractions of rendered page)
  const [pos, setPos] = useState({ x: 0.55, y: 0.8 });
  const [widthFrac, setWidthFrac] = useState(0.3);
  const [zoom, setZoom] = useState(1); // page preview zoom (1 = fit width)

  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => { loadSigFonts(); }, []);

  // ── Load PDF & render current page ─────────────────────────────────────────
  const handleFiles = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setStatus("idle");
    setResult(null);
    setErrMsg(null);
    setPageNum(1);
    try {
      const pdfjs = await getPdfjs();
      const doc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
    } catch {
      setErrMsg("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  const renderPage = useCallback(async () => {
    const doc = pdfDocRef.current;
    const canvas = pageCanvasRef.current;
    if (!doc || !canvas) return;
    const page = await doc.getPage(pageNum);
    // Measure the scroll container (full card width), NOT the canvas wrapper —
    // the wrapper is w-fit and collapses to the canvas's own size before first render.
    const fitWidth = Math.max(scrollBoxRef.current?.clientWidth ?? 640, 280);
    const displayWidth = Math.round(fitWidth * zoom);
    const viewport = page.getViewport({ scale: 1 });
    const scale = displayWidth / viewport.width;
    const scaled = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
    canvas.width = scaled.width;
    canvas.height = scaled.height;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${(scaled.height / scaled.width) * displayWidth}px`;
    await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport: scaled }).promise;
  }, [pageNum, zoom]);

  useEffect(() => { if (file && numPages > 0) void renderPage(); }, [file, numPages, renderPage]);

  // ── Typed signature → PNG ───────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "type") return;
    if (!typedName.trim()) { setSigDataUrl(null); return; }
    let cancelled = false;
    void textToDataUrl(typedName.trim(), SIG_FONTS[fontIdx].css).then((url) => {
      if (cancelled) return;
      const img = new Image();
      img.onload = () => { if (!cancelled) { setSigAspect(img.width / img.height); setSigDataUrl(url); } };
      img.src = url;
    });
    return () => { cancelled = true; };
  }, [mode, typedName, fontIdx]);

  // ── Draw pad ────────────────────────────────────────────────────────────────
  const initDrawPad = useCallback((canvas: HTMLCanvasElement | null) => {
    (drawCanvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = canvas;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 560 * dpr;
    canvas.height = 200 * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a2e";
  }, []);

  function drawPoint(e: React.PointerEvent<HTMLCanvasElement>, begin: boolean) {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 560;
    const y = ((e.clientY - rect.top) / rect.height) * 200;
    const ctx = canvas.getContext("2d")!;
    if (begin) { ctx.beginPath(); ctx.moveTo(x, y); }
    else { ctx.lineTo(x, y); ctx.stroke(); }
  }

  function commitDrawing() {
    const canvas = drawCanvasRef.current;
    if (!canvas || !hasDrawnRef.current) return;
    setSigAspect(560 / 200);
    setSigDataUrl(canvas.toDataURL("image/png"));
  }

  function clearDrawing() {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    setSigDataUrl(null);
  }

  // ── Upload signature image ──────────────────────────────────────────────────
  function handleSigImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setErrMsg("Signature must be an image file (PNG or JPG)."); return; }
    if (f.size > 4 * 1024 * 1024) { setErrMsg("Signature image must be under 4 MB."); return; }
    setErrMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      // Normalize to PNG via canvas (pdf-lib embedPng needs PNG; JPG uploads get converted)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        setSigAspect(img.width / img.height);
        setSigDataUrl(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  }

  // ── Drag placement ──────────────────────────────────────────────────────────
  function onSigPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }

  function onSigPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const box = previewBoxRef.current;
    if (!drag || !box) return;
    const rect = box.getBoundingClientRect();
    const dx = (e.clientX - drag.startX) / rect.width;
    const dy = (e.clientY - drag.startY) / rect.height;
    const sigH = (widthFrac / sigAspect) * (rect.width / rect.height);
    setPos({
      x: Math.min(Math.max(drag.origX + dx, 0), 1 - widthFrac),
      y: Math.min(Math.max(drag.origY + dy, 0), 1 - sigH),
    });
  }

  function onSigPointerUp() { dragRef.current = null; }

  // ── Sign & download ─────────────────────────────────────────────────────────
  async function handleSign() {
    if (!file || !sigDataUrl) return;
    setStatus("processing");
    setErrMsg(null);
    try {
      const res = await signProcessor(file, {
        signatureDataUrl: sigDataUrl,
        pageNumber: pageNum,
        xFrac: pos.x,
        yFrac: pos.y,
        widthFrac,
      });
      setResult(res);
      setStatus("done");
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Signing failed.");
      setStatus("error");
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = linkRef.current!;
    a.href = url; a.download = result.filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function reset() {
    setFile(null); setNumPages(0); setPageNum(1);
    setStatus("idle"); setResult(null); setErrMsg(null);
    setSigDataUrl(null); setTypedName("");
    pdfDocRef.current = null;
    hasDrawnRef.current = false;
  }

  const tabCls = (active: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
      active ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
    }`;

  return (
    <ToolShell
      title="Sign PDF"
      description="Add your signature to a PDF — type it, draw it, or upload an image. Drag to position, then download."
      icon={<PenLine size={22} />}
      badge="New"
    >
      <a ref={linkRef} className="hidden" />

      {!file ? (
        <FileDropZone
          multiple={false}
          maxFiles={1}
          onFiles={handleFiles}
          label="Drop a PDF here or click to browse"
          sublabel="Signed entirely in your browser — the file never leaves your device"
        />
      ) : (
        <div className="space-y-6">

          {/* ── 1. Create signature ─────────────────────────────────────── */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <div className="mb-3">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">1 · Create your signature</p>
              <p className="text-xs text-stone-400 mt-1">Choose one of the three ways below to make your signature.</p>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                className={tabCls(mode === "type")}
                onClick={() => { setMode("type"); setSigDataUrl(null); }}
                title="Type your name and pick a handwriting style"
              >
                <Type size={13} /> Type your name
              </button>
              <button
                className={tabCls(mode === "draw")}
                onClick={() => { setMode("draw"); setSigDataUrl(null); hasDrawnRef.current = false; }}
                title="Draw your signature with mouse or finger"
              >
                <PenLine size={13} /> Draw with mouse
              </button>
              <button
                className={tabCls(mode === "upload")}
                onClick={() => { setMode("upload"); setSigDataUrl(null); }}
                title="Upload a photo or scan of your signature"
              >
                <Upload size={13} /> Upload an image
              </button>
            </div>

            {mode === "type" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  maxLength={60}
                  placeholder="Type your full name"
                  className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <div>
                  <p className="text-xs text-stone-400 mb-2">Pick a handwriting style — the selected one has a dark border:</p>
                  <div className="flex flex-wrap gap-2">
                    {SIG_FONTS.map((f, i) => (
                      <button
                        key={f.label}
                        onClick={() => setFontIdx(i)}
                        title={`Use the ${f.label} style`}
                        className={`relative px-4 py-2.5 rounded-xl border-2 text-2xl leading-none transition-colors ${
                          fontIdx === i ? "border-stone-900 bg-white" : "border-stone-200 bg-white/60 hover:border-stone-300"
                        }`}
                        style={{ fontFamily: f.css }}
                      >
                        {typedName.trim() || "Signature"}
                        {fontIdx === i && (
                          <span className="absolute -top-2 -right-2 text-[9px] font-sans font-bold text-white bg-stone-900 rounded-full px-1.5 py-0.5">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === "draw" && (
              <div className="space-y-2">
                <p className="text-xs text-stone-400">Draw your signature inside the white box using your mouse or finger:</p>
                <canvas
                  ref={initDrawPad}
                  className="w-full max-w-[560px] h-[200px] bg-white border-2 border-dashed border-stone-300 rounded-xl cursor-crosshair touch-none"
                  onPointerDown={(e) => { drawingRef.current = true; hasDrawnRef.current = true; drawPoint(e, true); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
                  onPointerMove={(e) => { if (drawingRef.current) drawPoint(e, false); }}
                  onPointerUp={() => { drawingRef.current = false; commitDrawing(); }}
                  onPointerLeave={() => { if (drawingRef.current) { drawingRef.current = false; commitDrawing(); } }}
                />
                <button
                  onClick={clearDrawing}
                  title="Erase everything and start drawing again"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-stone-200 text-stone-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <Eraser size={12} /> Clear &amp; redraw
                </button>
              </div>
            )}

            {mode === "upload" && (
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSigImage}
                  className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:font-medium file:text-amber-900 hover:file:bg-amber-200"
                />
                <p className="mt-2 text-xs text-stone-400">PNG with transparent background works best · Max 4 MB</p>
              </div>
            )}
          </div>

          {/* ── 2. Position on page ─────────────────────────────────────── */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <div className="mb-4">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">2 · Place your signature</p>
              <p className="text-xs text-stone-400 mt-1">Drag the signature box on the page to move it. Use the controls below to adjust sizes.</p>
            </div>

            {/* Controls bar */}
            <div className="flex items-center justify-between flex-wrap gap-x-6 gap-y-3 mb-4 bg-white border border-stone-200 rounded-xl px-4 py-3">

              {/* Page navigation */}
              {numPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Page</span>
                  <button
                    onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                    disabled={pageNum <= 1}
                    title="Previous page"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-stone-50 border border-stone-200 text-stone-600 disabled:opacity-30 hover:bg-stone-100 transition-colors"
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <span className="text-xs font-semibold text-stone-700 tabular-nums px-1">{pageNum} / {numPages}</span>
                  <button
                    onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                    disabled={pageNum >= numPages}
                    title="Next page"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-stone-50 border border-stone-200 text-stone-600 disabled:opacity-30 hover:bg-stone-100 transition-colors"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              )}

              {/* Page zoom */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Page zoom</span>
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                  disabled={zoom <= 0.5}
                  title="Zoom out — make the page smaller"
                  className="p-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 disabled:opacity-30 hover:bg-stone-100 transition-colors"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-semibold text-stone-700 tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))}
                  disabled={zoom >= 2.5}
                  title="Zoom in — make the page bigger"
                  className="p-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 disabled:opacity-30 hover:bg-stone-100 transition-colors"
                >
                  <ZoomIn size={14} />
                </button>
                {zoom !== 1 && (
                  <button
                    onClick={() => setZoom(1)}
                    title="Reset zoom to fit width"
                    className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-stone-50 border border-stone-200 text-stone-500 hover:bg-stone-100 transition-colors"
                  >
                    Fit
                  </button>
                )}
              </div>

              {/* Signature size */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Signature size</span>
                <span className="text-[10px] text-stone-400">Small</span>
                <input
                  type="range"
                  min={0.1}
                  max={0.6}
                  step={0.02}
                  value={widthFrac}
                  onChange={(e) => setWidthFrac(parseFloat(e.target.value))}
                  title="Drag to make the signature bigger or smaller"
                  className="w-28 h-1.5 appearance-none rounded-full bg-stone-200 accent-stone-900 cursor-pointer"
                />
                <span className="text-xs text-stone-400 font-semibold">Large</span>
              </div>
            </div>

            {/* Scrollable page preview */}
            <div ref={scrollBoxRef} className="overflow-auto max-h-[75vh] rounded-lg">
              <div ref={previewBoxRef} className="relative mx-auto w-fit select-none">
                <canvas ref={pageCanvasRef} className="border border-stone-200 rounded-lg shadow-sm" />
                {sigDataUrl && (
                  <div
                    onPointerDown={onSigPointerDown}
                    onPointerMove={onSigPointerMove}
                    onPointerUp={onSigPointerUp}
                    className="absolute cursor-move border-2 border-dashed border-amber-400/80 bg-amber-50/20 rounded touch-none"
                    style={{
                      left: `${pos.x * 100}%`,
                      top: `${pos.y * 100}%`,
                      width: `${widthFrac * 100}%`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sigDataUrl} alt="Signature" className="w-full pointer-events-none" draggable={false} />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5 whitespace-nowrap pointer-events-none">
                      Drag to move
                    </span>
                  </div>
                )}
                {!sigDataUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                    <p className="text-sm text-stone-400 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                      Create a signature in step 1 to place it here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {errMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errMsg}</p>
          )}

          {/* ── 3. Sign & download ──────────────────────────────────────── */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <div className="mb-3">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">3 · Finish</p>
              <p className="text-xs text-stone-400 mt-1">
                {status === "done"
                  ? "Your signed PDF is ready — download it below."
                  : sigDataUrl
                    ? `The signature will be stamped on page ${pageNum} exactly where you placed it.`
                    : "Create a signature in step 1 first, then this button will activate."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {status !== "done" ? (
                <button
                  onClick={handleSign}
                  disabled={!sigDataUrl || status === "processing"}
                  title={sigDataUrl ? "Stamp the signature onto the PDF" : "Create a signature first (step 1)"}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-stone-900 rounded-full hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "processing" ? <Loader2 size={15} className="animate-spin" /> : <PenLine size={15} />}
                  {status === "processing" ? "Signing…" : "Apply signature to PDF"}
                </button>
              ) : (
                <button
                  onClick={download}
                  title="Save the signed PDF to your device"
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors"
                >
                  <Download size={15} />
                  Download signed PDF
                </button>
              )}
              <button
                onClick={reset}
                title="Remove this PDF and signature and begin again"
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-stone-500 bg-white border border-stone-200 rounded-full hover:bg-stone-50 transition-colors"
              >
                <RotateCcw size={14} />
                Start over
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
