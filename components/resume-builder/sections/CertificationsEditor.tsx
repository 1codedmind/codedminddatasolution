"use client";

import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2 } from "lucide-react";

const inputCls = "w-full px-3 py-2 text-[13px] bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all";
const labelCls = "block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider";

export default function CertificationsEditor() {
  const { data, addCertification, updateCertification, removeCertification } = useResumeStore();

  return (
    <div className="p-4 flex flex-col gap-3">
      {data.certifications.length === 0 && <p className="text-[12px] text-stone-400 text-center py-6">No certifications added yet.</p>}

      {data.certifications.map((c, i) => (
        <div key={c.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200">
            <span className="text-[12px] font-semibold text-stone-700">{c.name || `Certification ${i + 1}`}</span>
            <button onClick={() => removeCertification(c.id)} className="w-6 h-6 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
              <Trash2 size={13} />
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Certification Name</label>
              <input value={c.name} onChange={(e) => updateCertification(c.id, { name: e.target.value })} placeholder="AWS Certified Solutions Architect" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Issuing Organization</label>
              <input value={c.issuer} onChange={(e) => updateCertification(c.id, { issuer: e.target.value })} placeholder="Amazon Web Services" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date Issued</label>
              <input type="month" value={c.date} onChange={(e) => updateCertification(c.id, { date: e.target.value })} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Credential URL (optional)</label>
              <input value={c.url} onChange={(e) => updateCertification(c.id, { url: e.target.value })} placeholder="https://..." className={inputCls} />
            </div>
          </div>
        </div>
      ))}

      <button onClick={addCertification} className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-200 rounded-xl text-[13px] text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-all font-medium">
        <Plus size={14} /> Add Certification
      </button>
    </div>
  );
}
