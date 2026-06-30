"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { scoreResume, scoreColor } from "@/lib/resume/score";
import { TEMPLATE_META } from "@/lib/resume/types";
import { Download, Loader2, ChevronDown, LayoutTemplate, ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditorSidebar from "./EditorSidebar";
import ResumePreview from "./ResumePreview";
import TemplateSelector from "./TemplateSelector";

export default function ResumeEditor() {
  const { data, config, isDownloading, setIsDownloading } = useResumeStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const { score } = scoreResume(data);
  const color = scoreColor(score);

  async function handleDownload() {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, config }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = data.personalInfo.fullName.trim().replace(/\s+/g, "_") || "Resume";
      a.download = `${name}_Resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-[52px] border-b border-stone-200 flex items-center px-3 gap-2 shrink-0 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
        {/* Back */}
        <Link
          href="/tools"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          title="Back to tools"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="w-px h-4 bg-stone-200 mx-1" />

        {/* Template + Color — combined pill */}
        <button
          onClick={() => setShowTemplates(true)}
          className="flex items-center gap-2.5 h-8 px-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300 hover:shadow-sm transition-all text-sm text-stone-700 font-medium"
        >
          <LayoutTemplate size={14} className="text-stone-400 shrink-0" />
          <span className="hidden sm:inline">{TEMPLATE_META[config.template].label}</span>
          <div
            className="w-3.5 h-3.5 rounded-full ring-1 ring-white ring-offset-1 ring-offset-stone-50 shrink-0"
            style={{ backgroundColor: config.accentColor, boxShadow: `0 0 0 1px ${config.accentColor}40` }}
          />
          <ChevronDown size={12} className="text-stone-400" />
        </button>

        <div className="flex-1" />

        {/* ATS Score pill */}
        <div className="flex items-center gap-2 h-8 px-3 rounded-lg bg-stone-50 border border-stone-200">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="#e7e5e4" strokeWidth="2" />
            <circle
              cx="7" cy="7" r="5.5"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray={`${(score / 100) * 34.56} 34.56`}
              strokeLinecap="round"
              transform="rotate(-90 7 7)"
            />
          </svg>
          <span className="text-xs font-semibold" style={{ color }}>{score}%</span>
          <span className="text-xs text-stone-400 hidden sm:inline">ATS</span>
        </div>

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 h-8 px-4 bg-stone-950 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isDownloading
            ? <><Loader2 size={13} className="animate-spin" /><span className="hidden sm:inline">Generating…</span></>
            : <><Download size={13} /><span className="hidden sm:inline">Download PDF</span></>
          }
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar />
        <ResumePreview />
      </div>

      {showTemplates && <TemplateSelector onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
