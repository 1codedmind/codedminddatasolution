"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EmployeeDetail } from "@/lib/hrms/employees";
import type { Department } from "@/lib/hrms/departments";

type Props = {
  emp: EmployeeDetail;
  departments: Pick<Department, "id" | "name">[];
  isSelf: boolean;
};

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors";

const selectCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#C87660] transition-colors";

function Field({
  label, name, type = "text", defaultValue, placeholder, hint,
}: {
  label: string; name: string; type?: string;
  defaultValue?: string | null; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint && <p className="text-[11px] text-stone-600 mt-1">{hint}</p>}
    </div>
  );
}

export default function EditProfileForm({ emp, departments, isSelf }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {};

    for (const [key, value] of fd.entries()) {
      if (typeof value === "string" && value.trim()) {
        body[key] = value.trim();
      }
    }

    const res = await fetch(`/api/hrms/employees/${emp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save changes.");
      return;
    }

    router.push(`/hrms/employees/${emp.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Employment */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Employment</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Department</label>
            <select name="departmentId" defaultValue={emp.departmentId ?? ""} className={selectCls}>
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">Employment type</label>
            <select name="employmentType" defaultValue={emp.employmentType ?? "full_time"} className={selectCls}>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>
        </div>

        <Field label="Join date" name="joinDate" type="date" defaultValue={emp.joinDate?.slice(0, 10)} />
        <Field label="Phone" name="phone" type="tel" defaultValue={emp.phone} placeholder="+91 98765 43210" />
      </div>

      {/* Personal */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Personal</h2>
        <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={emp.dateOfBirth?.slice(0, 10)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" name="city" defaultValue={emp.city} placeholder="Mumbai" />
          <Field label="State" name="state" defaultValue={emp.state} placeholder="Maharashtra" />
        </div>
        <Field label="Country" name="country" defaultValue={emp.country} placeholder="India" />
      </div>

      {/* Emergency contact */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Emergency contact</h2>
        <Field label="Name" name="emergencyContactName" defaultValue={emp.emergencyContactName} placeholder="Contact name" />
        <Field label="Phone" name="emergencyContactPhone" type="tel" defaultValue={emp.emergencyContactPhone} placeholder="+91 98765 43210" />
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#C87660] rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        <a
          href={`/hrms/employees/${emp.id}`}
          className="px-5 py-2.5 text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
