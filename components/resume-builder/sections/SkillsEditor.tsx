"use client";

import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2 } from "lucide-react";

const LEVELS = ["", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"] as const;

export default function SkillsEditor() {
  const { data, addSkill, updateSkill, removeSkill } = useResumeStore();

  return (
    <div className="p-4 flex flex-col gap-2">
      {data.skills.length === 0 && (
        <p className="text-[12px] text-stone-400 text-center py-6">No skills added yet.</p>
      )}

      {data.skills.map((sk) => (
        <div key={sk.id} className="flex items-center gap-3 bg-white border border-stone-200 rounded-lg px-3 py-2.5 group">
          <input
            value={sk.name}
            onChange={(e) => updateSkill(sk.id, { name: e.target.value })}
            placeholder="e.g. TypeScript"
            className="flex-1 text-[13px] bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-300 min-w-0"
          />

          {/* Level dots */}
          <div className="flex items-center gap-1 shrink-0">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                title={LEVELS[lvl]}
                onClick={() => updateSkill(sk.id, { level: lvl })}
                className={`w-3 h-3 rounded-full transition-all ${
                  sk.level >= lvl
                    ? "bg-stone-800 scale-100"
                    : "bg-stone-200 hover:bg-stone-400 scale-90 hover:scale-100"
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] text-stone-400 w-16 text-right shrink-0 tabular-nums">{LEVELS[sk.level]}</span>

          <button
            onClick={() => removeSkill(sk.id)}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-stone-300 hover:text-red-500 transition-all shrink-0"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      <button
        onClick={addSkill}
        className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-200 rounded-xl text-[13px] text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-medium mt-1"
      >
        <Plus size={14} /> Add Skill
      </button>
    </div>
  );
}
