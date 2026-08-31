import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign PDF Online — Free eSign Tool",
  description: "Sign any PDF free — type, draw, or upload your signature, drag to position and download instantly. Everything stays in your browser, nothing is uploaded.",
  keywords: ["sign pdf online", "esign pdf free", "add signature to pdf", "pdf signature tool", "draw signature pdf", "electronic signature pdf"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf/sign" },
  openGraph: { images: ["/opengraph-image"], title: "Sign PDF — Free Online eSign Tool", url: "https://codedmind.co.in/tools/pdf/sign" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
