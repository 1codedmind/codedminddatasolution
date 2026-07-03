"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const fd = new FormData(event.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-[linear-gradient(180deg,#fcfaf6_0%,#f4ecde_100%)] py-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/5">
          {done ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <ShieldCheck size={26} className="text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Password updated</h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                Your password has been changed. Log in with your new password.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Go to login
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center py-6">
              <h1 className="text-xl font-bold text-slate-900">Invalid reset link</h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                This link is missing its reset token. Request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="mt-6 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <LockKeyhole size={22} className="text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Choose a new password</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Use 12–72 characters with at least one uppercase letter, one lowercase
                letter, one number, and one special character.
              </p>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-900">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={12}
                      maxLength={72}
                      className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm" className="mb-2 block text-sm font-medium text-slate-900">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={72}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="Repeat new password"
                  />
                </div>

                {error ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
