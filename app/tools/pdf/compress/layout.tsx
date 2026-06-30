import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free — Reduce PDF File Size",
  description:
    "Reduce PDF file size without losing quality. Free, browser-based PDF compressor — your file never leaves your device. No signup, no limits.",
  keywords: ["compress pdf online free", "reduce pdf size", "pdf compressor", "shrink pdf", "pdf file size reducer"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf/compress" },
  openGraph: {
    title: "Compress PDF Online Free — Reduce File Size Instantly",
    description: "Shrink PDF size without quality loss. Runs entirely in your browser — files never uploaded to any server.",
    url: "https://codedmind.co.in/tools/pdf/compress",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
