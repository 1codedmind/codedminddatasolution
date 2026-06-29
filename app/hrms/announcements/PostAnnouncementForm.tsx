"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Department } from "@/lib/hrms/departments";

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors";

export default function PostAnnouncementForm({ departments }: { departments: Pick<Department, "id" | "name">[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");

    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get("title") as string,
      body: fd.get("body") as string,
      audience: fd.get("audience") as string,
      departmentId: fd.get("departmentId") as string || undefined,
      isPinned: fd.get("isPinned") === "on",
      expiresAt: fd.get("expiresAt") as string || undefined,
    };

    const res = await fetch("/api/hrms/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    setOpen(false);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] transition-colors"
      >
        + Post announcement
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">New announcement</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-stone-500 hover:text-stone-300">✕</button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input type="text" name="title" required placeholder="Company update…" className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
          Body <span className="text-red-400">*</span>
        </label>
        <textarea name="body" required rows={5} placeholder="Write the full announcement…" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Audience</label>
          <select name="audience" className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors">
            <option value="all">All employees</option>
            <option value="admins">Admins only</option>
            <option value="employees">Employees only</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Department (optional)</label>
          <select name="departmentId" className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors">
            <option value="">— All departments —</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Expires (optional)</label>
          <input type="date" name="expiresAt" className={inputCls} />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input type="checkbox" name="isPinned" id="isPinned" className="accent-[#C87660]" />
          <label htmlFor="isPinned" className="text-sm text-stone-300 cursor-pointer">Pin to top</label>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#C87660] rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors">
          {loading ? "Posting…" : "Post"}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="px-5 py-2.5 text-sm text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
