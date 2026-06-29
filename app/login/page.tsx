import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentSession } from "@/lib/auth/session";

async function LoginContent() {
  const session = await getCurrentSession();
  if (session) {
    redirect(session.role === "candidate" ? "/candidate" : "/admin");
  }
  return <AuthForm mode="login" />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
