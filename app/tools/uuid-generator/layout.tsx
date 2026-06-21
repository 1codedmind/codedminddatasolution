import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID Generator Online — Bulk v4 UUIDs, Free",
  description:
    "Generate cryptographically secure UUID v4 identifiers in bulk. Generate up to 100 UUIDs at once. Copy individually or all at once. Free, runs in your browser.",
  keywords: [
    "uuid generator",
    "uuid v4 generator",
    "generate uuid online",
    "random uuid",
    "bulk uuid generator",
    "guid generator",
    "unique id generator",
  ],
  alternates: { canonical: "https://codedmind.co.in/tools/uuid-generator" },
  openGraph: {
    title: "UUID Generator — Free Bulk v4 UUID Generator Online",
    description: "Generate up to 100 cryptographically secure UUID v4s at once. Free, no login, no data sent.",
    url: "https://codedmind.co.in/tools/uuid-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "UUID Generator",
            url: "https://codedmind.co.in/tools/uuid-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "Generate cryptographically secure UUID v4 identifiers in bulk. Free, browser-based.",
            featureList: ["UUID v4 generation", "Bulk generate up to 100", "Copy to clipboard", "Cryptographically secure"],
          }),
        }}
      />
    </>
  );
}
