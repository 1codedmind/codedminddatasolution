"use client";

import { useResumeStore } from "@/store/resumeStore";
import { TEMPLATE_META, ACCENT_COLORS } from "@/lib/resume/types";
import type { TemplateName } from "@/lib/resume/types";
import { Check, X } from "lucide-react";

interface Props { onClose: () => void; }

function TemplateThumbnail({ template }: { template: TemplateName }) {
  const thumbnails: Record<TemplateName, React.ReactNode> = {
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
        <rect x="8" y="26" width="84" height="1" fill="#f3f4f6" />
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
        <rect x="4" y="52" width="12" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
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
        <rect x="8" y="24" width="84" height="2" rx="1" fill="rgba(255,255,255,0.25)" />
        <rect x="3" y="42" width="4" height="4" rx="1" fill="#7c3aed" />
        <rect x="10" y="43" width="20" height="2" rx="1" fill="#374151" />
        {[50,56,62].map((y,i) => <rect key={i} x="10" y={y} width={[65,55,60][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="3" y="74" width="4" height="4" rx="1" fill="#7c3aed" />
        <rect x="10" y="75" width="20" height="2" rx="1" fill="#374151" />
        {[82,88,94].map((y,i) => <rect key={i} x="10" y={y} width={[60,70,52][i]} height="2" rx="1" fill="#e5e7eb" />)}
      </svg>
    ),
  };
  return thumbnails[template];
}

export default function TemplateSelector({ onClose }: Props) {
  const { config, setTemplate, setAccentColor } = useResumeStore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-900">Templates & Colors</h2>
            <p className="text-[11px] text-stone-400 mt-0.5">Choose a layout and accent color</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Templates grid */}
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Template</p>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(TEMPLATE_META) as TemplateName[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`relative flex flex-col items-center gap-1.5 group`}
                >
                  <div className={`w-full aspect-[1/1.414] rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                    config.template === t
                      ? "border-stone-900 shadow-md"
                      : "border-stone-200 hover:border-stone-400"
                  }`}>
                    <TemplateThumbnail template={t} />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${
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
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  title={c}
                  className={`w-7 h-7 rounded-full transition-all duration-150 hover:scale-110 active:scale-100 ${
                    config.accentColor === c ? "scale-110 ring-2 ring-offset-2 ring-stone-400" : ""
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {config.accentColor === c && (
                    <Check size={13} color="white" className="mx-auto drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-5 pb-5">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-stone-950 text-white rounded-xl hover:bg-stone-800 active:scale-[0.98] transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
