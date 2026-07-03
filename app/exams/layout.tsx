import { Suspense } from "react";

// Static outer shell — wraps all exam pages in a Suspense boundary so that
// uncached data (session cookies, searchParams) accessed by child pages
// streams at request time under cacheComponents.
export default function ExamsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
