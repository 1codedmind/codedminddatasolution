import type { Metadata } from "next";
import { Suspense } from "react";
import PdfTool from "./PdfTool";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "PDF Tools — Merge, Split & Convert PDFs Online",
  description:
    "Free online PDF tools to merge, split, rotate, and convert PDFs. No upload required for basic operations. Fast and privacy-friendly.",
  keywords: ["PDF merger", "PDF splitter", "PDF tools online", "merge PDF", "split PDF", "convert PDF"],
  alternates: { canonical: "https://codedmind.co.in/tools/pdf" },
};

export default function PdfPage() {
  return (
    <Suspense>
      <BreadcrumbJsonLd items={[{ name: "Tools", path: "/tools" }, { name: "PDF Tools", path: "/tools/pdf" }]} />
      <PdfTool />
    </Suspense>
  );
}
