import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter Online — Characters, Sentences & Reading Time",
  description:
    "Count words, characters, sentences, and paragraphs in real time. Shows estimated reading time. Paste any text — free, instant, no data sent.",
  keywords: [
    "word counter online",
    "character counter",
    "word count tool",
    "reading time calculator",
    "sentence counter",
    "text word count",
    "count words online",
  ],
  alternates: { canonical: "https://codedmind.co.in/tools/word-counter" },
  openGraph: {
    title: "Word Counter — Count Words, Characters & Reading Time",
    description: "Real-time word, character, and sentence counter with estimated reading time. Free, no login.",
    url: "https://codedmind.co.in/tools/word-counter",
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
            name: "Word Counter",
            url: "https://codedmind.co.in/tools/word-counter",
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "Free real-time word counter. Counts words, characters, sentences, paragraphs, and estimated reading time.",
            featureList: ["Word count", "Character count", "Sentence count", "Reading time estimate", "Real-time updates"],
          }),
        }}
      />
    </>
  );
}
