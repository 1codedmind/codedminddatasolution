import type { Metadata } from "next";
import { Suspense } from "react";
import JsonFormatterTool from "./JsonFormatterTool";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator — Free Online Tool",
  description:
    "Format, prettify, and validate JSON instantly in your browser. Minify or beautify JSON with adjustable indentation. No data is sent to any server.",
  keywords: ["JSON formatter", "JSON validator", "JSON prettifier", "JSON beautifier", "format JSON online"],
  alternates: { canonical: "https://codedmind.co.in/tools/json-formatter" },
};

export default function JsonFormatterPage() {
  return (
    <Suspense>
      <JsonFormatterTool />
    </Suspense>
  );
}
