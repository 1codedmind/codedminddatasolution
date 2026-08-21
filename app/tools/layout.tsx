import type { Metadata } from "next";
import type { ReactNode } from "react";

import MoreTools from "@/components/tools/MoreTools";

export const metadata: Metadata = {
  title: "Free Developer Tools",
  description: "Free online developer tools: JSON formatter, Base64 encoder, UUID generator, word counter, Unix timestamp converter, timezone converter, password generator, and PDF tools.",
  alternates: { canonical: "https://codedmind.co.in/tools" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Free Developer Tools — Coded Mind",
    description: "Browser-based developer utilities. No login, no data sent.",
    url: "https://codedmind.co.in/tools",
  },
};

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <MoreTools />
    </>
  );
}
