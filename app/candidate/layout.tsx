import { Suspense } from "react";

import { getCurrentSession } from "@/lib/auth/session";
import { isEmailVerified } from "@/lib/auth/emailVerification";
import VerifyEmailBanner from "@/components/auth/VerifyEmailBanner";

async function VerificationNotice() {
  const session = await getCurrentSession();
  if (!session || session.role !== "candidate") return null;

  // A database hiccup should not block the dashboard — isEmailVerified fails
  // open, so the banner simply does not appear.
  if (await isEmailVerified(session.email)) return null;

  return <VerifyEmailBanner email={session.email} />;
}

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      {/* Own boundary so the banner's session lookup never delays the page. */}
      <Suspense fallback={null}>
        <VerificationNotice />
      </Suspense>
      {children}
    </Suspense>
  );
}
