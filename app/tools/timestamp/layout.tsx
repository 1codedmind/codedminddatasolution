import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter — Epoch to Date & Time",
  description:
    "Convert Unix timestamps to human-readable dates and back. Supports milliseconds and seconds. Live current timestamp. Free, instant, no login required.",
  keywords: [
    "unix timestamp converter",
    "epoch converter",
    "timestamp to date",
    "epoch to human readable",
    "unix time converter online",
    "milliseconds to date",
    "convert epoch timestamp",
  ],
  alternates: { canonical: "https://codedmind.co.in/tools/timestamp" },
  openGraph: {
    title: "Unix Timestamp Converter — Epoch to Date & Time",
    description: "Convert Unix timestamps to human-readable dates and back. Supports milliseconds and seconds. Free.",
    url: "https://codedmind.co.in/tools/timestamp",
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
            name: "Unix Timestamp Converter",
            url: "https://codedmind.co.in/tools/timestamp",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "Convert Unix timestamps (epoch) to readable dates and back. Supports seconds and milliseconds.",
            featureList: ["Timestamp to date", "Date to timestamp", "Millisecond support", "Live current timestamp"],
          }),
        }}
      />
    </>
  );
}
