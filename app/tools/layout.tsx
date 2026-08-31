import type { Metadata } from "next";
import type { ReactNode } from "react";

import MoreTools from "@/components/tools/MoreTools";

export const metadata: Metadata = {
  title: "Free Developer Tools",
  description: "Free developer tools that run in your browser — JSON formatter, word counter, UUID, Base64, timestamp and timezone converters, and PDF tools. No login.",
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
