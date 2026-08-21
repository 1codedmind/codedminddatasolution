import type { Metadata } from "next";
import { Suspense } from "react";
import Base64Tool from "./Base64Tool";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder — Free Online Tool",
  description:
    "Encode text to Base64 or decode Base64 strings instantly in your browser. Fast, free, and no data is sent to any server.",
  keywords: ["Base64 encoder", "Base64 decoder", "Base64 converter", "encode Base64", "decode Base64 online"],
  alternates: { canonical: "https://codedmind.co.in/tools/base64" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Base64 encoding used for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Base64 lets binary data pass through text-only channels. Common uses are embedding images directly in HTML or CSS as data URIs, attaching files to emails, putting binary values inside JSON, and encoding credentials in HTTP Basic Auth headers."
      }
    },
    {
      "@type": "Question",
      "name": "Is Base64 encryption?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Base64 is encoding, not encryption. Anyone can decode it instantly \u2014 this tool does it in one click. Never use Base64 to protect passwords, tokens, or personal data; use real encryption for that."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Base64 make data bigger?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Base64 represents every 3 bytes as 4 characters, so encoded output is roughly 33% larger than the original. That is the cost of making binary data safe to transmit as text."
      }
    },
    {
      "@type": "Question",
      "name": "What do the equals signs at the end mean?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They are padding. Base64 works in blocks of three bytes; when the input does not divide evenly, one or two = characters pad the final block. A valid Base64 string is always a multiple of four characters long."
      }
    },
    {
      "@type": "Question",
      "name": "Does my data get uploaded anywhere?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Encoding and decoding both run in your browser using its built-in functions. Nothing you paste is sent to a server, logged, or stored \u2014 you can disconnect from the internet and the tool still works."
      }
    },
    {
      "@type": "Question",
      "name": "Does it handle emoji and non-English text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Text is converted to UTF-8 before encoding, so accented characters, emoji, and non-Latin scripts all round-trip correctly."
      }
    }
  ]
};

export default function Base64Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Tools", path: "/tools" }, { name: "Base64 Encoder", path: "/tools/base64" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Suspense>
        <Base64Tool />
      </Suspense>

      {/* Content below the tool: useful to a reader, and the substance search
          engines and ad reviewers look for on an otherwise interactive page. */}
      <div className="max-w-5xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
<section className="mt-12 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">About this tool</h2>
        <p className="text-sm leading-relaxed text-stone-600">Base64 turns binary data into plain text using 64 safe characters, so it can travel through systems that only handle text — email bodies, JSON payloads, data URIs, and HTTP headers. This tool encodes and decodes it entirely in your browser.</p>
      </section>

<section className="mt-10 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">What is Base64 encoding used for?</p>
            <p className="mt-1">Base64 lets binary data pass through text-only channels. Common uses are embedding images directly in HTML or CSS as data URIs, attaching files to emails, putting binary values inside JSON, and encoding credentials in HTTP Basic Auth headers.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Is Base64 encryption?</p>
            <p className="mt-1">No. Base64 is encoding, not encryption. Anyone can decode it instantly — this tool does it in one click. Never use Base64 to protect passwords, tokens, or personal data; use real encryption for that.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Why does Base64 make data bigger?</p>
            <p className="mt-1">Base64 represents every 3 bytes as 4 characters, so encoded output is roughly 33% larger than the original. That is the cost of making binary data safe to transmit as text.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What do the equals signs at the end mean?</p>
            <p className="mt-1">They are padding. Base64 works in blocks of three bytes; when the input does not divide evenly, one or two = characters pad the final block. A valid Base64 string is always a multiple of four characters long.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does my data get uploaded anywhere?</p>
            <p className="mt-1">No. Encoding and decoding both run in your browser using its built-in functions. Nothing you paste is sent to a server, logged, or stored — you can disconnect from the internet and the tool still works.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Does it handle emoji and non-English text?</p>
            <p className="mt-1">Yes. Text is converted to UTF-8 before encoding, so accented characters, emoji, and non-Latin scripts all round-trip correctly.</p>
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
