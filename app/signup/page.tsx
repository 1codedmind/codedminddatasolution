import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentSession } from "@/lib/auth/session";

async function SignupContent() {
  const session = await getCurrentSession();
  if (session) {
    redirect(session.role === "candidate" ? "/candidate" : "/admin");
  }
  return <AuthForm mode="signup" />;
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
