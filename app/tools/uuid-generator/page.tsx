import type { Metadata } from "next";
import { Suspense } from "react";
import UuidGeneratorTool from "./UuidGeneratorTool";

export const metadata: Metadata = {
  title: "UUID Generator — Free Online UUIDv4 Generator",
  description:
    "Generate multiple UUIDs (UUIDv4) instantly in your browser. Copy individual UUIDs or all at once. No signup required.",
  keywords: ["UUID generator", "UUID v4", "GUID generator", "random UUID", "online UUID"],
  alternates: { canonical: "https://codedmind.co.in/tools/uuid-generator" },
};

export default function UuidGeneratorPage() {
  return (
    <Suspense>
      <UuidGeneratorTool />
    </Suspense>
  );
}
