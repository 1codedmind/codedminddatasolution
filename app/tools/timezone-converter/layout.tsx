import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timezone Converter — All 500+ IANA Timezones",
  description:
    "Convert times across all 500+ IANA timezones. Search by city, country, US state, or abbreviation (EST, IST, JST). DST-aware, visual 24-hour timeline. Free, works in your browser.",
  keywords: [
    "timezone converter",
    "time zone converter online",
    "convert time zones",
    "world time converter",
    "EST to IST converter",
    "timezone comparison tool",
    "all timezones",
    "IANA timezone list",
    "what time is it in",
  ],
  alternates: { canonical: "https://codedmind.co.in/tools/timezone-converter" },
  openGraph: {
    title: "Timezone Converter — All 500+ IANA Timezones",
    description: "Convert times across all 500+ IANA timezones. Search by city, country, or abbreviation. Free, DST-aware.",
    url: "https://codedmind.co.in/tools/timezone-converter",
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
            name: "Timezone Converter",
            url: "https://codedmind.co.in/tools/timezone-converter",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description:
              "Free online timezone converter supporting all 500+ IANA timezones. Search by city, country, US state, or abbreviation. DST-aware, visual 24-hour timeline.",
            featureList: [
              "500+ IANA timezones",
              "Search by city or country",
              "DST-aware conversions",
              "Visual 24-hour timeline",
              "Compare multiple timezones",
            ],
          }),
        }}
      />
    </>
  );
}
