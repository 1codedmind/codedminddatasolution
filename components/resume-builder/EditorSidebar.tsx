"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { scoreResume, scoreColor } from "@/lib/resume/score";
import type { SectionName, TemplateName, FontOption } from "@/lib/resume/types";
import { TEMPLATE_META, ACCENT_COLORS, FONT_OPTIONS } from "@/lib/resume/types";
import {
  User, AlignLeft, Briefcase, GraduationCap, Zap, Award, Code2, Globe,
  CheckCircle2, Circle, ChevronRight, Plus, X, GripVertical, Check, Layers,
} from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ResumeUpload from "./ResumeUpload";
import CustomSectionEditor from "./sections/CustomSectionEditor";
import PersonalInfoEditor from "./sections/PersonalInfoEditor";
import SummaryEditor from "./sections/SummaryEditor";
import ExperienceEditor from "./sections/ExperienceEditor";
import EducationEditor from "./sections/EducationEditor";
import SkillsEditor from "./sections/SkillsEditor";
import CertificationsEditor from "./sections/CertificationsEditor";
import ProjectsEditor from "./sections/ProjectsEditor";
import LanguagesEditor from "./sections/LanguagesEditor";

const SECTION_META: Record<string, { label: string; Icon: React.ElementType }> = {
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

const OPTIONAL_SECTIONS: SectionName[] = ["certifications", "projects", "languages"];

// ─── Template thumbnails (Design tab) ──────────────────────────────────────
function TemplateThumbnail({ name }: { name: TemplateName }) {
  const thumbs: Record<TemplateName, React.ReactNode> = {
    modern: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="0" y="0" width="100" height="28" fill="#1d4ed8" />
        <rect x="8" y="8" width="45" height="5" rx="1" fill="rgba(255,255,255,0.9)" />
        <rect x="8" y="16" width="28" height="3" rx="1" fill="rgba(255,255,255,0.6)" />
        <rect x="8" y="34" width="20" height="2" rx="1" fill="#1d4ed8" />
        <rect x="8" y="38" width="84" height="1" fill="#1d4ed8" />
        {[42,48,54,60,66].map((y,i) => <rect key={i} x="8" y={y} width={[72,60,68,55,63][i]} height="2" rx="1" fill="#e2e8f0" />)}
        <rect x="8" y="80" width="20" height="2" rx="1" fill="#1d4ed8" />
        <rect x="8" y="84" width="84" height="1" fill="#1d4ed8" />
        {[88,94,100,106].map((y,i) => <rect key={i} x="8" y={y} width={[50,62,48,55][i]} height="2" rx="1" fill="#e2e8f0" />)}
      </svg>
    ),
    classic: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="20" y="8" width="60" height="6" rx="1" fill="#1a1a1a" />
        <rect x="30" y="16" width="40" height="3" rx="1" fill="#555" />
        <rect x="10" y="22" width="80" height="1.5" fill="#1a1a1a" />
        <rect x="10" y="30" width="22" height="2" rx="1" fill="#1a1a1a" />
        <rect x="10" y="34" width="80" height="1" fill="#1a1a1a" />
        {[38,44,50,56,62].map((y,i) => <rect key={i} x="10" y={y} width={[75,63,70,58,66][i]} height="2" rx="1" fill="#d1d5db" />)}
        <rect x="10" y="76" width="22" height="2" rx="1" fill="#1a1a1a" />
        <rect x="10" y="80" width="80" height="1" fill="#1a1a1a" />
        {[84,90,96].map((y,i) => <rect key={i} x="10" y={y} width={[60,72,55][i]} height="2" rx="1" fill="#d1d5db" />)}
      </svg>
    ),
    minimal: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="8" y="10" width="55" height="7" rx="1" fill="#111" />
        <rect x="8" y="20" width="35" height="3" rx="1" fill="#0f766e" />
        {[32,38,44].map((y,i) => <rect key={i} x="8" y={y} width={[72,60,68][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="8" y="52" width="14" height="1.5" rx="0.5" fill="#9ca3af" />
        {[58,64,70,76].map((y,i) => <rect key={i} x="8" y={y} width={[55,63,48,60][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="8" y="90" width="14" height="1.5" rx="0.5" fill="#9ca3af" />
        {[96,102,108].map((y,i) => <rect key={i} x="8" y={y} width={[45,58,50][i]} height="2" rx="1" fill="#e5e7eb" />)}
      </svg>
    ),
    executive: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="0" y="0" width="32" height="141" fill="#1d4ed8" />
        <circle cx="16" cy="20" r="10" fill="rgba(255,255,255,0.2)" />
        <rect x="4" y="34" width="24" height="3" rx="1" fill="rgba(255,255,255,0.8)" />
        <rect x="6" y="40" width="20" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
        {[56,62,68,74].map((y,i) => <rect key={i} x="4" y={y} width={[24,20,22,18][i]} height="2" rx="1" fill="rgba(255,255,255,0.3)" />)}
        <rect x="38" y="10" width="20" height="2" rx="1" fill="#6b7280" />
        <rect x="38" y="14" width="54" height="1" fill="#e5e7eb" />
        {[18,24,30,36].map((y,i) => <rect key={i} x="38" y={y} width={[55,44,50,42][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="38" y="46" width="20" height="2" rx="1" fill="#6b7280" />
        <rect x="38" y="50" width="54" height="1" fill="#e5e7eb" />
        {[54,60,66].map((y,i) => <rect key={i} x="38" y={y} width={[52,40,48][i]} height="2" rx="1" fill="#e5e7eb" />)}
      </svg>
    ),
    creative: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="0" y="0" width="100" height="34" fill="#7c3aed" />
        <rect x="8" y="9" width="50" height="6" rx="1" fill="rgba(255,255,255,0.95)" />
        <rect x="8" y="18" width="32" height="3" rx="1" fill="rgba(255,255,255,0.65)" />
        <rect x="3" y="42" width="4" height="4" rx="1" fill="#7c3aed" />
        <rect x="10" y="43" width="20" height="2" rx="1" fill="#374151" />
        {[50,56,62].map((y,i) => <rect key={i} x="10" y={y} width={[65,55,60][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="3" y="74" width="4" height="4" rx="1" fill="#7c3aed" />
        <rect x="10" y="75" width="20" height="2" rx="1" fill="#374151" />
        {[82,88,94].map((y,i) => <rect key={i} x="10" y={y} width={[60,70,52][i]} height="2" rx="1" fill="#e5e7eb" />)}
      </svg>
    ),
    compact: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="6" y="6" width="52" height="5" rx="1" fill="#111827" />
        <rect x="6" y="13" width="32" height="2.5" rx="1" fill="#1d4ed8" />
        <rect x="6" y="18" width="84" height="1" fill="#e5e7eb" />
        <rect x="70" y="8" width="22" height="2" rx="0.5" fill="#9ca3af" />
        <rect x="70" y="12" width="22" height="2" rx="0.5" fill="#9ca3af" />
        {/* left col */}
        <rect x="6" y="23" width="16" height="2" rx="0.5" fill="#1d4ed8" />
        {[27,31,35,39].map((y,i) => <rect key={i} x="6" y={y} width={[50,42,48,38][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="6" y="48" width="16" height="2" rx="0.5" fill="#1d4ed8" />
        {[52,56,60].map((y,i) => <rect key={i} x="6" y={y} width={[40,45,35][i]} height="2" rx="1" fill="#e5e7eb" />)}
        {/* right sidebar */}
        <rect x="70" y="23" width="22" height="2" rx="0.5" fill="#1d4ed8" />
        {[27,31,35,39,43].map((y,i) => <rect key={i} x="70" y={y} width={[20,18,22,15,19][i]} height="2" rx="1" fill="#e5e7eb" />)}
      </svg>
    ),
    sharp: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="8" y="8" width="55" height="7" rx="0.5" fill="#111827" />
        <rect x="8" y="17" width="32" height="3" rx="0.5" fill="#1d4ed8" />
        <rect x="8" y="22" width="84" height="3" fill="#1d4ed8" />
        {/* section heads with bar */}
        <rect x="8" y="30" width="3" height="9" rx="1" fill="#1d4ed8" />
        <rect x="13" y="33" width="16" height="2" rx="0.5" fill="#374151" />
        <rect x="32" y="34" width="58" height="1" fill="#e5e7eb" />
        {[40,45,50].map((y,i) => <rect key={i} x="13" y={y} width={[72,62,68][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="8" y="58" width="3" height="9" rx="1" fill="#1d4ed8" />
        <rect x="13" y="61" width="16" height="2" rx="0.5" fill="#374151" />
        <rect x="32" y="62" width="58" height="1" fill="#e5e7eb" />
        {[68,73,78].map((y,i) => <rect key={i} x="13" y={y} width={[60,70,55][i]} height="2" rx="1" fill="#e5e7eb" />)}
      </svg>
    ),
    elegant: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="22" y="8" width="56" height="7" rx="1" fill="#111827" />
        <rect x="30" y="17" width="40" height="3" rx="1" fill="#1d4ed8" />
        <rect x="32" y="22" width="36" height="2" rx="1" fill="#9ca3af" />
        <rect x="10" y="27" width="35" height="1" fill="#e5e7eb" />
        <circle cx="50" cy="27.5" r="2" fill="#1d4ed8" />
        <rect x="55" y="27" width="35" height="1" fill="#e5e7eb" />
        <rect x="35" y="34" width="30" height="2" rx="0.5" fill="#1d4ed8" />
        <rect x="10" y="38" width="30" height="1" fill="#e5e7eb" />
        <circle cx="50" cy="38.5" r="1.5" fill="#1d4ed8" />
        <rect x="60" y="38" width="30" height="1" fill="#e5e7eb" />
        {[44,49,54].map((y,i) => <rect key={i} x={[15,18,12][i]} y={y} width={[70,64,76][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="35" y="62" width="30" height="2" rx="0.5" fill="#1d4ed8" />
        <rect x="10" y="66" width="30" height="1" fill="#e5e7eb" />
        <circle cx="50" cy="66.5" r="1.5" fill="#1d4ed8" />
        <rect x="60" y="66" width="30" height="1" fill="#e5e7eb" />
        {[72,77,82].map((y,i) => <rect key={i} x={[12,18,15][i]} y={y} width={[76,64,70][i]} height="2" rx="1" fill="#e5e7eb" />)}
      </svg>
    ),
    cascade: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        {/* colored left sidebar */}
        <rect x="0" y="0" width="30" height="141" fill="#1d4ed8" />
        {/* name in sidebar */}
        <rect x="3" y="8" width="22" height="5" rx="1" fill="rgba(255,255,255,0.9)" />
        <rect x="3" y="15" width="16" height="2.5" rx="1" fill="rgba(255,255,255,0.55)" />
        {/* contact in sidebar */}
        <rect x="3" y="23" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[27,30,33,36].map((y,i) => <rect key={i} x="3" y={y} width={[22,18,20,15][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.3)" />)}
        {/* skills in sidebar */}
        <rect x="3" y="46" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[50,56,62,68,74].map((y,i) => (
          <g key={i}>
            <rect x="3" y={y} width={[20,16,22,14,18][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.6)" />
            <rect x="3" y={y+3} width="24" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
            <rect x="3" y={y+3} width={[18,12,20,10,16][i]} height="2" rx="1" fill="rgba(255,255,255,0.7)" />
          </g>
        ))}
        {/* main content */}
        <rect x="34" y="8" width="16" height="2" rx="0.5" fill="#1d4ed8" />
        <rect x="34" y="12" width="58" height="1" fill="#e5e7eb" />
        {[16,20,24,28,32].map((y,i) => <rect key={i} x="34" y={y} width={[55,48,52,42,50][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        <rect x="34" y="40" width="16" height="2" rx="0.5" fill="#1d4ed8" />
        <rect x="34" y="44" width="58" height="1" fill="#e5e7eb" />
        {[48,52,56,60].map((y,i) => <rect key={i} x="34" y={y} width={[45,52,40,48][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
      </svg>
    ),
    cubic: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        {/* dark full-width header */}
        <rect x="0" y="0" width="100" height="26" fill="#111827" />
        <rect x="6" y="7" width="40" height="6" rx="1" fill="#fff" />
        <rect x="6" y="15" width="24" height="2.5" rx="1" fill="#1d4ed8" />
        <rect x="62" y="8" width="28" height="2" rx="0.5" fill="#6b7280" />
        <rect x="62" y="12" width="28" height="2" rx="0.5" fill="#6b7280" />
        <rect x="62" y="16" width="28" height="2" rx="0.5" fill="#6b7280" />
        {/* main left col */}
        {/* section head with dot */}
        <rect x="6" y="30" width="5" height="5" rx="1" fill="#1d4ed8" />
        <rect x="13" y="32" width="16" height="2" rx="0.5" fill="#374151" />
        <rect x="32" y="33" width="34" height="1" fill="#e5e7eb" />
        {[38,43,48,53,58].map((y,i) => <rect key={i} x="6" y={y} width={[55,48,52,42,50][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        <rect x="6" y="65" width="5" height="5" rx="1" fill="#1d4ed8" />
        <rect x="13" y="67" width="16" height="2" rx="0.5" fill="#374151" />
        <rect x="32" y="68" width="34" height="1" fill="#e5e7eb" />
        {[73,78,83].map((y,i) => <rect key={i} x="6" y={y} width={[45,52,40][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        {/* right gray sidebar */}
        <rect x="72" y="26" width="28" height="115" fill="#f9fafb" />
        <rect x="74" y="30" width="10" height="1.5" rx="0.5" fill="#1d4ed8" />
        {[35,41,47,53,59].map((y,i) => (
          <g key={i}>
            <rect x="74" y={y} width={[20,16,22,14,18][i]} height="1.5" rx="0.5" fill="#d1d5db" />
            <rect x="74" y={y+3} width="22" height="2.5" rx="1" fill="#e5e7eb" />
            <rect x="74" y={y+3} width={[16,12,18,10,14][i]} height="2.5" rx="1" fill="#1d4ed8" />
          </g>
        ))}
        <rect x="74" y="68" width="10" height="1.5" rx="0.5" fill="#1d4ed8" />
        {[73,79,85].map((y,i) => <rect key={i} x="74" y={y} width={[20,16,18][i]} height="1.5" rx="0.5" fill="#d1d5db" />)}
      </svg>
    ),
    nanica: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        {/* clean header */}
        <rect x="8" y="8" width="60" height="8" rx="1" fill="#111827" />
        <rect x="8" y="18" width="35" height="3" rx="1" fill="#1d4ed8" />
        <rect x="8" y="23" width="84" height="1.5" rx="0.5" fill="#9ca3af" />
        {/* thick accent line */}
        <rect x="8" y="28" width="84" height="3" rx="1" fill="#1d4ed8" />
        {/* sections */}
        <rect x="8" y="36" width="20" height="2" rx="0.5" fill="#111827" />
        <rect x="8" y="40" width="84" height="1" fill="#e5e7eb" />
        {[44,49,54,59].map((y,i) => <rect key={i} x="8" y={y} width={[75,65,70,60][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        <rect x="8" y="66" width="20" height="2" rx="0.5" fill="#111827" />
        <rect x="8" y="70" width="84" height="1" fill="#e5e7eb" />
        {[74,79,84].map((y,i) => <rect key={i} x="8" y={y} width={[60,72,55][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        <rect x="8" y="92" width="20" height="2" rx="0.5" fill="#111827" />
        <rect x="8" y="96" width="84" height="1" fill="#e5e7eb" />
        {[100,105,110].map((y,i) => <rect key={i} x="8" y={y} width={[40,50,35][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
      </svg>
    ),
    enfold: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        {/* color header bar */}
        <rect x="0" y="0" width="100" height="20" fill="#1d4ed8" />
        <rect x="6" y="6" width="42" height="5" rx="1" fill="rgba(255,255,255,0.95)" />
        <rect x="6" y="13" width="26" height="2.5" rx="1" fill="rgba(255,255,255,0.55)" />
        {/* left sidebar slightly darker */}
        <rect x="0" y="20" width="28" height="121" fill="#1a44c8" />
        {/* contact */}
        <rect x="3" y="24" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[28,32,36,40].map((y,i) => <rect key={i} x="3" y={y} width={[22,16,20,14][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.3)" />)}
        {/* skills */}
        <rect x="3" y="50" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[55,62,69,76,83].map((y,i) => (
          <g key={i}>
            <rect x="3" y={y} width={[20,14,22,12,18][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.6)" />
            <rect x="3" y={y+3} width="22" height="2" rx="1" fill="rgba(255,255,255,0.12)" />
            <rect x="3" y={y+3} width={[16,10,18,8,14][i]} height="2" rx="1" fill="rgba(255,255,255,0.65)" />
          </g>
        ))}
        {/* summary box */}
        <rect x="31" y="23" width="65" height="16" rx="1" fill="#f9fafb" />
        <rect x="33" y="25" width="20" height="1.5" rx="0.5" fill="#1d4ed8" />
        {[29,33,35].map((y,i) => <rect key={i} x="33" y={y} width={[58,50,55][i]} height="1.5" rx="0.5" fill="#d1d5db" />)}
        {/* main content */}
        <rect x="31" y="44" width="14" height="2" rx="0.5" fill="#374151" />
        <rect x="31" y="48" width="65" height="1" fill="#e5e7eb" />
        {[52,57,62,67].map((y,i) => <rect key={i} x="31" y={y} width={[58,50,55,45][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        <rect x="31" y="76" width="14" height="2" rx="0.5" fill="#374151" />
        <rect x="31" y="80" width="65" height="1" fill="#e5e7eb" />
        {[84,89,94].map((y,i) => <rect key={i} x="31" y={y} width={[50,58,45][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
      </svg>
    ),
  };
  return <>{thumbs[name]}</>;
}

// ─── Static section row (personalInfo — not draggable) ──────────────────────
function StaticSectionRow({ id }: { id: string }) {
  const { activeSection, setActiveSection } = useResumeStore();
  const { label, Icon } = SECTION_META[id];
  const isOpen = activeSection === id;
  const Editor = SECTION_EDITORS[id];

  return (
    <div>
      <button
        onClick={() => setActiveSection(id as SectionName)}
        className={`group w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all relative ${
          isOpen ? "bg-stone-50 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
        }`}
      >
        {isOpen && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-stone-900" />}
        <span className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
          isOpen ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
        }`}>
          <Icon size={13} strokeWidth={2} />
        </span>
        <span className="flex-1 text-[13px] font-medium">{label}</span>
        <ChevronRight size={14} className={`text-stone-300 transition-transform duration-200 ${isOpen ? "rotate-90" : "group-hover:text-stone-400"}`} />
      </button>
      {isOpen && Editor && (
        <div className="border-t border-b border-stone-100 bg-stone-50/60">
          <Editor />
        </div>
      )}
    </div>
  );
}

// ─── Draggable section row ──────────────────────────────────────────────────
function SortableSectionRow({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const { data, activeSection, setActiveSection, removeSection, removeCustomSection } = useResumeStore();

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const isCustom = !(id in SECTION_META);
  const customSection = isCustom ? (data.customSections ?? []).find((s) => s.id === id) : null;
  const label = isCustom ? (customSection?.title || "Custom Section") : SECTION_META[id].label;
  const Icon = isCustom ? Layers : SECTION_META[id].Icon;

  const isOpen = activeSection === id;
  const isOptional = isCustom || OPTIONAL_SECTIONS.includes(id as SectionName);
  const Editor = isCustom ? CustomSectionEditor : SECTION_EDITORS[id];

  let count: number | null = null;
  if (isCustom) {
    count = customSection?.items.length ?? 0;
  } else {
    const arr = data[id as keyof typeof data];
    count = Array.isArray(arr) ? (arr as unknown[]).length : null;
  }

  function handleRemove() {
    if (activeSection === id) setActiveSection(null);
    if (isCustom) removeCustomSection(id);
    else removeSection(id as SectionName);
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className={`group relative flex items-center transition-colors ${isOpen ? "bg-stone-50" : "hover:bg-stone-50"}`}>
        {isOpen && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-stone-900 z-10" />}

        {/* Drag handle — always visible, clear affordance */}
        <button
          {...listeners}
          tabIndex={-1}
          title="Drag to reorder"
          className="shrink-0 pl-2.5 pr-1 py-3 cursor-grab active:cursor-grabbing touch-none text-stone-400 hover:text-stone-600 transition-colors"
        >
          <GripVertical size={15} />
        </button>

        {/* Section toggle */}
        <button
          onClick={() => setActiveSection(id)}
          className={`flex-1 flex items-center gap-2.5 py-2.5 pr-2 text-left transition-colors min-w-0 ${
            isOpen ? "text-stone-900" : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <span className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors shrink-0 ${
            isOpen ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-stone-200"
          }`}>
            <Icon size={13} strokeWidth={2} />
          </span>
          <span className="flex-1 text-[13px] font-medium truncate">{label}</span>
          {count !== null && count > 0 && (
            <span className="text-[10px] font-bold text-stone-400 bg-stone-100 rounded-full px-2 py-0.5 min-w-[20px] text-center shrink-0">
              {count}
            </span>
          )}
          {count === 0 && (
            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shrink-0">
              Empty
            </span>
          )}
          <ChevronRight size={14} className={`text-stone-300 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-90" : ""}`} />
        </button>

        {/* Remove — optional + custom sections */}
        {isOptional && (
          <button
            onClick={handleRemove}
            title={`Remove ${label}`}
            className="opacity-0 group-hover:opacity-100 mr-2 w-5 h-5 flex items-center justify-center rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {isOpen && Editor && (
        <div className="border-t border-b border-stone-100 bg-stone-50/60">
          <Editor />
        </div>
      )}
    </div>
  );
}

// ─── Main sidebar ───────────────────────────────────────────────────────────
export default function EditorSidebar() {
  const [activeTab, setActiveTab] = useState<"content" | "design">("content");
  const [newSectionName, setNewSectionName] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  const {
    data, config, activeSection, setActiveSection,
    addSection, reorderSections, addCustomSection,
    setTemplate, setAccentColor, setFontScale, setFontFamily,
  } = useResumeStore();

  const { score, tips } = scoreResume(data);
  const scoreCol = scoreColor(score);
  const hiddenOptional = OPTIONAL_SECTIONS.filter((s) => !data.sectionOrder.includes(s));
  const doneTips = tips.filter((t) => t.done);
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIdx = data.sectionOrder.indexOf(active.id as string);
    const newIdx = data.sectionOrder.indexOf(over.id as string);
    if (oldIdx !== -1 && newIdx !== -1) {
      reorderSections(arrayMove(data.sectionOrder, oldIdx, newIdx));
    }
  }

  const fontPct = Math.round((config.fontScale ?? 1) * 100);

  return (
    <aside className="bg-white flex flex-col h-full overflow-hidden">

      {/* Score header */}
      <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3 shrink-0">
        <div className="relative w-11 h-11 shrink-0">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={radius} fill="none" stroke="#f5f5f4" strokeWidth="3.5" />
            <circle cx="22" cy="22" r={radius} fill="none" stroke={scoreCol} strokeWidth="3.5"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dasharray 0.4s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color: scoreCol }}>
            {score}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-stone-800">Resume Score</div>
          <div className="text-[11px] text-stone-400 mt-0.5">{doneTips.length}/{tips.length} checks passed</div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex shrink-0 border-b border-stone-100">
        {(["content", "design"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[12px] font-semibold transition-colors capitalize ${
              activeTab === tab
                ? "text-stone-900 border-b-2 border-stone-900 -mb-px"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── CONTENT TAB ── */}
      {activeTab === "content" && (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="py-1 px-3 pt-3">
              {/* Resume upload */}
              <ResumeUpload />
            </div>

            <div className="py-1">
              {/* Personal info — always first, not draggable */}
              <StaticSectionRow id="personalInfo" />

              {/* Sortable sections */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={data.sectionOrder} strategy={verticalListSortingStrategy}>
                  {data.sectionOrder.map((key) => (
                    <SortableSectionRow key={key} id={key} />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add section panel */}
              <div className="mx-3 mt-3 mb-2">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1 mb-2">Add section</p>
                <div className="flex flex-col gap-1">
                  {/* Optional predefined sections */}
                  {hiddenOptional.map((sec) => {
                    const { label, Icon } = SECTION_META[sec];
                    return (
                      <button
                        key={sec}
                        onClick={() => addSection(sec)}
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

                  {/* Custom section */}
                  {addingCustom ? (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 bg-white">
                      <Layers size={12} className="text-stone-400 shrink-0" />
                      <input
                        autoFocus
                        className="flex-1 text-[12px] outline-none placeholder-stone-300"
                        placeholder="Section name…"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newSectionName.trim()) {
                            addCustomSection(newSectionName.trim());
                            setNewSectionName("");
                            setAddingCustom(false);
                          }
                          if (e.key === "Escape") {
                            setNewSectionName("");
                            setAddingCustom(false);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newSectionName.trim()) {
                            addCustomSection(newSectionName.trim());
                            setNewSectionName("");
                          }
                          setAddingCustom(false);
                        }}
                        className="text-[10px] font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded px-2 py-0.5 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setNewSectionName(""); setAddingCustom(false); }}
                        className="text-stone-300 hover:text-stone-500"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingCustom(true)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700 hover:bg-white transition-all"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-stone-100 group-hover:bg-stone-200 transition-colors shrink-0">
                        <Layers size={12} strokeWidth={2} className="text-stone-500" />
                      </span>
                      <span className="flex-1 text-[12px] font-medium text-left">Custom Section</span>
                      <Plus size={12} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
                    </button>
                  )}
                </div>

                {hiddenOptional.length === 0 && (
                  <p className="text-[10px] text-stone-300 text-center pt-2">
                    All built-in sections added · hover to remove
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ATS checklist footer */}
          <div className="border-t border-stone-100 bg-white shrink-0">
            <div className="px-4 py-2.5">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Checklist</p>
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {tips.map((tip) => (
                  <div key={tip.key} className="flex items-start gap-2">
                    {tip.done
                      ? <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                      : <Circle size={12} className="text-stone-300 mt-0.5 shrink-0" />
                    }
                    <span className={`text-[11px] leading-tight ${tip.done ? "text-stone-300 line-through" : "text-stone-500"}`}>
                      {tip.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DESIGN TAB ── */}
      {activeTab === "design" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

          {/* Template picker */}
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Template</p>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(TEMPLATE_META) as TemplateName[]).map((t) => (
                <button key={t} onClick={() => setTemplate(t)} className="relative flex flex-col items-center gap-1.5 group">
                  <div className={`w-full aspect-[1/1.414] rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                    config.template === t ? "border-stone-900 shadow-md" : "border-stone-200 hover:border-stone-400"
                  }`}>
                    <TemplateThumbnail name={t} />
                  </div>
                  <span className={`text-[9px] font-medium transition-colors ${
                    config.template === t ? "text-stone-900" : "text-stone-400 group-hover:text-stone-600"
                  }`}>
                    {TEMPLATE_META[t].label}
                  </span>
                  {config.template === t && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 rounded-full flex items-center justify-center shadow">
                      <Check size={9} color="white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color palette */}
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  title={c}
                  className={`w-6 h-6 rounded-full transition-all duration-150 hover:scale-110 active:scale-100 ${
                    config.accentColor === c ? "scale-110 ring-2 ring-offset-2 ring-stone-400" : ""
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {config.accentColor === c && (
                    <Check size={11} color="white" className="mx-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Font Size</p>
              <span className="text-[11px] font-semibold text-stone-600">{fontPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 font-medium w-5 shrink-0">A</span>
              <input
                type="range"
                min={0.8}
                max={1.3}
                step={0.05}
                value={config.fontScale ?? 1}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                className="flex-1 h-1.5 appearance-none rounded-full bg-stone-200 accent-stone-900 cursor-pointer"
              />
              <span className="text-[13px] text-stone-400 font-medium w-5 shrink-0 text-right">A</span>
            </div>
            <p className="text-[10px] text-stone-300 mt-1.5">Scales text size · page dimensions stay fixed</p>
          </div>

          {/* Font family */}
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Font Style</p>
            <div className="flex flex-col gap-1.5">
              {(Object.entries(FONT_OPTIONS) as [FontOption, typeof FONT_OPTIONS[FontOption]][]).map(([key, opt]) => {
                const isActive = (config.fontFamily ?? "inter") === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFontFamily(key)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                      isActive
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <span
                      className={`text-[13px] font-medium ${isActive ? "text-white" : "text-stone-800"}`}
                      style={{ fontFamily: opt.css }}
                    >
                      {opt.label}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"
                    }`}>
                      {opt.serif ? "Serif" : "Sans"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </aside>
  );
}
