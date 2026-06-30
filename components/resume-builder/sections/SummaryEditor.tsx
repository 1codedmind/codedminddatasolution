"use client";

import { useResumeStore } from "@/store/resumeStore";

export default function SummaryEditor() {
  const { data, updateSummary } = useResumeStore();
  const wordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;
  const isGood = wordCount >= 40;

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <textarea
        value={data.summary}
        onChange={(e) => updateSummary(e.target.value)}
        placeholder="Write 2–4 sentences highlighting your experience, key skills, and what makes you stand out. Aim for 40–80 words."
        rows={6}
        className="w-full px-3 py-2.5 text-[13px] bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 resize-none transition-all leading-relaxed"
      />
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-stone-400">40–80 words for best results</p>
        <span className={`text-[11px] font-semibold tabular-nums ${isGood ? "text-emerald-600" : "text-amber-500"}`}>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
}
