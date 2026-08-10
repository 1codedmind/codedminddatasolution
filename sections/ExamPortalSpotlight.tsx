"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const features = [
  "Familiar exam interface — same pattern as JEE, GATE & corporate assessments",
  "LeetCode-style coding questions that run in the browser",
  "MCQ, true/false, multi-select and descriptive questions",
  "Instant auto-grading with detailed result analytics",
  "Built for universities, coaching institutes and hiring teams",
];

// Miniature exam canvas — question panel + palette, animated in
function ExamMockup() {
  const options = [
    { label: "O(n)", selected: false },
    { label: "O(log n)", selected: false },
    { label: "O(1)", selected: true },
    { label: "O(n log n)", selected: false },
  ];
  // Palette cell colors mirror the real canvas: green answered, red visited,
  // purple marked, white untouched
  const palette = [
    "#059669", "#059669", "#dc2626", "#7c3aed", "#059669",
    "#059669", "#fff", "#fff", "#fff", "#fff",
  ];

  return (
    <div className="relative w-full max-w-[560px] mx-auto select-none">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl blur-3xl opacity-25 bg-gradient-to-br from-emerald-400 via-blue-400 to-amber-300 scale-95" />

      {/* Exam shell */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-2xl bg-white"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-white">
          <div className="text-[10px] font-bold text-stone-900">Python Fundamentals</div>
          <motion.div
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-800 text-[9px] font-bold tabular-nums"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            00:29:47
          </motion.div>
        </div>

        <div className="flex" style={{ height: 250 }}>
          {/* Question panel */}
          <div className="flex-1 p-4 bg-stone-50/60">
            <motion.div
              className="text-[9px] font-bold text-stone-900 mb-1"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Question 7
              <span className="ml-2 font-normal text-stone-400">Marks: +2</span>
            </motion.div>
            <motion.div
              className="text-[10px] text-stone-700 mb-3 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              What is the average-case time complexity of a dictionary lookup in Python?
            </motion.div>

            <div className="space-y-1.5">
              {options.map((o, i) => (
                <motion.div
                  key={o.label}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[9px] font-mono ${
                    o.selected
                      ? "border-blue-500 bg-blue-50 text-stone-900"
                      : "border-stone-200 bg-white text-stone-600"
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.12 }}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${
                      o.selected ? "border-blue-600 bg-blue-600" : "border-stone-300"
                    }`}
                  />
                  {String.fromCharCode(65 + i)}. {o.label}
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex justify-end gap-1.5 mt-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.3 }}
            >
              <div className="px-2.5 py-1.5 rounded-md border border-stone-200 text-[8px] font-bold text-stone-500">
                Previous
              </div>
              <motion.div
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-[8px] font-bold"
                whileHover={{ scale: 1.05 }}
              >
                Save & Next
              </motion.div>
            </motion.div>
          </div>

          {/* Palette sidebar */}
          <div className="w-[110px] shrink-0 border-l border-stone-100 bg-white p-3">
            <div className="text-[7px] font-bold text-stone-400 uppercase tracking-wide mb-2">
              Questions
            </div>
            <div className="grid grid-cols-5 gap-1">
              {palette.map((color, i) => (
                <motion.div
                  key={i}
                  className="h-4 rounded flex items-center justify-center text-[6px] font-bold"
                  style={{
                    background: color,
                    color: color === "#fff" ? "#78716c" : "white",
                    border: color === "#fff" ? "1px solid #d6d3d1" : "none",
                    outline: i === 6 ? "2px solid #2563eb" : "none",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                >
                  {i + 1}
                </motion.div>
              ))}
            </div>
            <div className="mt-2.5 space-y-1">
              {[
                ["#059669", "Answered"],
                ["#dc2626", "Not answered"],
                ["#7c3aed", "Marked"],
              ].map(([c, label]) => (
                <div key={label} className="flex items-center gap-1 text-[7px] text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: c }} />
                  {label}
                </div>
              ))}
            </div>
            <motion.div
              className="mt-3 py-1.5 rounded-md bg-emerald-600 text-white text-[8px] font-bold text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5 }}
            >
              Submit Exam
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExamPortalSpotlight() {
  return (
    <section className="bg-[#fcfaf6] overflow-hidden border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — exam mockup (mirrored layout vs resume spotlight) */}
          <div className="order-2 lg:order-1">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.15 }}
            >
              <ExamMockup />
            </motion.div>
          </div>

          {/* Right — copy */}
          <div className="order-1 lg:order-2">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-blue-700 border border-blue-200 bg-blue-50 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                NEW — Examination Platform
              </div>

              <h2 className="text-4xl sm:text-5xl font-extrabold text-stone-950 tracking-tight leading-[1.08] mb-5">
                Online exams your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  candidates already know
                </span>
              </h2>

              <p className="text-[15px] text-stone-600 leading-relaxed mb-8 max-w-md">
                Conduct secure MCQ and coding assessments with the interface
                millions of candidates trust — for universities, institutes and
                hiring teams.
              </p>

              <ul className="flex flex-col gap-3 mb-10">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[14px] text-stone-700">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 flex-wrap">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/exams/preview"
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all"
                    style={{ background: "linear-gradient(135deg, #059669, #2563eb)" }}
                  >
                    Try the exam portal <ArrowRight size={15} />
                  </Link>
                </motion.div>
                <span className="text-[12px] text-stone-500">Free demo with sample questions</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
