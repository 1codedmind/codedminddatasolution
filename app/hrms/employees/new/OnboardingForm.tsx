"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Department } from "@/lib/hrms/departments";
import PasswordInput from "@/components/PasswordInput";

type Props = { departments: Pick<Department, "id" | "name">[]; isSuperadmin?: boolean };

export default function OnboardingForm({ departments, isSuperadmin = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const body = {
      fullName:       fd.get("fullName"),
      email:          fd.get("email"),
      role:           fd.get("role"),
      password:       fd.get("password"),
      joinDate:       fd.get("joinDate"),
      employmentType: fd.get("employmentType"),
      departmentId:   fd.get("departmentId") || undefined,
      phone:          fd.get("phone") || undefined,
    };

    const res = await fetch("/api/hrms/employees", {
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

    router.push(`/hrms/employees/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Account details</h2>

        <Field label="Full name" name="fullName" required placeholder="e.g. Priya Sharma" />
        <Field label="Work email" name="email" type="email" required placeholder="priya@company.com" />

        <div>
          <label className="block text-xs font-semibold text-stone-400 mb-1.5">Role</label>
          <select name="role" required className={selectCls}>
            <option value="employee">Employee</option>
            <option value="admin">HR Admin</option>
            {isSuperadmin && <option value="superadmin">Super Admin</option>}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 mb-1.5">
            Temporary password <span className="text-red-500">*</span>
          </label>
          <PasswordInput
            name="password"
            required
            autoComplete="new-password"
            minLength={12}
            placeholder="Min 12 characters"
            className={inputCls}
          />
          <p className="text-[11px] text-stone-600 mt-1">Employee should change this on first login.</p>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Employment details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1.5">Join date</label>
            <input
              type="date"
              name="joinDate"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1.5">Employment type</label>
            <select name="employmentType" className={selectCls}>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 mb-1.5">Department</label>
          <select name="departmentId" className={selectCls}>
            <option value="">— Select department —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <Field label="Phone (optional)" name="phone" type="tel" placeholder="+91 98765 43210" />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 text-sm font-semibold text-white bg-[#C87660] rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating…" : "Create employee"}
        </button>
        <a
          href="/hrms/employees"
          className="px-5 py-3 text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] transition-colors";

const selectCls =
  "w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors";

function Field({
  label, name, type = "text", required, placeholder, hint,
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-400 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint && <p className="text-[11px] text-stone-600 mt-1">{hint}</p>}
    </div>
  );
}
