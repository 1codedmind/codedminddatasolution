import type { Metadata } from "next";
import { Suspense } from "react";
import WordCounterTool from "./WordCounterTool";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Word Counter — Audience Targets & Social Previews",
  description:
    "Pick your audience and every target adjusts. Catch passive voice, adverbs and fillers, track an SEO keyword, and preview how text truncates on Google and X.",
  alternates: { canonical: "https://codedmind.co.in/tools/word-counter" },
  openGraph: {
    images: ["/opengraph-image"],
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
        text: "Yes, completely free with no login. Your text is analysed entirely in your browser and is never uploaded to a server.",
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
        text: "The toolbar lets you convert text to UPPERCASE, lowercase, Title Case, or Sentence case. You can also sort lines A–Z or Z–A, remove empty lines, remove duplicate lines, and reverse words — all with one click.",
      },
    },
    {
      "@type": "Question",
      name: "What are the platform character limits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The always-visible \"Will it fit?\" panel shows how your text measures against Twitter/X (280 chars), SMS (160), Instagram bio (150), YouTube title (100), SEO title tag (60), email subject (78), meta description (155), and LinkedIn post (3000). Bars turn amber when approaching the limit and red when over.",
      },
    },
    {
      "@type": "Question",
      name: "How does Find & Replace work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Click Find & Replace in the toolbar to open the panel. Enter the word or phrase to find, optionally a replacement, then click Replace all. A match count shows how many occurrences were found.",
      },
    },
    {
      "@type": "Question",
      name: "Does it check for passive voice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Style tab finds likely passive constructions such as 'was written' or 'is being reviewed' and lists each one, alongside the share of sentences that are passive. The acceptable share follows your audience: plain-language writing targets under 10%, while academic and legal writing use the passive deliberately and tolerate far more. Detection is pattern matching rather than full grammar parsing, so it catches most cases and will occasionally misfire.",
      },
    },
    {
      "@type": "Question",
      name: "What does the Style tab show content writers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Four measures every editor asks about: passive voice, adverbs, filler and hedging words such as 'very' and 'just', and the share of complex three-syllable words. It also charts sentence rhythm, because prose where every sentence is the same length reads as monotonous even when each sentence is fine on its own. Each measure is scored against your chosen audience rather than one fixed rule.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track an SEO focus keyword?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Enter your target term in the filters and the Style tab reports how many times it appears, its density as a share of total words, and whether it appears in the first line and within the opening 100 words. A density between roughly 1% and 2.5% is the usual guidance; the tool marks whether you are inside that range.",
      },
    },
    {
      "@type": "Question",
      name: "Can I check readability for a specific audience?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Choose who you are writing for — general public, children, teens, marketing, news, business, technical, academic, legal or email — and the targets change with it. Each audience carries its own grade band, Flesch range, sentence-length limit and reading speed, so the same paragraph can read as too complex for a general audience, on target for a business one, and too simple for an academic one. A plain 'Difficult' score tells you nothing until you know who is reading.",
      },
    },
    {
      "@type": "Question",
      name: "Why does it refuse to score very short text?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Flesch-Kincaid is unreliable on a few sentences: one long sentence of technical words can score past grade 30, which is not a real reading level. Below about 25 words we say so rather than show a confident number that is wrong. Grade level is also capped at 20, since nothing above that carries extra meaning.",
      },
    },
    {
      "@type": "Question",
      name: "Why is your character count different from other word counters?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most counters report String.length, which counts a thumbs-up emoji as 2 and a family emoji as 11. We count graphemes — characters as a person perceives them — so an emoji counts as 1. Where the two differ we also show the UTF-16 figure, because some systems bill or limit by that instead.",
      },
    },
    {
      "@type": "Question",
      name: "How many SMS messages will my text send as?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The SMS preview shows the real segment count. Plain text uses GSM-7 encoding at 160 characters per segment, but a single emoji, curly apostrophe or other non-GSM character switches the entire message to UCS-2, which holds only 70 per segment. Multipart messages lose further space to headers, giving 153 (GSM-7) or 67 (UCS-2) per segment. Most providers bill every segment, so this is the number that decides the cost.",
      },
    },
    {
      "@type": "Question",
      name: "Why does X count my link as 23 characters?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "X wraps every link in its t.co shortener, so any URL counts as exactly 23 characters against the 280 limit no matter how long it really is. X also uses a weighted length where emoji and CJK characters count as two. Our X preview applies both rules, so the count matches what the real composer shows.",
      },
    },
    {
      "@type": "Question",
      name: "Does Google cut titles by character count or pixel width?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pixel width. A title of wide letters can be truncated while a longer title of narrow letters survives, which is why character-count rules of thumb are unreliable. The Google preview measures your title and description in pixels using Google's desktop font, against roughly 600px for titles and 960px for descriptions, and shows where the cut falls.",
      },
    },
    {
      "@type": "Question",
      name: "Does it save my text if I close the tab?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Your draft is saved automatically in your own browser as you type, and restored the next time you open the page. It is stored locally with localStorage and never sent to a server, so clearing your browser data or using a different device or private window will start you fresh.",
      },
    },
    {
      "@type": "Question",
      name: "Can I set a word count goal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Choose a preset such as 500 or 1,000 words, or type any custom target. A progress ring next to the word count fills as you write and turns green when you reach the goal. Your goal is remembered between visits.",
      },
    },
    {
      "@type": "Question",
      name: "What are repeated phrases?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Phrases tab counts two- and three-word combinations you have used more than once. It is useful for catching unintentional verbal tics, and for seeing the long-tail phrases a search engine would associate with your page.",
      },
    },
    {
      "@type": "Question",
      name: "How do I find sentences that are too long?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Long sentences tab lists every sentence over 25 words, longest first, and marks anything over 35 words as very hard to follow. Sentences over 25 words are where readers most often lose the thread, so splitting the longest one or two usually lifts the whole readability score.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Reading Grade level?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reading Grade uses the Flesch-Kincaid Grade Level formula to estimate the US school grade level needed to easily understand your text. Grade 5–6 is elementary, 9–12 is high school, and 13+ is college level.",
      },
    },
  ],
};

