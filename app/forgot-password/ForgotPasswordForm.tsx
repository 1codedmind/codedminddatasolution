"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const email = new FormData(event.currentTarget).get("email");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-[linear-gradient(180deg,#fcfaf6_0%,#f4ecde_100%)] py-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/5">
          {sent ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <MailCheck size={26} className="text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Check your inbox</h1>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                If an account exists for that email, we&apos;ve sent a password reset link.
                It&apos;s valid for 1 hour.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <KeyRound size={22} className="text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot password?</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Enter the email for your account — candidate or employee — and we&apos;ll
                send you a link to reset your password.
              </p>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-900">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="you@example.com"
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
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-sm text-stone-600">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
