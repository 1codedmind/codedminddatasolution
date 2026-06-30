"use client";

import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2 } from "lucide-react";
import { LANGUAGE_LEVELS } from "@/lib/resume/types";

export default function LanguagesEditor() {
  const { data, addLanguage, updateLanguage, removeLanguage } = useResumeStore();

  return (
    <div className="p-4 flex flex-col gap-2">
      {data.languages.length === 0 && <p className="text-[12px] text-stone-400 text-center py-6">No languages added yet.</p>}

      {data.languages.map((l) => (
        <div key={l.id} className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-lg px-3 py-2.5 group">
          <input
            value={l.name}
            onChange={(e) => updateLanguage(l.id, { name: e.target.value })}
            placeholder="e.g. English"
            className="flex-1 text-[13px] bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-300 min-w-0"
          />
          <select
            value={l.level}
            onChange={(e) => updateLanguage(l.id, { level: e.target.value })}
            className="text-[12px] border border-stone-200 rounded-md px-2 py-1 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all shrink-0"
          >
            {LANGUAGE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <button
            onClick={() => removeLanguage(l.id)}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-stone-300 hover:text-red-500 transition-all shrink-0"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      <button
        onClick={addLanguage}
        className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-200 rounded-xl text-[13px] text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-medium mt-1"
      >
        <Plus size={14} /> Add Language
      </button>
    </div>
  );
}
