"use client";

import { useState } from "react";
import { MailWarning, Loader2, CheckCircle2 } from "lucide-react";

/**
 * Shown to signed-in candidates whose address is not yet confirmed.
 *
 * Deliberately a soft prompt rather than a wall: browsing and the free tools
 * stay open, and only the actions with real consequence (AI resume parsing,
 * job applications) are gated server-side.
 */
export default function VerifyEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function resend() {
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/auth/verify-email/resend", { method: "POST" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;

      if (!res.ok) {
        setState("error");
        setMessage(data?.error ?? "Couldn't send right now. Please try again shortly.");
        return;
      }
      setState("sent");
      setMessage(data?.message ?? "Confirmation email sent. Check your inbox.");
    } catch {
      setState("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          {state === "sent" ? (
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <MailWarning size={17} className="mt-0.5 shrink-0 text-amber-700" />
          )}
          <p className="text-sm leading-relaxed text-amber-900">
            {state === "sent" || state === "error" ? (
              message
            ) : (
              <>
                Confirm your email address (<span className="font-medium">{email}</span>) to unlock
                AI resume parsing and job applications.
              </>
            )}
          </p>
        </div>

        {state !== "sent" && (
          <button
            type="button"
            onClick={resend}
            disabled={state === "sending"}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70 sm:self-auto"
          >
            {state === "sending" && <Loader2 size={13} className="animate-spin" />}
            {state === "sending" ? "Sending…" : "Resend email"}
          </button>
        )}
      </div>
    </div>
  );
}
