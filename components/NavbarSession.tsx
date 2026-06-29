import { getCurrentSession } from "@/lib/auth/session";
import Navbar from "@/components/Navbar";

export default async function NavbarSession() {
  const session = await getCurrentSession();
  return <Navbar sessionEmail={session?.email} sessionRole={session?.role} />;
}
