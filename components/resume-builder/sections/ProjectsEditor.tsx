"use client";

import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2 } from "lucide-react";
import type { Project } from "@/lib/resume/types";

const inputCls = "w-full px-3 py-2 text-[13px] bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all";
const labelCls = "block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider";

function ProjectItem({ proj, index }: { proj: Project; index: number }) {
  const { updateProject, removeProject, addProjectBullet, updateProjectBullet, removeProjectBullet } = useResumeStore();
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
        <span className="text-[12px] font-semibold text-stone-700">{proj.name || `Project ${index + 1}`}</span>
        <button onClick={() => removeProject(proj.id)} className="w-6 h-6 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className={labelCls}>Project Name</label>
          <input value={proj.name} onChange={(e) => updateProject(proj.id, { name: e.target.value })} placeholder="My Awesome Project" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>URL (optional)</label>
          <input value={proj.url} onChange={(e) => updateProject(proj.id, { url: e.target.value })} placeholder="github.com/username/project" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea value={proj.description} onChange={(e) => updateProject(proj.id, { description: e.target.value })} placeholder="Brief description of what you built…" rows={2}
            className="w-full px-3 py-2 text-[13px] bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 resize-none transition-all" />
        </div>
        <div>
          <label className={labelCls}>Key Highlights</label>
          <div className="flex flex-col gap-2">
            {proj.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-2.5 text-[10px] text-stone-400 shrink-0">•</span>
                <input value={b} onChange={(e) => updateProjectBullet(proj.id, i, e.target.value)} placeholder="Built with React and Node.js…" className={inputCls} />
                {proj.bullets.length > 1 && (
                  <button onClick={() => removeProjectBullet(proj.id, i)} className="mt-2 w-5 h-5 flex items-center justify-center text-stone-300 hover:text-red-500 transition-all shrink-0">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addProjectBullet(proj.id)} className="self-start text-[12px] text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1.5 transition-colors">
              <Plus size={12} /> Add bullet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsEditor() {
  const { data, addProject } = useResumeStore();
  return (
    <div className="p-4 flex flex-col gap-3">
      {data.projects.length === 0 && <p className="text-[12px] text-stone-400 text-center py-6">No projects added yet.</p>}
      {data.projects.map((proj, i) => <ProjectItem key={proj.id} proj={proj} index={i} />)}
      <button onClick={addProject} className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-200 rounded-xl text-[13px] text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-medium">
        <Plus size={14} /> Add Project
      </button>
    </div>
  );
}
