"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AssetCategory } from "@/lib/hrms/assets";

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors";

export default function AddAssetForm({ categories }: { categories: AssetCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");

    const fd = new FormData(e.currentTarget);
    const body: Record<string, string | number | undefined> = {};
    for (const [k, v] of fd.entries()) {
      if (typeof v === "string" && v.trim()) body[k] = v.trim();
    }
    if (body.purchasePrice) body.purchasePrice = Number(body.purchasePrice);

    const res = await fetch("/api/hrms/assets", {
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
        + Add asset
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Add new asset</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-stone-500 hover:text-stone-300 text-sm">✕</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Asset name <span className="text-red-400">*</span></label>
          <input type="text" name="name" required placeholder="MacBook Pro 14&quot;" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Category</label>
          <select name="categoryId" className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors">
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Serial number</label>
          <input type="text" name="serialNumber" placeholder="SN123456" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Purchase date</label>
          <input type="date" name="purchaseDate" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Purchase price (₹)</label>
          <input type="number" name="purchasePrice" min="0" placeholder="85000" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Vendor</label>
          <input type="text" name="vendor" placeholder="Apple India" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Warranty expires</label>
          <input type="date" name="warrantyExpiresAt" className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Notes</label>
          <input type="text" name="notes" placeholder="Any additional notes" className={inputCls} />
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#C87660] rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors">
          {loading ? "Adding…" : "Add asset"}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="px-5 py-2.5 text-sm text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
