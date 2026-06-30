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
    compact: (
      <svg viewBox="0 0 100 141" className="w-full h-full">
        <rect width="100" height="141" fill="#fff" />
        <rect x="6" y="6" width="52" height="5" rx="1" fill="#111827" />
        <rect x="6" y="13" width="32" height="2.5" rx="1" fill="#1d4ed8" />
        <rect x="6" y="18" width="84" height="1" fill="#e5e7eb" />
        <rect x="70" y="8" width="22" height="2" rx="0.5" fill="#9ca3af" />
        <rect x="70" y="12" width="22" height="2" rx="0.5" fill="#9ca3af" />
        <rect x="6" y="23" width="16" height="2" rx="0.5" fill="#1d4ed8" />
        {[27,31,35,39].map((y,i) => <rect key={i} x="6" y={y} width={[50,42,48,38][i]} height="2" rx="1" fill="#e5e7eb" />)}
        <rect x="6" y="48" width="16" height="2" rx="0.5" fill="#1d4ed8" />
        {[52,56,60].map((y,i) => <rect key={i} x="6" y={y} width={[40,45,35][i]} height="2" rx="1" fill="#e5e7eb" />)}
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
        <rect x="0" y="0" width="30" height="141" fill="#1d4ed8" />
        <rect x="3" y="8" width="22" height="5" rx="1" fill="rgba(255,255,255,0.9)" />
        <rect x="3" y="15" width="16" height="2.5" rx="1" fill="rgba(255,255,255,0.55)" />
        <rect x="3" y="23" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[27,30,33,36].map((y,i) => <rect key={i} x="3" y={y} width={[22,18,20,15][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.3)" />)}
        <rect x="3" y="46" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[50,56,62,68,74].map((y,i) => (
          <g key={i}>
            <rect x="3" y={y} width={[20,16,22,14,18][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.6)" />
            <rect x="3" y={y+3} width="24" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
            <rect x="3" y={y+3} width={[18,12,20,10,16][i]} height="2" rx="1" fill="rgba(255,255,255,0.7)" />
          </g>
        ))}
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
        <rect x="0" y="0" width="100" height="26" fill="#111827" />
        <rect x="6" y="7" width="40" height="6" rx="1" fill="#fff" />
        <rect x="6" y="15" width="24" height="2.5" rx="1" fill="#1d4ed8" />
        <rect x="62" y="8" width="28" height="2" rx="0.5" fill="#6b7280" />
        <rect x="62" y="12" width="28" height="2" rx="0.5" fill="#6b7280" />
        <rect x="62" y="16" width="28" height="2" rx="0.5" fill="#6b7280" />
        <rect x="6" y="30" width="5" height="5" rx="1" fill="#1d4ed8" />
        <rect x="13" y="32" width="16" height="2" rx="0.5" fill="#374151" />
        <rect x="32" y="33" width="34" height="1" fill="#e5e7eb" />
        {[38,43,48,53,58].map((y,i) => <rect key={i} x="6" y={y} width={[55,48,52,42,50][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        <rect x="6" y="65" width="5" height="5" rx="1" fill="#1d4ed8" />
        <rect x="13" y="67" width="16" height="2" rx="0.5" fill="#374151" />
        <rect x="32" y="68" width="34" height="1" fill="#e5e7eb" />
        {[73,78,83].map((y,i) => <rect key={i} x="6" y={y} width={[45,52,40][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
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
        <rect x="8" y="8" width="60" height="8" rx="1" fill="#111827" />
        <rect x="8" y="18" width="35" height="3" rx="1" fill="#1d4ed8" />
        <rect x="8" y="23" width="84" height="1.5" rx="0.5" fill="#9ca3af" />
        <rect x="8" y="28" width="84" height="3" rx="1" fill="#1d4ed8" />
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
        <rect x="0" y="0" width="100" height="20" fill="#1d4ed8" />
        <rect x="6" y="6" width="42" height="5" rx="1" fill="rgba(255,255,255,0.95)" />
        <rect x="6" y="13" width="26" height="2.5" rx="1" fill="rgba(255,255,255,0.55)" />
        <rect x="0" y="20" width="28" height="121" fill="#1a44c8" />
        <rect x="3" y="24" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[28,32,36,40].map((y,i) => <rect key={i} x="3" y={y} width={[22,16,20,14][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.3)" />)}
        <rect x="3" y="50" width="8" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
        {[55,62,69,76,83].map((y,i) => (
          <g key={i}>
            <rect x="3" y={y} width={[20,14,22,12,18][i]} height="1.5" rx="0.5" fill="rgba(255,255,255,0.6)" />
            <rect x="3" y={y+3} width="22" height="2" rx="1" fill="rgba(255,255,255,0.12)" />
            <rect x="3" y={y+3} width={[16,10,18,8,14][i]} height="2" rx="1" fill="rgba(255,255,255,0.65)" />
          </g>
        ))}
        <rect x="31" y="23" width="65" height="16" rx="1" fill="#f9fafb" />
        <rect x="33" y="25" width="20" height="1.5" rx="0.5" fill="#1d4ed8" />
        {[29,33,35].map((y,i) => <rect key={i} x="33" y={y} width={[58,50,55][i]} height="1.5" rx="0.5" fill="#d1d5db" />)}
        <rect x="31" y="44" width="14" height="2" rx="0.5" fill="#374151" />
        <rect x="31" y="48" width="65" height="1" fill="#e5e7eb" />
        {[52,57,62,67].map((y,i) => <rect key={i} x="31" y={y} width={[58,50,55,45][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
        <rect x="31" y="76" width="14" height="2" rx="0.5" fill="#374151" />
        <rect x="31" y="80" width="65" height="1" fill="#e5e7eb" />
        {[84,89,94].map((y,i) => <rect key={i} x="31" y={y} width={[50,58,45][i]} height="1.5" rx="0.5" fill="#e5e7eb" />)}
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
