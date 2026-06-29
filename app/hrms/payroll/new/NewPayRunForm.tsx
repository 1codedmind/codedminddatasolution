"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function NewPayRunForm() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    const res = await fetch("/api/hrms/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodMonth: Number(month), periodYear: Number(year), notes: notes || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to create pay run.");
      return;
    }

    const { id } = await res.json();
    router.push(`/hrms/payroll/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors">
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any notes about this pay run…"
          className={inputCls}
        />
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#C87660] rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating…" : "Create pay run"}
        </button>
        <a
          href="/hrms/payroll"
          className="px-5 py-2.5 text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
