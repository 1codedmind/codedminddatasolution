"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PayrollItem, PayrollRun } from "@/lib/hrms/payroll";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors";

type Employee = { id: string; fullName: string; email: string };

type Props = {
  run: PayrollRun;
  items: PayrollItem[];
  employees: Employee[];
  canDelete: boolean;
};

type ItemFormState = {
  memberId: string;
  basicSalary: string;
  allowances: string;
  deductions: string;
  bonus: string;
  notes: string;
};

const PAYMENT_STYLE: Record<string, string> = {
  pending:  "bg-amber-500/15 text-amber-400",
  paid:     "bg-emerald-500/15 text-emerald-400",
  on_hold:  "bg-red-500/15 text-red-400",
};

const STATUS_STYLE: Record<string, string> = {
  draft:      "bg-stone-800 text-stone-400",
  processing: "bg-amber-500/15 text-amber-400",
  completed:  "bg-emerald-500/15 text-emerald-400",
  cancelled:  "bg-red-500/15 text-red-400",
};

const STATUS_NEXT: Record<string, { label: string; value: string }[]> = {
  draft:      [{ label: "Mark processing", value: "processing" }],
  processing: [{ label: "Mark completed",  value: "completed"  }, { label: "Back to draft", value: "draft" }],
  completed:  [],
  cancelled:  [],
};

export default function PayrollRunActions({ run, items: initial, employees, canDelete }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ItemFormState>({
    memberId: "", basicSalary: "", allowances: "", deductions: "", bonus: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isDraft = run.status === "draft";
  const alreadyAdded = new Set(items.map((i) => i.memberId));
  const available = employees.filter((e) => !alreadyAdded.has(e.id));

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await fetch(`/api/hrms/payroll/${run.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: form.memberId,
        basicSalary: Number(form.basicSalary),
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
        bonus: Number(form.bonus) || 0,
        notes: form.notes || undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    setShowAdd(false);
    setForm({ memberId: "", basicSalary: "", allowances: "", deductions: "", bonus: "", notes: "" });
    router.refresh();
  }

  async function removeItem(itemId: string) {
    if (!confirm("Remove this employee from the pay run?")) return;
    await fetch(`/api/hrms/payroll/${run.id}/items/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    router.refresh();
  }

  async function markPaid(itemId: string, current: string) {
    const next = current === "paid" ? "pending" : "paid";
    await fetch(`/api/hrms/payroll/${run.id}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: next }),
    });
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, paymentStatus: next as "paid" | "pending" | "on_hold" } : i));
  }

  async function changeStatus(status: string) {
    if (!confirm(`Change status to "${status}"?`)) return;
    await fetch(`/api/hrms/payroll/${run.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function cancelRun() {
    if (!confirm("Cancel this pay run?")) return;
    await changeStatus("cancelled");
  }

  async function deleteRun() {
    if (!confirm("Permanently delete this pay run and all its items?")) return;
    await fetch(`/api/hrms/payroll/${run.id}`, { method: "DELETE" });
    router.push("/hrms/payroll");
  }

  const totalNet = items.reduce((s, i) => s + Number(i.netPay), 0);

  return (
    <div className="space-y-4">
      {/* Run header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-0.5">Period</p>
          <p className="text-xl font-extrabold text-white">
            {MONTH_NAMES[run.periodMonth - 1]} {run.periodYear}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-0.5">Employees</p>
          <p className="text-xl font-extrabold text-white">{items.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold mb-0.5">Total net pay</p>
          <p className="text-xl font-extrabold text-white font-mono">₹{totalNet.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[run.status]}`}>
            {run.status}
          </span>
          {STATUS_NEXT[run.status]?.map((s) => (
            <button
              key={s.value}
              onClick={() => changeStatus(s.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-stone-800 text-stone-300 rounded-lg hover:bg-stone-700 hover:text-white transition-colors"
            >
              {s.label}
            </button>
          ))}
          {run.status !== "cancelled" && run.status !== "completed" && (
            <button onClick={cancelRun} className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
              Cancel
            </button>
          )}
          {canDelete && (
            <button onClick={deleteRun} className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
              Delete run
            </button>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Employees</p>
          {isDraft && available.length > 0 && (
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="text-xs font-semibold text-[#C87660] hover:underline"
            >
              {showAdd ? "Cancel" : "+ Add employee"}
            </button>
          )}
        </div>

        {showAdd && (
          <form onSubmit={addItem} className="p-5 border-b border-stone-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Employee</label>
                <select
                  value={form.memberId}
                  onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors"
                >
                  <option value="">— Select —</option>
                  {available.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Basic salary (₹)</label>
                <input type="number" min="0" required value={form.basicSalary}
                  onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                  className={inputCls} placeholder="50000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Allowances (₹)</label>
                <input type="number" min="0" value={form.allowances}
                  onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                  className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Deductions (₹)</label>
                <input type="number" min="0" value={form.deductions}
                  onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                  className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Bonus (₹)</label>
                <input type="number" min="0" value={form.bonus}
                  onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                  className={inputCls} placeholder="0" />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors">
              {saving ? "Adding…" : "Add to run"}
            </button>
          </form>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Employee</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden md:table-cell">Basic</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden lg:table-cell">Allow.</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden lg:table-cell">Deduct.</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden lg:table-cell">Bonus</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Net pay</th>
              <th className="text-center px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Status</th>
              {isDraft && <th className="px-5 py-3.5" />}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-stone-600 text-sm">No employees added yet.</td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-stone-800/60 hover:bg-stone-800/20">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-white">{item.memberName}</p>
                  <p className="text-[11px] text-stone-600">{item.memberEmail}</p>
                </td>
                <td className="px-5 py-3.5 text-right text-stone-400 font-mono text-xs hidden md:table-cell">
                  ₹{Number(item.basicSalary).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3.5 text-right text-stone-500 font-mono text-xs hidden lg:table-cell">
                  ₹{Number(item.allowances).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3.5 text-right text-stone-500 font-mono text-xs hidden lg:table-cell">
                  ₹{Number(item.deductions).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3.5 text-right text-stone-500 font-mono text-xs hidden lg:table-cell">
                  ₹{Number(item.bonus).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-white font-mono text-xs">
                  ₹{Number(item.netPay).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button
                    onClick={() => markPaid(item.id, item.paymentStatus)}
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer hover:opacity-80 transition-opacity ${PAYMENT_STYLE[item.paymentStatus]}`}
                  >
                    {item.paymentStatus}
                  </button>
                </td>
                {isDraft && (
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => removeItem(item.id)} className="text-xs text-stone-600 hover:text-red-400 transition-colors">
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {run.notes && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Notes</p>
          <p className="text-sm text-stone-300">{run.notes}</p>
        </div>
      )}
    </div>
  );
}
