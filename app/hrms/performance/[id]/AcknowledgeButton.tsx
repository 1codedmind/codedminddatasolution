"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcknowledgeButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function acknowledge() {
    setLoading(true);
    await fetch(`/api/hrms/performance/${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "acknowledged" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={acknowledge}
      disabled={loading}
      className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "Saving…" : "Acknowledge review"}
    </button>
  );
}
