"use client";

import { useResumeStore } from "@/store/resumeStore";
import { scoreResume, scoreColor } from "@/lib/resume/score";
import type { SectionName } from "@/lib/resume/types";
import {
  User, AlignLeft, Briefcase, GraduationCap, Zap, Award, Code2, Globe,
  CheckCircle2, Circle, ChevronRight, Plus, X,
} from "lucide-react";
import PersonalInfoEditor from "./sections/PersonalInfoEditor";
import SummaryEditor from "./sections/SummaryEditor";
import ExperienceEditor from "./sections/ExperienceEditor";
import EducationEditor from "./sections/EducationEditor";
import SkillsEditor from "./sections/SkillsEditor";
import CertificationsEditor from "./sections/CertificationsEditor";
import ProjectsEditor from "./sections/ProjectsEditor";
import LanguagesEditor from "./sections/LanguagesEditor";

type SectionKey = SectionName | "personalInfo";

const SECTION_META: Record<SectionKey, { label: string; Icon: React.ElementType }> = {
  personalInfo:   { label: "Personal Info",   Icon: User },
  summary:        { label: "Summary",         Icon: AlignLeft },
  experience:     { label: "Experience",      Icon: Briefcase },
  education:      { label: "Education",       Icon: GraduationCap },
  skills:         { label: "Skills",          Icon: Zap },
  certifications: { label: "Certifications", Icon: Award },
  projects:       { label: "Projects",        Icon: Code2 },
  languages:      { label: "Languages",       Icon: Globe },
};

const SECTION_EDITORS: Record<string, React.ComponentType> = {
  personalInfo:   PersonalInfoEditor,
  summary:        SummaryEditor,
  experience:     ExperienceEditor,
  education:      EducationEditor,
  skills:         SkillsEditor,
  certifications: CertificationsEditor,
  projects:       ProjectsEditor,
  languages:      LanguagesEditor,
};

// Sections that can be toggled on/off by the user
const OPTIONAL_SECTIONS: SectionName[] = ["certifications", "projects", "languages"];
// Sections that are always in the resume and cannot be removed
const CORE_SECTIONS: SectionName[] = ["summary", "experience", "education", "skills"];

function sectionCount(data: ReturnType<typeof useResumeStore.getState>["data"], section: SectionKey): number | null {
  if (section === "personalInfo" || section === "summary") return null;
  const arr = data[section as keyof typeof data];
  return Array.isArray(arr) ? (arr as unknown[]).length : null;
}

export default function EditorSidebar() {
  const { data, activeSection, setActiveSection, addSection, removeSection } = useResumeStore();
  const { score, tips } = scoreResume(data);
  const color = scoreColor(score);

  const allSections: SectionKey[] = ["personalInfo", ...data.sectionOrder];
  const hiddenOptional = OPTIONAL_SECTIONS.filter((s) => !data.sectionOrder.includes(s));
  const doneTips = tips.filter((t) => t.done);
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <aside className="w-[300px] shrink-0 border-r border-stone-200 bg-white flex flex-col h-full overflow-hidden">

      {/* Score header */}
      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
        <div className="relative w-11 h-11 shrink-0">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={radius} fill="none" stroke="#f5f5f4" strokeWidth="3.5" />
            <circle
              cx="22" cy="22" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dasharray 0.4s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color }}>
            {score}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-stone-800">Resume Score</div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            {doneTips.length}/{tips.length} checks passed
          </div>
        </div>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {allSections.map((key) => {
            const { label, Icon } = SECTION_META[key];
            const count = sectionCount(data, key);
            const isOpen = activeSection === key;
            const isOptional = OPTIONAL_SECTIONS.includes(key as SectionName);
            const Editor = SECTION_EDITORS[key];

            return (
              <div key={key}>
                <div className={`group relative flex items-center transition-all ${
                  isOpen ? "bg-stone-50" : "hover:bg-stone-50"
                }`}>
                  <button
                    onClick={() => setActiveSection(key as SectionName)}
                    className={`flex-1 flex items-center gap-3 px-4 py-2.5 text-left transition-all relative ${
                      isOpen ? "text-stone-900" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {isOpen && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-stone-900" />
                    )}

                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0 ${
                      isOpen ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
                    }`}>
                      <Icon size={13} strokeWidth={2} />
                    </span>

                    <span className="flex-1 text-[13px] font-medium">{label}</span>

                    {count !== null && count > 0 && (
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {count}
                      </span>
                    )}

                    <ChevronRight
                      size={14}
                      className={`text-stone-300 transition-transform duration-200 ${isOpen ? "rotate-90" : "group-hover:text-stone-400"}`}
                    />
                  </button>

                  {/* Remove button — only on optional sections, shown on hover */}
                  {isOptional && (
                    <button
                      onClick={() => {
                        if (isOpen) setActiveSection(null as unknown as SectionName);
                        removeSection(key as SectionName);
                      }}
                      title={`Remove ${label}`}
                      className="opacity-0 group-hover:opacity-100 mr-2.5 w-5 h-5 flex items-center justify-center rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                {/* Inline editor panel */}
                {isOpen && Editor && (
                  <div className="border-t border-b border-stone-100 bg-stone-50/60">
                    <Editor />
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Section panel — shown when optional sections are hidden */}
          {hiddenOptional.length > 0 && (
            <div className="mt-2 mx-3 mb-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1 mb-2">Add section</p>
              <div className="flex flex-col gap-1">
                {hiddenOptional.map((section) => {
                  const { label, Icon } = SECTION_META[section];
                  return (
                    <button
                      key={section}
                      onClick={() => addSection(section)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700 hover:bg-white transition-all"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-stone-100 group-hover:bg-stone-200 transition-colors shrink-0">
                        <Icon size={12} strokeWidth={2} className="text-stone-500" />
                      </span>
                      <span className="flex-1 text-[12px] font-medium text-left">{label}</span>
                      <Plus size={12} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips footer */}
      <div className="border-t border-stone-100 bg-white">
        <div className="px-4 py-2.5">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Checklist</p>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
            {tips.map((tip) => (
              <div key={tip.key} className="flex items-start gap-2">
                {tip.done
                  ? <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  : <Circle size={12} className="text-stone-300 mt-0.5 shrink-0" />
                }
                <span className={`text-[11px] leading-tight ${
                  tip.done ? "text-stone-300 line-through" : "text-stone-500"
                }`}>
                  {tip.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
