"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";

import GoogleButton from "@/components/auth/GoogleButton";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

type FieldName = "fullName" | "email" | "password" | "confirmPassword" | "terms";
type FieldErrors = Partial<Record<FieldName, string>>;

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

const PASSWORD_MIN = 12;
const PASSWORD_MAX = 72;

// Errors handed back by the OAuth routes as ?error=<code>. Anything unknown
// falls through to a generic message rather than being echoed to the page.
const OAUTH_ERRORS: Record<string, string> = {
  cancelled: "Google sign-in was cancelled. You can try again or use your email and password.",
  expired: "That sign-in attempt timed out. Please try again.",
  invalid_state: "That sign-in attempt could not be verified. Please try again.",
  email_unverified:
    "Your Google account's email address isn't verified. Verify it with Google, or sign up with an email and password.",
  account_inactive: "This account is inactive. Please contact hr@codedmind.co.in.",
  google_unavailable: "Google sign-in isn't available right now. Please use your email and password.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  google_failed: "We couldn't complete Google sign-in. Please try again.",
};

function FieldError({ field, message }: { field: FieldName; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${field}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
      {message}
    </p>
  );
}

// Mirrors lib/auth/validation.ts so the user sees the problem before a
// round-trip. The server re-validates everything — this is convenience only.
function validate(
  mode: AuthMode,
  values: { fullName: string; email: string; password: string; confirmPassword: string; terms: boolean },
): FieldErrors {
  const errors: FieldErrors = {};

  if (mode === "signup") {
    const fullName = values.fullName.trim().replace(/\s+/g, " ");
    if (!fullName) {
      errors.fullName = "Please enter your full name.";
    } else if (fullName.length < 2 || fullName.length > 80) {
      errors.fullName = "Full name must be between 2 and 80 characters.";
    } else if (!/^[\p{L}\p{M}][\p{L}\p{M}'\-. ]*$/u.test(fullName)) {
      errors.fullName = "Full name can only contain letters, spaces, hyphens, apostrophes, and periods.";
    }
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.email = "Enter a valid email address, e.g. you@example.com.";
  }

  const password = values.password;
  if (!password) {
    errors.password = "Please enter your password.";
  } else if (mode === "signup") {
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      errors.password = `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters.`;
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must include at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must include at least one lowercase letter.";
    } else if (!/\d/.test(password)) {
      errors.password = "Password must include at least one number.";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password = "Password must include at least one special character.";
    }
  }

  if (mode === "signup") {
    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (values.confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!values.terms) {
      errors.terms = "You must accept the Terms & Conditions and Privacy Policy to continue.";
    }
  }

  return errors;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  function setField<K extends keyof typeof values>(field: K, value: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the field's error as soon as the user edits it.
    setErrors((prev) => (prev[field as FieldName] ? { ...prev, [field]: undefined } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const found = validate(mode, values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const payload =
      mode === "signup"
        ? {
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            password: values.password,
          }
        : {
            email: values.email.trim(),
            password: values.password,
          };

    let response: Response;
    try {
      response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      setSubmitting(false);
      setError("Network error. Check your connection and try again.");
      return;
    }

    const data = (await response.json().catch(() => null)) as { error?: string; redirectTo?: string } | null;

    if (!response.ok) {
      setSubmitting(false);
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    startTransition(() => {
      router.push(data?.redirectTo ?? "/candidate");
      router.refresh();
    });
  }

  const currentCopy = copy[mode];
  const busy = submitting || isPending;

  const oauthErrorCode = searchParams.get("error");
  const oauthError = oauthErrorCode
    ? OAUTH_ERRORS[oauthErrorCode] ?? "We couldn't complete that sign-in. Please try again."
    : "";

  const inputBase =
    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4";
  const inputOk = "border-stone-300 focus:border-amber-500 focus:ring-amber-100";
  const inputBad = "border-rose-400 focus:border-rose-500 focus:ring-rose-100";
  const fieldClass = (field: FieldName) => `${inputBase} ${errors[field] ? inputBad : inputOk}`;

  const a11y = (field: FieldName) => ({
    "aria-invalid": errors[field] ? (true as const) : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

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
            {oauthError ? (
              <p
                role="alert"
                className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {oauthError}
              </p>
            ) : null}

            <GoogleButton
              label={mode === "signup" ? "Sign up with Google" : "Continue with Google"}
              disabled={busy}
            />

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-xs font-medium uppercase tracking-widest text-stone-400">
                or
              </span>
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {mode === "signup" ? (
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-900">
                    Full name <span className="text-amber-700">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    maxLength={80}
                    value={values.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    className={fieldClass("fullName")}
                    placeholder="Aarav Sharma"
                    {...a11y("fullName")}
                  />
                  <FieldError field="fullName" message={errors.fullName} />
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-900">
                  Email address <span className="text-amber-700">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={values.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className={fieldClass("email")}
                  placeholder="candidate@example.com"
                  {...a11y("email")}
                />
                <FieldError field="email" message={errors.email} />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-900">
                  Password <span className="text-amber-700">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    maxLength={PASSWORD_MAX}
                    value={values.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className={`${fieldClass("password")} pr-11`}
                    placeholder={
                      mode === "signup"
                        ? "Use 12+ chars with uppercase, lowercase, number, symbol"
                        : "Enter your password"
                    }
                    {...a11y("password")}
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
                <FieldError field="password" message={errors.password} />
                {mode === "signup" ? (
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    Use 12-72 characters with at least one uppercase letter, one
                    lowercase letter, one number, and one special character.
                  </p>
                ) : (
                  <p className="mt-2 text-right">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                    >
                      Forgot password?
                    </Link>
                  </p>
                )}
              </div>

              {mode === "signup" ? (
                <>
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-900">
                      Confirm password <span className="text-amber-700">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        maxLength={PASSWORD_MAX}
                        value={values.confirmPassword}
                        onChange={(e) => setField("confirmPassword", e.target.value)}
                        className={`${fieldClass("confirmPassword")} pr-11`}
                        placeholder="Re-enter your password"
                        {...a11y("confirmPassword")}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute inset-y-0 right-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <FieldError field="confirmPassword" message={errors.confirmPassword} />
                  </div>

                  <div>
                    <label htmlFor="terms" className="flex cursor-pointer items-start gap-3 text-sm text-stone-600">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={values.terms}
                        onChange={(e) => setField("terms", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-stone-300 text-amber-600 focus:ring-2 focus:ring-amber-200"
                        {...a11y("terms")}
                      />
                      <span className="leading-relaxed">
                        I agree to the{" "}
                        <Link href="/terms" target="_blank" className="font-semibold text-amber-700 hover:text-amber-800">
                          Terms &amp; Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" target="_blank" className="font-semibold text-amber-700 hover:text-amber-800">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    <FieldError field="terms" message={errors.terms} />
                  </div>
                </>
              ) : null}

              {error ? (
                <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Please wait..." : currentCopy.submitLabel}
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
