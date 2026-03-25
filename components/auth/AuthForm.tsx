"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

const copy = {
  login: {
    title: "Candidate Login",
    subtitle: "Access your candidate account to continue your application journey.",
    submitLabel: "Log In",
    alternateLabel: "Need an account?",
    alternateHref: "/signup",
    alternateCta: "Create one",
  },
  signup: {
    title: "Create Candidate Account",
    subtitle: "Register as a candidate with a secure account for future applications.",
    submitLabel: "Sign Up",
    alternateLabel: "Already have an account?",
    alternateHref: "/login",
    alternateCta: "Log in",
  },
} as const;

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            fullName: formData.get("fullName"),
            email: formData.get("email"),
            password: formData.get("password"),
          }
        : {
            email: formData.get("email"),
            password: formData.get("password"),
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    startTransition(() => {
      router.push("/candidate");
      router.refresh();
    });
  }

  const currentCopy = copy[mode];

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-[linear-gradient(180deg,#fcfaf6_0%,#f4ecde_100%)] py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:px-8">
        <div className="max-w-xl flex-1 pt-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
            Candidate Portal
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {currentCopy.title}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
            {currentCopy.subtitle}
          </p>
          <div className="mt-8 rounded-3xl border border-amber-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Security baseline included</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Password hashing, HTTP-only session cookies, origin checks, generic auth
              errors, and rate-limited auth endpoints are all enforced server-side.
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="mx-auto max-w-lg rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/5">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {mode === "signup" ? (
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-900">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={80}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                    placeholder="Aarav Sharma"
                  />
                </div>
              ) : null}

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
                  placeholder="candidate@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-900">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={12}
                  maxLength={72}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                  placeholder="Use 12+ chars with uppercase, lowercase, number, symbol"
                />
                {mode === "signup" ? (
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    Use 12-72 characters with at least one uppercase letter, one
                    lowercase letter, one number, and one special character.
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex w-full items-center justify-center rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Please wait..." : currentCopy.submitLabel}
              </button>
            </form>

            <p className="mt-6 text-sm text-stone-600">
              {currentCopy.alternateLabel}{" "}
              <Link href={currentCopy.alternateHref} className="font-semibold text-amber-700 hover:text-amber-800">
                {currentCopy.alternateCta}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
