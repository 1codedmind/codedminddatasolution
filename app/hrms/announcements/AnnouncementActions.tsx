"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, Trash2 } from "lucide-react";

export default function AnnouncementActions({
  id,
  isPinned,
}: {
  id: string;
  isPinned: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePin() {
    setLoading(true);
    await fetch(`/api/hrms/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !isPinned }),
    });
    setLoading(false);
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this announcement?")) return;
    setLoading(true);
    await fetch(`/api/hrms/announcements/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePin}
        disabled={loading}
        title={isPinned ? "Unpin" : "Pin"}
        className={`p-1.5 rounded-lg transition-colors ${isPinned ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20" : "text-stone-600 hover:text-stone-300 hover:bg-stone-800"}`}
      >
        <Pin size={13} />
      </button>
      <button
        onClick={del}
        disabled={loading}
        title="Delete"
        className="p-1.5 rounded-lg text-stone-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
