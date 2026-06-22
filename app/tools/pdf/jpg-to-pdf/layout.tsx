import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JPG to PDF Online — Convert Images to PDF Free",
  description: "Convert JPG, PNG, or WebP images to a PDF document. Multiple images supported. Free, browser-based, no uploads.",
  keywords: ["jpg to pdf", "jpg to pdf online free", "image to pdf converter", "png to pdf", "convert photo to pdf"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf/jpg-to-pdf" },
  openGraph: { title: "JPG to PDF — Free Online Converter", url: "https://codedmind.co.in/tools/pdf/jpg-to-pdf" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
