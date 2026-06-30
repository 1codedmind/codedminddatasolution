"use client";

import { useResumeStore } from "@/store/resumeStore";

function Field({ label, value, onChange, placeholder, type = "text", span2 = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-[13px] bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
      />
    </div>
  );
}

export default function PersonalInfoEditor() {
  const { data, updatePersonalInfo } = useResumeStore();
  const p = data.personalInfo;

  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      <Field span2 label="Full Name" value={p.fullName} onChange={(v) => updatePersonalInfo({ fullName: v })} placeholder="Alex Johnson" />
      <Field span2 label="Job Title" value={p.jobTitle} onChange={(v) => updatePersonalInfo({ jobTitle: v })} placeholder="Senior Software Engineer" />
      <Field label="Email" value={p.email} onChange={(v) => updatePersonalInfo({ email: v })} placeholder="alex@email.com" type="email" />
      <Field label="Phone" value={p.phone} onChange={(v) => updatePersonalInfo({ phone: v })} placeholder="+1 (555) 000-0000" />
      <Field span2 label="Location" value={p.location} onChange={(v) => updatePersonalInfo({ location: v })} placeholder="San Francisco, CA" />
      <Field span2 label="LinkedIn" value={p.linkedin} onChange={(v) => updatePersonalInfo({ linkedin: v })} placeholder="linkedin.com/in/yourname" />
      <Field span2 label="Website" value={p.website} onChange={(v) => updatePersonalInfo({ website: v })} placeholder="yoursite.com" />
    </div>
  );
}
