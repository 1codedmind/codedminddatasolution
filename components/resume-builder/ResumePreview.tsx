"use client";

import { useResumeStore } from "@/store/resumeStore";
import ModernPreview from "./templates/modern/Preview";
import ClassicPreview from "./templates/classic/Preview";
import MinimalPreview from "./templates/minimal/Preview";
import ExecutivePreview from "./templates/executive/Preview";
import CreativePreview from "./templates/creative/Preview";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

const TEMPLATES = {
  modern:    ModernPreview,
  classic:   ClassicPreview,
  minimal:   MinimalPreview,
  executive: ExecutivePreview,
  creative:  CreativePreview,
};

export default function ResumePreview() {
  const { data, config } = useResumeStore();
  const Template = TEMPLATES[config.template];

  return (
    <div className="flex-1 overflow-auto bg-[#1c1c1e] flex flex-col items-center py-10 px-6">
      {/* Page label */}
      <p className="text-[11px] font-medium text-white/25 mb-4 tracking-wider uppercase select-none">
        Page 1 · A4
      </p>

      {/* A4 Page */}
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
        <Template data={data} color={config.accentColor} />
      </div>

      <div className="h-10 shrink-0" />
    </div>
  );
}
