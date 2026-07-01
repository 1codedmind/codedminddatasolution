"use client";

import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2 } from "lucide-react";
import type { Experience } from "@/lib/resume/types";
import MonthYearPicker from "../MonthYearPicker";

const inputCls = "w-full px-3 py-2 text-[13px] bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all";
const labelCls = "block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider";

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

function ExperienceItem({ exp, index }: { exp: Experience; index: number }) {
  const { updateExperience, removeExperience, addExperienceBullet, updateExperienceBullet, removeExperienceBullet } = useResumeStore();

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
        <span className="text-[12px] font-semibold text-stone-700">
          {exp.company || exp.title || `Position ${index + 1}`}
        </span>
        <button
          onClick={() => removeExperience(exp.id)}
          className="w-6 h-6 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Job Title" value={exp.title} onChange={(v) => updateExperience(exp.id, { title: v })} placeholder="Software Engineer" />
          <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} placeholder="Google" />
        </div>

        <Field label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, { location: v })} placeholder="San Francisco, CA" />

        <div className="grid grid-cols-2 gap-3">
          <MonthYearPicker label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(exp.id, { startDate: v })} />
          {!exp.current && (
            <MonthYearPicker label="End Date" value={exp.endDate} onChange={(v) => updateExperience(exp.id, { endDate: v })} />
          )}
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => updateExperience(exp.id, { current: !exp.current, endDate: !exp.current ? "" : exp.endDate })}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              exp.current ? "bg-stone-900 border-stone-900" : "border-stone-300 group-hover:border-stone-500"
            }`}
          >
            {exp.current && <svg width="8" height="6" viewBox="0 0 8 6"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span className="text-[12px] text-stone-600 select-none">I currently work here</span>
        </label>

        {/* Bullets */}
        <div>
          <label className={labelCls}>Achievements & Responsibilities</label>
          <div className="flex flex-col gap-2">
            {exp.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2.5 text-[10px] text-stone-400 shrink-0">•</span>
                <input
                  value={b}
                  onChange={(e) => updateExperienceBullet(exp.id, i, e.target.value)}
                  placeholder="Led team of 5 engineers to deliver…"
                  className={inputCls}
                />
                {exp.bullets.length > 1 && (
                  <button
                    onClick={() => removeExperienceBullet(exp.id, i)}
                    className="mt-2 w-6 h-6 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addExperienceBullet(exp.id)}
              className="self-start text-[12px] text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1.5 mt-0.5 transition-colors"
            >
              <Plus size={12} /> Add bullet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceEditor() {
  const { data, addExperience } = useResumeStore();

  return (
    <div className="p-4 flex flex-col gap-3">
      {data.experience.length === 0 && (
        <p className="text-[12px] text-stone-400 text-center py-6">No work experience added yet.</p>
      )}
      {data.experience.map((exp, i) => <ExperienceItem key={exp.id} exp={exp} index={i} />)}
      <button
        onClick={addExperience}
        className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-200 rounded-xl text-[13px] text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-medium"
      >
        <Plus size={14} /> Add Work Experience
      </button>
    </div>
  );
}
