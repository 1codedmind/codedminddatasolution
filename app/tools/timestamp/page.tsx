import type { Metadata } from "next";
import { Suspense } from "react";
import TimestampTool from "./TimestampTool";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter — Epoch to Date & Date to Unix Online",
  description:
    "Convert Unix timestamps to readable dates and back. Free online epoch converter — supports seconds and milliseconds, UTC, ISO 8601, and local time. No login needed.",
  alternates: { canonical: "https://codedmind.co.in/tools/timestamp" },
  openGraph: {
    title: "Unix Timestamp Converter — Epoch to Date Online",
    description: "Convert Unix/epoch timestamps to UTC, ISO 8601, and local date — or any date to a Unix timestamp. Free, instant, no login.",
    url: "https://codedmind.co.in/tools/timestamp",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Unix timestamp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since January 1, 1970 at 00:00:00 UTC. It is widely used in databases, APIs, and programming languages to represent a point in time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I convert a Unix timestamp to a date?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Enter your Unix timestamp (in seconds or milliseconds) in the first input above. The tool automatically detects the unit and shows the equivalent UTC, ISO 8601, and local date-time.",
      },
    },
    {
      "@type": "Question",
      name: "How do I convert a date to a Unix timestamp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the Date → Unix section. Pick a date and time and the tool instantly shows you the Unix timestamp in both seconds and milliseconds.",
      },
    },
    {
      "@type": "Question",
      name: "Does it support milliseconds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The converter automatically detects whether your input is in seconds or milliseconds based on its magnitude, and outputs both when converting a date.",
      },
    },
  ],
};

export default function TimestampPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mb-8">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">Unix Timestamp Converter</h1>
        <p className="text-stone-500 mt-1">
          Convert epoch timestamps to readable dates and back — UTC, ISO 8601, and local time. Free, no login.
        </p>
      </div>

      <Suspense><TimestampTool /></Suspense>

      <section className="mt-12 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">What is a Unix timestamp?</p>
            <p className="mt-1">A Unix timestamp (epoch time) is the number of seconds elapsed since January 1, 1970 at 00:00:00 UTC. It is the standard way most databases, APIs, and programming languages represent time.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How do I convert epoch to a readable date?</p>
            <p className="mt-1">Paste your timestamp into the first box. The tool detects seconds vs. milliseconds automatically and shows UTC, ISO 8601, and your local time instantly.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How do I convert a date to Unix?</p>
            <p className="mt-1">Use the Date → Unix section. Pick any date and time to get both the seconds and milliseconds Unix timestamp.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does it support milliseconds?</p>
            <p className="mt-1">Yes — it auto-detects seconds vs. milliseconds based on the size of the number, and always outputs both formats.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
