import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { consumeVerificationToken } from "@/lib/auth/emailVerification";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { hasDatabaseUrl } from "@/lib/db";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

async function VerifyResult({ token }: { token: string }) {
  if (!hasDatabaseUrl()) {
    return <Result ok={false} title="Service unavailable" body="Please try again shortly." />;
  }

  // Throttle token submissions so the endpoint cannot be used to grind through
  // guesses. 32 random bytes is already infeasible to brute force, but there is
  // no reason to serve the attempts.
  if (!(await enforceRateLimit("verify-email:attempts", 200, 60 * 60_000))) {
    return (
      <Result
        ok={false}
        title="Too many attempts"
        body="Please wait a little while and open your confirmation link again."
      />
    );
  }

  const outcome = await consumeVerificationToken(token);

  if (outcome.status === "verified") {
    return (
      <Result
        ok
        title="Email confirmed"
        body="Thanks — your address is confirmed. AI resume parsing and job applications are now unlocked."
      />
    );
  }

  if (outcome.status === "already-verified") {
    return (
      <Result
        ok
        title="Already confirmed"
        body="This address was confirmed previously. Nothing further to do."
      />
    );
  }

  return (
    <Result
      ok={false}
      title="This link didn't work"
      body="Confirmation links are valid for 24 hours and can be used once. Sign in and request a new one from the banner on your dashboard."
    />
  );
}

function Result({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-xl shadow-stone-900/5">
      <div
        className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full ${
          ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        }`}
      >
        {ok ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 leading-relaxed text-stone-600">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/candidate"
          className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          Go to dashboard
        </Link>
        <Link
          href="/tools"
          className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400"
        >
          Browse tools
        </Link>
      </div>
    </div>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-[linear-gradient(180deg,#fcfaf6_0%,#f4ecde_100%)] px-4 py-20">
      <Suspense
        fallback={
          <div className="mx-auto h-64 max-w-lg animate-pulse rounded-[2rem] border border-stone-200 bg-white/60" />
        }
      >
        {token ? (
          <VerifyResult token={token} />
        ) : (
          <Result
            ok={false}
            title="No confirmation token"
            body="Open the link from your confirmation email, or request a new one from your dashboard."
          />
        )}
      </Suspense>
    </main>
  );
}
