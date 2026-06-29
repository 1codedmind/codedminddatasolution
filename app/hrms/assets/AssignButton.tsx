"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Employee = { id: string; fullName: string };

export default function AssignButton({
  assetId,
  assignedTo,
  employees,
}: {
  assetId: string;
  assignedTo: string | null;
  employees: Employee[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState(assignedTo ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/hrms/assets/${assetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", memberId: memberId || null }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-stone-500 hover:text-[#C87660] transition-colors font-medium"
      >
        {assignedTo ? "Reassign" : "Assign"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
        className="px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#C87660] transition-colors"
      >
        <option value="">— Unassign —</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>{emp.fullName}</option>
        ))}
      </select>
      <button onClick={save} disabled={saving}
        className="px-2.5 py-1.5 text-xs font-semibold bg-[#C87660] text-white rounded-lg hover:bg-[#b5644e] disabled:opacity-50 transition-colors">
        {saving ? "…" : "Save"}
      </button>
      <button onClick={() => setOpen(false)} className="text-stone-500 hover:text-white text-xs">✕</button>
    </div>
  );
}
