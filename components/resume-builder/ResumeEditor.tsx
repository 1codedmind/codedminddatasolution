"use client";

import { useState, useRef, useCallback } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { scoreResume, scoreColor } from "@/lib/resume/score";
import { Download, Loader2, ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import EditorSidebar from "./EditorSidebar";
import ResumePreview from "./ResumePreview";

export default function ResumeEditor() {
  const { data, config, isDownloading, setIsDownloading } = useResumeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const { score } = scoreResume(data);
  const scoreCol = scoreColor(score);

  const startResize = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    function onMouseMove(ev: MouseEvent) {
      if (!isResizing.current) return;
      const delta = ev.clientX - startX.current;
      setSidebarWidth(Math.max(240, Math.min(480, startWidth.current + delta)));
    }
    function onMouseUp() {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [sidebarWidth]);

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
      {/* Toolbar */}
      <header className="h-[52px] border-b border-stone-200 flex items-center px-3 gap-2 shrink-0 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
        <Link
          href="/tools"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          title="Back to tools"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="w-px h-4 bg-stone-200" />

        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          title={sidebarOpen ? "Hide panel" : "Show panel"}
        >
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>

        <div className="flex-1" />

        {/* ATS score */}
        <div className="flex items-center gap-2 h-8 px-3 rounded-lg bg-stone-50 border border-stone-200">
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="5.5" fill="none" stroke="#e7e5e4" strokeWidth="2" />
            <circle
              cx="7" cy="7" r="5.5" fill="none"
              stroke={scoreCol} strokeWidth="2"
              strokeDasharray={`${(score / 100) * 34.56} 34.56`}
              strokeLinecap="round"
              transform="rotate(-90 7 7)"
            />
          </svg>
          <span className="text-xs font-semibold" style={{ color: scoreCol }}>{score}%</span>
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
        {/* Sidebar — animated collapse */}
        <div
          className="shrink-0 overflow-hidden transition-[width] duration-200 border-r border-stone-200"
          style={{ width: sidebarOpen ? sidebarWidth : 0 }}
        >
          {/* Inner div keeps the sidebar at full width so content doesn't reflow during animation */}
          <div className="h-full" style={{ width: sidebarWidth }}>
            <EditorSidebar />
          </div>
        </div>

        {/* Resize handle */}
        {sidebarOpen && (
          <div
            className="w-[4px] shrink-0 cursor-ew-resize hover:bg-blue-400/40 active:bg-blue-500/60 transition-colors"
            onMouseDown={startResize}
          />
        )}

        <ResumePreview />
      </div>
    </div>
  );
}
