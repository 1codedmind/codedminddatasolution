import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Split PDF Online — Extract Pages Free",
  description: "Split a PDF into individual pages or custom page ranges. Free, browser-based — your file never leaves your device.",
  keywords: ["split pdf", "split pdf online free", "extract pages from pdf", "pdf page extractor", "divide pdf"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf/split" },
  openGraph: { title: "Split PDF — Free Online Tool", url: "https://codedmind.co.in/tools/pdf/split" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
