import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder Online — Free",
  description:
    "Encode text or files to Base64, or decode Base64 strings back to plain text. Works entirely in your browser — no data is sent to any server. Free, instant.",
  keywords: [
    "base64 encoder",
    "base64 decoder",
    "base64 encode online",
    "base64 decode online",
    "encode base64",
    "decode base64 string",
    "base64 converter",
  ],
  alternates: { canonical: "https://codedmind.co.in/tools/base64" },
  openGraph: {
    title: "Base64 Encoder & Decoder — Free Online Tool",
    description: "Encode or decode Base64 strings instantly in your browser. No data sent. Free.",
    url: "https://codedmind.co.in/tools/base64",
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
            name: "Base64 Encoder & Decoder",
            url: "https://codedmind.co.in/tools/base64",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "Free online Base64 encoder and decoder. Works in-browser, no data sent.",
            featureList: ["Encode text to Base64", "Decode Base64 to text", "Instant conversion", "Privacy-first"],
          }),
        }}
      />
    </>
  );
}
