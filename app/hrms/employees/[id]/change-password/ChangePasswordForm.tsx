"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

const inputCls =
  "w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors";

export default function ChangePasswordForm({
  memberId,
  isSelf,
}: {
  memberId: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const newPassword = fd.get("newPassword") as string;
    const confirmPassword = fd.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const body: Record<string, string> = { newPassword };
    if (isSelf) body.currentPassword = fd.get("currentPassword") as string;

    const res = await fetch(`/api/hrms/employees/${memberId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
    (e.target as HTMLFormElement).reset();

    if (isSelf) {
      setTimeout(() => router.push("/hrms/dashboard"), 1500);
    } else {
      setTimeout(() => router.push(`/hrms/employees/${memberId}`), 1500);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
      {isSelf && (
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
            Current password <span className="text-red-400">*</span>
          </label>
          <PasswordInput
            name="currentPassword"
            required
            autoComplete="current-password"
            placeholder="Your current password"
            className={inputCls}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
          New password <span className="text-red-400">*</span>
        </label>
        <PasswordInput
          name="newPassword"
          required
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          placeholder="Min 12 characters"
          className={inputCls}
        />
        <p className="text-[11px] text-stone-600 mt-1">At least 12 characters.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
          Confirm new password <span className="text-red-400">*</span>
        </label>
        <PasswordInput
          name="confirmPassword"
          required
          autoComplete="new-password"
          minLength={12}
          placeholder="Repeat new password"
          className={inputCls}
        />
      </div>

      {error && (
        <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
          Password changed successfully. Redirecting…
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading || success}
          className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#C87660] rounded-xl hover:bg-[#b5644e] disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : isSelf ? "Change password" : "Set new password"}
        </button>
        <a
          href={`/hrms/employees/${memberId}`}
          className="px-5 py-2.5 text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
