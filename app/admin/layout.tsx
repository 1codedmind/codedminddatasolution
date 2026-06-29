import { Suspense } from "react";

// Static outer shell — wraps all admin pages in a Suspense boundary so that
// uncached data (session cookies) accessed by child pages streams at request time.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
