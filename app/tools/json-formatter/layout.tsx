import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator Online — Free",
  description:
    "Format, validate, and minify JSON instantly in your browser. Highlights syntax errors, pretty-prints with indentation, and minifies JSON. No data sent to any server.",
  keywords: ["json formatter", "json validator online", "json beautifier", "json minifier", "format json online", "pretty print json"],
  alternates: { canonical: "https://codedmind.co.in/tools/json-formatter" },
  openGraph: {
    title: "JSON Formatter & Validator — Free Online Tool",
    description: "Format, validate, and minify JSON in your browser. Instant syntax error detection. Free, no login.",
    url: "https://codedmind.co.in/tools/json-formatter",
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
            name: "JSON Formatter & Validator",
            url: "https://codedmind.co.in/tools/json-formatter",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "Free online JSON formatter, validator, and minifier. Works entirely in your browser.",
            featureList: ["Format JSON", "Validate JSON", "Minify JSON", "Syntax error highlighting"],
          }),
        }}
      />
    </>
  );
}
