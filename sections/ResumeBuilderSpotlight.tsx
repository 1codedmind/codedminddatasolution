"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const features = [
  "5 professionally designed templates",
  "Live A4 preview — updates as you type",
  "ATS score with actionable tips",
  "Server-rendered vector PDF download",
  "No login or account required",
];

function EditorMockup() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto select-none">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl blur-3xl opacity-20 bg-gradient-to-br from-blue-500 via-violet-500 to-stone-900 scale-95" />

      {/* Editor shell */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: "#111" }}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]" style={{ background: "#1a1a1a" }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-white/10 text-[10px] text-white/40 font-medium" style={{ background: "#222" }}>
              <div className="w-2 h-2 rounded-sm border border-white/20" />
              Modern · <span className="text-blue-400">●</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold text-white" style={{ background: "#1d4ed8" }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5l3.5-.5z"/></svg>
            Download PDF
          </div>
        </div>

        {/* Body */}
        <div className="flex" style={{ height: 260 }}>
          {/* Sidebar */}
          <div className="w-[130px] shrink-0 border-r border-white/[0.06] flex flex-col" style={{ background: "#161616" }}>
            {/* Score */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
              <svg width="22" height="22" viewBox="0 0 22 22">
                <circle cx="11" cy="11" r="8" fill="none" stroke="#333" strokeWidth="2.5" />
                <circle cx="11" cy="11" r="8" fill="none" stroke="#22c55e" strokeWidth="2.5"
                  strokeDasharray="38 50" strokeLinecap="round" transform="rotate(-90 11 11)" />
              </svg>
              <div>
                <div className="text-[9px] font-bold text-green-400">84%</div>
                <div className="text-[8px] text-white/30">ATS Score</div>
              </div>
            </div>

            {/* Section rows */}
            {[
              { label: "Personal Info", active: false },
              { label: "Summary", active: false },
              { label: "Experience", active: true, count: 2 },
              { label: "Education", active: false, count: 1 },
              { label: "Skills", active: false, count: 6 },
              { label: "Certifications", active: false },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-2 relative"
                style={{ background: s.active ? "rgba(255,255,255,0.04)" : "transparent" }}
              >
                {s.active && <div className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r bg-white/60" />}
                <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: s.active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}>
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ background: s.active ? "white" : "rgba(255,255,255,0.3)" }} />
                </div>
                <span className="text-[9px] flex-1 truncate" style={{ color: s.active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}>{s.label}</span>
                {s.count && <span className="text-[8px] font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>{s.count}</span>}
              </div>
            ))}
          </div>

          {/* Preview canvas */}
          <div className="flex-1 flex items-center justify-center py-4 px-3" style={{ background: "#1c1c1e" }}>
            {/* A4 page */}
            <div className="w-full max-w-[220px] rounded shadow-2xl overflow-hidden" style={{ background: "white", aspectRatio: "1/1.414" }}>
              {/* Resume content - Modern template miniature */}
              <div className="p-3 h-full flex flex-col" style={{ fontFamily: "sans-serif" }}>
                {/* Header band */}
                <div className="pb-2 mb-2.5 border-b-2 border-blue-600 flex justify-between items-start">
                  <div>
                    <div className="h-2 w-20 rounded bg-stone-900 mb-1" />
                    <div className="h-1.5 w-12 rounded bg-blue-500" />
                  </div>
                  <div className="text-right flex flex-col gap-0.5 items-end">
                    <div className="h-1 w-16 rounded bg-stone-200" />
                    <div className="h-1 w-12 rounded bg-stone-200" />
                    <div className="h-1 w-14 rounded bg-stone-200" />
                  </div>
                </div>
                {/* Summary */}
                <div className="mb-2">
                  <div className="h-1.5 w-14 rounded bg-blue-600 mb-1" />
                  <div className="h-px w-full bg-blue-600 mb-1.5" />
                  <div className="h-1 w-full rounded bg-stone-100 mb-0.5" />
                  <div className="h-1 w-3/4 rounded bg-stone-100" />
                </div>
                {/* Experience */}
                <div className="mb-2">
                  <div className="h-1.5 w-18 rounded bg-blue-600 mb-1" />
                  <div className="h-px w-full bg-blue-600 mb-1.5" />
                  {[1,2].map(i => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between mb-0.5">
                        <div className="h-1.5 w-14 rounded bg-stone-800" />
                        <div className="h-1 w-10 rounded bg-stone-200" />
                      </div>
                      <div className="h-1 w-20 rounded bg-stone-300 mb-1" />
                      <div className="h-1 w-full rounded bg-stone-100 mb-0.5" />
                      <div className="h-1 w-5/6 rounded bg-stone-100" />
                    </div>
                  ))}
                </div>
                {/* Skills */}
                <div>
                  <div className="h-1.5 w-8 rounded bg-blue-600 mb-1" />
                  <div className="h-px w-full bg-blue-600 mb-1.5" />
                  <div className="flex flex-wrap gap-0.5">
                    {["TS","React","Node","AWS","SQL"].map(s => (
                      <div key={s} className="h-1.5 rounded px-1.5" style={{ background: "#f3f4f6", fontSize: 6, color: "#374151", display: "flex", alignItems: "center" }}>{s}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumeBuilderSpotlight() {
  return (
    <section className="bg-stone-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FREE TOOL — No login required
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-5">
              Build a resume that
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                actually gets interviews
              </span>
            </h2>

            <p className="text-[15px] text-stone-400 leading-relaxed mb-8 max-w-md">
              Professional templates, live preview, and ATS optimization — all in your browser. Download a high-quality PDF in under 5 minutes.
            </p>

            <ul className="flex flex-col gap-3 mb-10">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-[14px] text-stone-300">{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 flex-wrap">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/tools/resume-builder"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all"
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}
                >
                  Build my resume <ArrowRight size={15} />
                </Link>
              </motion.div>
              <span className="text-[12px] text-stone-600">Takes less than 5 minutes</span>
            </div>
          </motion.div>

          {/* Right — editor mockup */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.15 }}
          >
            <EditorMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
