import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Rotate PDF Online — Free PDF Rotation Tool",
  description: "Rotate PDF pages by 90°, 180°, or 270°. Works in your browser — no uploads, no account needed.",
  keywords: ["rotate pdf", "rotate pdf online free", "pdf rotation tool", "flip pdf pages"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf/rotate" },
  openGraph: { title: "Rotate PDF — Free Online Tool", url: "https://codedmind.co.in/tools/pdf/rotate" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