export default function WordCounterPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 xl:max-w-[88rem] 2xl:max-w-[96rem]">
      <BreadcrumbJsonLd items={[{ name: "Tools", path: "/tools" }, { name: "Word Counter", path: "/tools/word-counter" }]} />
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

      <section className="mt-12 max-w-3xl space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">How do I count words online?</p>
            <p className="mt-1">Paste or type your text into the box. Word count, character count, sentences, paragraphs, reading time, and more update instantly.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Is this word counter free?</p>
            <p className="mt-1">Yes — completely free and no login. Your text is analysed entirely in your browser and is never uploaded to a server.</p>
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
            <p className="mt-1">The toolbar lets you convert to UPPERCASE, lowercase, Title Case, or Sentence case. You can also sort lines A–Z or Z–A, remove empty or duplicate lines, and reverse word order.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What are the platform character limits?</p>
            <p className="mt-1">The &ldquo;Will it fit?&rdquo; panel is always visible and shows how your text measures against Twitter/X (280), SMS (160), Instagram bio (150), YouTube title (100), SEO title (60), meta description (155), and LinkedIn post (3,000). Bars turn amber near the limit and red when exceeded.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How does Find &amp; Replace work?</p>
            <p className="mt-1">Click &ldquo;Find &amp; Replace&rdquo; in the toolbar to reveal the panel. Type a search term to see the match count, add a replacement, then hit Replace all. Toggle Match case for exact-case matching.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does it check for passive voice?</p>
            <p className="mt-1">Yes. The Style tab lists likely passive constructions such as &ldquo;was written&rdquo; or &ldquo;is being reviewed&rdquo;, plus the share of sentences that are passive. The acceptable share follows your audience — plain language targets under 10%, while academic and legal writing tolerate far more. Detection is pattern matching, not full grammar parsing, so it occasionally misfires.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What does the Style tab show content writers?</p>
            <p className="mt-1">Passive voice, adverbs, filler words like &ldquo;very&rdquo; and &ldquo;just&rdquo;, and the share of complex three-syllable words — plus a sentence-rhythm chart, because prose where every sentence is the same length reads as monotonous even when each one is fine. Every measure is scored against your chosen audience.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Can I track an SEO focus keyword?</p>
            <p className="mt-1">Enter your target term in the filters and you get its count, density, and whether it appears in the first line and the opening 100 words. Roughly 1–2.5% density is the usual guidance, and the tool marks whether you are inside it.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Can I check readability for a specific audience?</p>
            <p className="mt-1">Yes — pick who you are writing for in the filters and every target moves with it. Each audience has its own grade band, sentence-length limit and reading speed, so the same paragraph can read as too complex for a general audience, on target for a business one, and too simple for an academic one. &ldquo;Difficult&rdquo; means nothing until you know who is reading.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Why does it refuse to score very short text?</p>
            <p className="mt-1">Flesch-Kincaid is unreliable on a few sentences — one long technical sentence can score past grade 30, which is not a real reading level. Under about 25 words we say so instead of showing a confident number that is wrong, and grade is capped at 20.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Why is your character count different from other word counters?</p>
            <p className="mt-1">Most tools report <code className="rounded bg-stone-100 px-1 text-[13px]">String.length</code>, which counts 👍 as 2 and a family emoji as 11. We count graphemes — characters as a person perceives them — so an emoji counts as 1. Where the two differ we show the UTF-16 figure too, since some systems limit by that.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How many SMS messages will my text send as?</p>
            <p className="mt-1">The SMS preview shows the real segment count. Plain text uses GSM-7 at 160 per segment, but one emoji or curly apostrophe switches the whole message to UCS-2 at just 70. Multipart messages drop to 153 or 67. Most providers bill every segment, so this is the number that decides the cost.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Why does X count my link as 23 characters?</p>
            <p className="mt-1">X wraps every link in t.co, so any URL counts as exactly 23 against the 280 limit however long it is. X also weights emoji and CJK characters as two. Our preview applies both rules, so the count matches the real composer.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does Google cut titles by character count or pixel width?</p>
            <p className="mt-1">Pixel width. A title of wide letters can be cut while a longer one of narrow letters survives, which is why character rules of thumb are unreliable. The Google preview measures your title and description in pixels against roughly 600px and 960px, and shows where the cut lands.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does it save my text if I close the tab?</p>
            <p className="mt-1">Yes. Your draft saves automatically in your own browser as you type and is restored next time you visit. It never leaves your device, so clearing browser data, switching device, or using a private window starts you fresh.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Can I set a word count goal?</p>
            <p className="mt-1">Pick a preset such as 500 or 1,000 words, or type any custom target. A progress ring beside the word count fills as you write and turns green when you hit it. The goal is remembered between visits.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What are repeated phrases?</p>
            <p className="mt-1">The Phrases tab counts two- and three-word combinations used more than once — useful for catching unintentional tics, and for seeing the long-tail phrases search engines associate with your page.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">How do I find sentences that are too long?</p>
            <p className="mt-1">The Long sentences tab lists every sentence over 25 words, longest first, and marks anything over 35 as very hard to follow. Splitting the longest one or two usually lifts the whole readability score.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What is the Reading Grade?</p>
            <p className="mt-1">Reading Grade uses the Flesch-Kincaid Grade Level formula — it estimates the US school grade level a reader needs to understand your text easily. Grade 5–6 is elementary, 9–12 high school, 13+ college.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
