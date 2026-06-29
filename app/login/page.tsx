import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentSession } from "@/lib/auth/session";

async function LoginContent() {
  const session = await getCurrentSession();
  if (session) {
    const hrmsRoles = ["superadmin", "admin", "employee"];
    if (session.role === "candidate") redirect("/candidate");
    else if (hrmsRoles.includes(session.role)) redirect("/hrms/dashboard");
    else redirect("/admin");
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
