import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Merge PDF Online — Combine PDFs Free",
  description: "Combine multiple PDF files into one. Reorder pages by dragging. Free, runs in your browser — files never uploaded.",
  keywords: ["merge pdf", "combine pdf online", "merge pdf files free", "join pdf", "combine multiple pdfs"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf/merge" },
  openGraph: { title: "Merge PDF — Free Online Tool", url: "https://codedmind.co.in/tools/pdf/merge" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
