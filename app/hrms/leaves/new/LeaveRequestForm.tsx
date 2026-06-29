"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeaveType } from "@/lib/hrms/leaves";

type Props = { leaveTypes: LeaveType[]; memberId: string };

function workingDays(from: string, to: string): number {
  if (!from || !to) return 0;
  let count = 0;
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function LeaveRequestForm({ leaveTypes, memberId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [from, setFrom]       = useState("");
  const [to, setTo]           = useState("");

  const days = workingDays(from, to);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const body = {
      memberId,
      leaveTypeId: fd.get("leaveTypeId"),
      fromDate:    fd.get("fromDate"),
      toDate:      fd.get("toDate"),
      daysCount:   days,
      reason:      fd.get("reason") || undefined,
    };

    const res = await fetch("/api/hrms/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/hrms/leaves");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
      <div>
        <label className="block text-xs font-semibold text-stone-400 mb-1.5">
          Leave type <span className="text-red-500">*</span>
        </label>
        <select name="leaveTypeId" required className={selectCls}>
          <option value="">— Select type —</option>
          {leaveTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}{t.daysPerYear ? ` (${t.daysPerYear} days/year)` : ""}{!t.isPaid ? " · Unpaid" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-400 mb-1.5">
            From <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fromDate"
            required
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-400 mb-1.5">
            To <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="toDate"
            required
            min={from || undefined}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {days > 0 && (
        <p className="text-xs text-stone-500">
          <span className="font-bold text-white">{days}</span> working day{days !== 1 ? "s" : ""} (Mon–Fri)
        </p>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-400 mb-1.5">Reason (optional)</label>
        <textarea
          name="reason"
          rows={3}
          placeholder="Brief reason for leave…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || days === 0}
          className="flex-1 py-3 text-sm font-semibold text-white bg-[#C87660] rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors"
        >
          {loading ? "Submitting…" : "Submit request"}
        </button>
        <a
          href="/hrms/leaves"
          className="px-5 py-3 text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

const inputCls  = "w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] transition-colors";
const selectCls = "w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors";
