"use client";

import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2 } from "lucide-react";
import type { Education } from "@/lib/resume/types";

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

function EducationItem({ edu, index }: { edu: Education; index: number }) {
  const { updateEducation, removeEducation } = useResumeStore();
  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
        <span className="text-[12px] font-semibold text-stone-700">{edu.institution || `Education ${index + 1}`}</span>
        <button onClick={() => removeEducation(edu.id)} className="w-6 h-6 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="col-span-2"><Field label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, { institution: v })} placeholder="UC Berkeley" /></div>
        <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, { degree: v })} placeholder="B.S." />
        <Field label="Field of Study" value={edu.field} onChange={(v) => updateEducation(edu.id, { field: v })} placeholder="Computer Science" />
        <Field label="Location" value={edu.location} onChange={(v) => updateEducation(edu.id, { location: v })} placeholder="Berkeley, CA" />
        <Field label="GPA" value={edu.gpa} onChange={(v) => updateEducation(edu.id, { gpa: v })} placeholder="3.8 (optional)" />
        <Field label="Start Date" value={edu.startDate} onChange={(v) => updateEducation(edu.id, { startDate: v })} type="month" />
        <Field label="End Date" value={edu.endDate} onChange={(v) => updateEducation(edu.id, { endDate: v })} type="month" />
      </div>
    </div>
  );
}

export default function EducationEditor() {
  const { data, addEducation } = useResumeStore();
  return (
    <div className="p-4 flex flex-col gap-3">
      {data.education.length === 0 && <p className="text-[12px] text-stone-400 text-center py-6">No education added yet.</p>}
      {data.education.map((edu, i) => <EducationItem key={edu.id} edu={edu} index={i} />)}
      <button onClick={addEducation} className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-200 rounded-xl text-[13px] text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-medium">
        <Plus size={14} /> Add Education
      </button>
    </div>
  );
}
