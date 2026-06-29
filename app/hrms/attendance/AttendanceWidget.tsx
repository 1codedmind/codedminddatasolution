"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AttendanceLog } from "@/lib/hrms/attendance";
import { Clock, LogIn, LogOut } from "lucide-react";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function AttendanceWidget({ today }: { today: AttendanceLog | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "checkin" | "checkout") {
    setLoading(true); setError("");
    const res = await fetch("/api/hrms/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Something went wrong.");
    } else {
      router.refresh();
    }
  }

  const checkedIn  = !!today?.checkInAt;
  const checkedOut = !!today?.checkOutAt;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
      <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Clock size={13} /> Today
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-0.5">Check-in</p>
          <p className="text-sm font-semibold text-white">{fmt(today?.checkInAt ?? null)}</p>
        </div>
        <div>
          <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-0.5">Check-out</p>
          <p className="text-sm font-semibold text-white">{fmt(today?.checkOutAt ?? null)}</p>
        </div>
        <div>
          <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-0.5">Work hours</p>
          <p className="text-sm font-semibold text-white">
            {today?.workHours != null ? `${today.workHours}h` : "—"}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {!checkedIn && (
          <button
            onClick={() => act("checkin")}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
          >
            <LogIn size={14} /> Check in
          </button>
        )}
        {checkedIn && !checkedOut && (
          <button
            onClick={() => act("checkout")}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-semibold rounded-xl hover:bg-amber-500/25 disabled:opacity-50 transition-colors"
          >
            <LogOut size={14} /> Check out
          </button>
        )}
        {checkedIn && checkedOut && (
          <span className="px-4 py-2 text-sm text-stone-500">Day complete ✓</span>
        )}
      </div>

      {error && <p className="mt-3 text-red-400 text-xs">{error}</p>}
    </div>
  );
}
