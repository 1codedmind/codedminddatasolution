import type { Metadata } from "next";
import WordCounterTool from "./WordCounterTool";

export const metadata: Metadata = {
  title: "Free Online Word Counter — Count Words, Characters & Reading Time",
  description:
    "Count words, characters, sentences, paragraphs, and reading time instantly. Free online word counter — no login, no ads, works in your browser.",
  alternates: { canonical: "https://codedmind.co.in/tools/word-counter" },
  openGraph: {
    title: "Free Online Word Counter",
    description: "Count words, characters, sentences and reading time in real time. Free, no login required.",
    url: "https://codedmind.co.in/tools/word-counter",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I count words online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paste or type your text into the box above. The word count, character count, sentence count, paragraph count, and estimated reading time update instantly as you type.",
      },
    },
    {
      "@type": "Question",
      name: "Is this word counter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely free. No login, no ads, and your text never leaves your browser.",
      },
    },
    {
      "@type": "Question",
      name: "How is reading time calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reading time is estimated at 200 words per minute, which is a typical adult reading speed.",
      },
    },
    {
      "@type": "Question",
      name: "Does this count characters with or without spaces?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both. The tool shows total character count (with spaces) and character count without spaces simultaneously.",
      },
    },
  ],
};

export default function WordCounterPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mb-8">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">Word Counter</h1>
        <p className="text-stone-500 mt-1">
          Count words, characters, sentences, and reading time in real time. Free, no login required.
        </p>
      </div>

      <WordCounterTool />

      <section className="mt-12 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">How do I count words online?</p>
            <p className="mt-1">Paste or type your text into the box. Word count, character count, sentences, paragraphs, and reading time update instantly.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Is this word counter free?</p>
            <p className="mt-1">Yes — completely free, no login, no ads, and your text never leaves your browser.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How is reading time calculated?</p>
            <p className="mt-1">Estimated at 200 words per minute, a typical adult reading speed.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does it count characters with or without spaces?</p>
            <p className="mt-1">Both — the tool shows total characters (with spaces) and characters without spaces at the same time.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
