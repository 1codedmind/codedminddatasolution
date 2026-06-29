"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Employee = { id: string; fullName: string; email: string };

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors";

export default function CreateReviewForm({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [memberId, setMemberId] = useState("");
  const [period, setPeriod] = useState("");
  const [rating, setRating] = useState("");
  const [strengths, setStrengths] = useState("");
  const [areas, setAreas] = useState("");
  const [goals, setGoals] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    const res = await fetch("/api/hrms/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        period: period.trim(),
        rating: rating ? Number(rating) : undefined,
        strengths: strengths.trim() || undefined,
        areasForImprovement: areas.trim() || undefined,
        goalsNextPeriod: goals.trim() || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to create review.");
      return;
    }

    const { id } = await res.json();
    router.push(`/hrms/performance/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Review details</h2>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
            Employee <span className="text-red-400">*</span>
          </label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors"
          >
            <option value="">— Select employee —</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
            Period <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            required
            placeholder="e.g. Q2 2026 or Annual 2025–26"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
            Rating (1–5)
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors"
          >
            <option value="">— No rating —</option>
            <option value="1">1 — Needs improvement</option>
            <option value="2">2 — Below expectations</option>
            <option value="3">3 — Meets expectations</option>
            <option value="4">4 — Exceeds expectations</option>
            <option value="5">5 — Outstanding</option>
          </select>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Feedback</h2>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Strengths</label>
          <textarea rows={4} value={strengths} onChange={(e) => setStrengths(e.target.value)}
            placeholder="What did this employee do well?" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Areas for improvement</label>
          <textarea rows={4} value={areas} onChange={(e) => setAreas(e.target.value)}
            placeholder="What can be improved?" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Goals for next period</label>
          <textarea rows={4} value={goals} onChange={(e) => setGoals(e.target.value)}
            placeholder="Objectives and targets for the next review cycle…" className={inputCls} />
        </div>
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
          {loading ? "Saving…" : "Submit review"}
        </button>
        <a href="/hrms/performance" className="px-5 py-2.5 text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
