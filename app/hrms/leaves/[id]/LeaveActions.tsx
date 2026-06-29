"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export default function LeaveActions({ leaveId }: { leaveId: string }) {
  const router  = useRouter();
  const [note, setNote]       = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError]     = useState("");

  async function submit(status: "approved" | "rejected") {
    setLoading(status === "approved" ? "approve" : "reject");
    setError("");

    const res = await fetch(`/api/hrms/leaves/${leaveId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote: note || undefined }),
    });

    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/hrms/leaves");
    router.refresh();
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Review request</h2>

      <div>
        <label className="block text-xs font-semibold text-stone-400 mb-1.5">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Add a comment for the employee…"
          className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => submit("approved")}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <CheckCircle size={14} />
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          onClick={() => submit("rejected")}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-700 rounded-xl hover:bg-red-800 disabled:opacity-50 transition-colors"
        >
          <XCircle size={14} />
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </div>
  );
}
