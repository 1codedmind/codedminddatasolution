import { redirect } from "next/navigation";

import AuthForm from "@/components/auth/AuthForm";
import { getCurrentSession } from "@/lib/auth/session";

export default async function SignupPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/candidate");
  }

  return <AuthForm mode="signup" />;
}
