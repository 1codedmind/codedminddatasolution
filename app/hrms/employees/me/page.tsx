import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";

// Redirect employees to their own profile page
export default async function MyProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  redirect(`/hrms/employees/${session.sub}`);
}
