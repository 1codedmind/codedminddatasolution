"use client";

import { useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { FONT_OPTIONS } from "@/lib/resume/types";
import ModernPreview from "./templates/modern/Preview";
import ClassicPreview from "./templates/classic/Preview";
import MinimalPreview from "./templates/minimal/Preview";
import ExecutivePreview from "./templates/executive/Preview";
import CreativePreview from "./templates/creative/Preview";
import CompactPreview from "./templates/compact/Preview";
import SharpPreview from "./templates/sharp/Preview";
import ElegantPreview from "./templates/elegant/Preview";
import CascadePreview from "./templates/cascade/Preview";
import CubicPreview from "./templates/cubic/Preview";
import NanicaPreview from "./templates/nanica/Preview";
import EnfoldPreview from "./templates/enfold/Preview";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const TEMPLATES = {
  modern:    ModernPreview,
  classic:   ClassicPreview,
  minimal:   MinimalPreview,
  executive: ExecutivePreview,
  creative:  CreativePreview,
  compact:   CompactPreview,
  sharp:     SharpPreview,
  elegant:   ElegantPreview,
  cascade:   CascadePreview,
  cubic:     CubicPreview,
  nanica:    NanicaPreview,
  enfold:    EnfoldPreview,
};

const PAGE_SHADOW =
  "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)";

export default function ResumePreview() {
  const { data, config } = useResumeStore();
  const Template = TEMPLATES[config.template] ?? ModernPreview;
  const fontOption = FONT_OPTIONS[config.fontFamily ?? "inter"];
  const fontScale = config.fontScale ?? 1;

  const [pageCount, setPageCount] = useState(1);
  const measureRef = useRef<HTMLDivElement>(null);

  // Load ALL Google Fonts on mount so switching fonts is instant with no fallback flash.
  useEffect(() => {
    Object.values(FONT_OPTIONS).forEach((opt) => {
      if (!opt.google) return;
      const id = `gfont-preload-${opt.google}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${opt.google}&display=swap`;
      document.head.appendChild(link);
    });
  }, []);

  // Measure total content height at the current fontScale.
  // fontScale zoom is applied to the content wrapper inside the measurement div,
  // so getBoundingClientRect returns naturalHeight * fontScale layout pixels.
  // Page count = ceil(scaledHeight / A4_HEIGHT).
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height;
      setPageCount(Math.max(1, Math.ceil(h / A4_HEIGHT)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-[#1c1c1e] flex flex-col items-center py-10 px-6 gap-8">

      {/*
        Hidden measurement render — off-screen, never affects layout.
        Content wrapper has zoom: fontScale so the measured height already
        reflects the scaled content, matching what each page card clips.
      */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          width: A4_WIDTH,
          pointerEvents: "none",
          visibility: "hidden",
        }}
      >
        <div style={{ zoom: fontScale }}>
          <Template data={data} color={config.accentColor} fontFamily={fontOption?.css} />
        </div>
      </div>

      {/* One card per PDF page */}
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <div key={pageIndex} className="flex flex-col items-center gap-3 shrink-0">
          <p className="text-[11px] font-medium text-white/25 tracking-wider uppercase select-none">
            {pageCount > 1 ? `Page ${pageIndex + 1} of ${pageCount} · A4` : "Page 1 · A4"}
          </p>

          {/*
            Page card is always fixed A4 dimensions — the card never resizes.
            fontScale zoom is applied to the content wrapper inside so only
            the text/spacing scales, not the page itself.
            Negative marginTop on the content wrapper slides the full template
            up to reveal the correct page slice through the overflow:hidden window.
          */}
          <div
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              borderRadius: 2,
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: PAGE_SHADOW,
            }}
            className="bg-white"
          >
            <div style={{ overflow: "hidden", width: A4_WIDTH, height: A4_HEIGHT }}>
              <div style={{ marginTop: pageIndex === 0 ? 0 : -(pageIndex * A4_HEIGHT) }}>
                <div style={{ zoom: fontScale }}>
                  <Template
                    data={data}
                    color={config.accentColor}
                    fontFamily={fontOption?.css}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="h-4 shrink-0" />
    </div>
  );
}
