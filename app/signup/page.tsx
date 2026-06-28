import { redirect } from "next/navigation";

import AuthForm from "@/components/auth/AuthForm";
import { getCurrentSession } from "@/lib/auth/session";

export default async function SignupPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(session.role === "candidate" ? "/candidate" : "/admin");
  }

  return <AuthForm mode="signup" />;
}
