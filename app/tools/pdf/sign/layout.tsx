import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign PDF Online — Free eSign Tool (Type, Draw or Upload Signature)",
  description: "Add your signature to any PDF for free. Type it in a handwriting font, draw it with your mouse or finger, or upload a signature image. Drag to position, download instantly — everything stays in your browser.",
  keywords: ["sign pdf online", "esign pdf free", "add signature to pdf", "pdf signature tool", "draw signature pdf", "electronic signature pdf"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf/sign" },
  openGraph: { title: "Sign PDF — Free Online eSign Tool", url: "https://codedmind.co.in/tools/pdf/sign" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
