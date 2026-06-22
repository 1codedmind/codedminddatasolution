import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free PDF Tools — Merge, Split, Rotate, Convert Online",
  description:
    "Free online PDF tools: merge PDFs, split PDF pages, rotate PDF, convert JPG to PDF, and more. All tools run in your browser — files never uploaded to any server.",
  keywords: ["pdf tools online", "free pdf editor", "merge pdf", "split pdf", "rotate pdf", "jpg to pdf", "pdf converter online"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf" },
  openGraph: {
    title: "Free PDF Tools — Merge, Split, Rotate & More",
    description: "Free browser-based PDF tools. No uploads. No account. Works offline.",
    url: "https://codedmind.co.in/tools/pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
