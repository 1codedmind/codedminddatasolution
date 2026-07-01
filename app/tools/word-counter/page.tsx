import type { Metadata } from "next";
import { Suspense } from "react";
import WordCounterTool from "./WordCounterTool";

export const metadata: Metadata = {
  title: "Free Online Word Counter — Words, Characters, Readability & Keyword Density",
  description:
    "Count words, characters, sentences, paragraphs, reading time, speaking time, and page count instantly. See keyword density and Flesch-Kincaid readability score. Free, no login, works in your browser.",
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
        text: "Paste or type your text into the box. Word count, character count, sentences, paragraphs, reading time, and more update instantly as you type.",
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
        text: "Reading time is estimated at 200 words per minute (typical adult reading speed). Speaking time is estimated at 130 words per minute (average speech rate).",
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
    {
      "@type": "Question",
      name: "What is keyword density?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Keyword density shows how often each word appears in your text as a percentage of total words. Common filler words (the, a, is, etc.) are excluded so you see only meaningful keywords.",
      },
    },
    {
      "@type": "Question",
      name: "What does the readability score mean?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The readability score is based on the Flesch-Kincaid Reading Ease formula. It rates text from Very Easy (90–100) to Very Hard (0–30) based on average sentence length and syllable count.",
      },
    },
    {
      "@type": "Question",
      name: "How do the text transformation tools work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The toolbar above the text box lets you convert your text to UPPERCASE, lowercase, Title Case, or Sentence case with one click. You can also remove extra spaces and copy the result.",
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

      <Suspense><WordCounterTool /></Suspense>

      <section className="mt-12 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">How do I count words online?</p>
            <p className="mt-1">Paste or type your text into the box. Word count, character count, sentences, paragraphs, reading time, and more update instantly.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Is this word counter free?</p>
            <p className="mt-1">Yes — completely free, no login, no ads, and your text never leaves your browser.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How is reading time calculated?</p>
            <p className="mt-1">Reading time uses 200 words per minute (typical adult). Speaking time uses 130 words per minute (average speech rate).</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does it count characters with or without spaces?</p>
            <p className="mt-1">Both — the tool shows total characters (with spaces) and characters without spaces simultaneously.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What is keyword density?</p>
            <p className="mt-1">Keyword density shows how often each meaningful word appears as a percentage of total words. Common filler words (the, a, is…) are excluded automatically.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What does the readability score mean?</p>
            <p className="mt-1">It uses the Flesch-Kincaid Reading Ease formula — scores range from Very Easy (90–100) to Very Hard (0–30) based on sentence length and syllable count.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What do the text transformation tools do?</p>
            <p className="mt-1">The toolbar lets you convert your text to UPPERCASE, lowercase, Title Case, or Sentence case instantly. You can also strip extra spaces and copy the result.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
