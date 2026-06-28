import type { Metadata } from "next";
import PasswordGeneratorTool from "./PasswordGeneratorTool";

export const metadata: Metadata = {
  title: "Free Password Generator — Strong Random Passwords Online",
  description:
    "Generate strong, random passwords instantly. Choose length, uppercase, lowercase, numbers, and symbols. Free, runs in your browser — your password is never sent anywhere.",
  alternates: { canonical: "https://codedmind.co.in/tools/password-generator" },
  openGraph: {
    title: "Free Password Generator — Strong Random Passwords Online",
    description: "Generate secure random passwords in your browser. Customize length and character types. Free, no login, nothing is sent to a server.",
    url: "https://codedmind.co.in/tools/password-generator",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this password generator safe to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Passwords are generated entirely in your browser using the Web Crypto API. Nothing is ever sent to a server, so only you see the generated password.",
      },
    },
    {
      "@type": "Question",
      name: "What makes a strong password?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A strong password is at least 12 characters long and includes a mix of uppercase letters, lowercase letters, numbers, and symbols. The longer and more varied, the harder it is to crack.",
      },
    },
    {
      "@type": "Question",
      name: "How long should my password be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Security experts recommend at least 16 characters for most accounts. For critical accounts like email or banking, use 20+ characters with all character types enabled.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use this password generator for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely free with no login required. Generate as many passwords as you need.",
      },
    },
  ],
};

export default function PasswordGeneratorPage() {
  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mb-8">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">Password Generator</h1>
        <p className="text-stone-500 mt-1">
          Generate strong, random passwords in your browser. Nothing is sent to a server.
        </p>
      </div>

      <PasswordGeneratorTool />

      <section className="mt-12 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">Is this password generator safe?</p>
            <p className="mt-1">Yes. Passwords are generated in your browser using the Web Crypto API. Nothing is ever sent to a server — only you see the result.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What makes a strong password?</p>
            <p className="mt-1">At least 12 characters with a mix of uppercase, lowercase, numbers, and symbols. The longer and more varied, the harder it is to crack.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How long should my password be?</p>
            <p className="mt-1">At least 16 characters for most accounts. For email or banking, use 20+ characters with all character types enabled.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Is it free?</p>
            <p className="mt-1">Completely free, no login required. Generate as many passwords as you need.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
