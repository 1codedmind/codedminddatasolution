"use client";

import { useEffect } from "react";
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

export default function ResumePreview() {
  const { data, config } = useResumeStore();
  const Template = TEMPLATES[config.template] ?? ModernPreview;
  const fontOption = FONT_OPTIONS[config.fontFamily ?? "inter"];

  useEffect(() => {
    if (!fontOption?.google) return;
    const id = `gfont-${config.fontFamily}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontOption.google}&display=swap`;
    document.head.appendChild(link);
  }, [config.fontFamily, fontOption?.google]);

  return (
    <div className="flex-1 overflow-auto bg-[#1c1c1e] flex flex-col items-center py-10 px-6">
      <p className="text-[11px] font-medium text-white/25 mb-4 tracking-wider uppercase select-none">
        Page 1 · A4
      </p>

      <div
        style={{
          width: A4_WIDTH,
          minHeight: A4_HEIGHT,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
          borderRadius: 2,
          overflow: "hidden",
        }}
        className="bg-white"
      >
        <div style={{ zoom: config.fontScale ?? 1 }}>
          <Template
            data={data}
            color={config.accentColor}
            fontFamily={fontOption?.css}
          />
        </div>
      </div>

      <div className="h-10 shrink-0" />
    </div>
  );
}
