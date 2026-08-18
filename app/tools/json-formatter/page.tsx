import type { Metadata } from "next";
import { Suspense } from "react";
import JsonFormatterTool from "./JsonFormatterTool";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator — Free Online Tool",
  description:
    "Format, prettify, and validate JSON instantly in your browser. Minify or beautify JSON with adjustable indentation. No data is sent to any server.",
  keywords: ["JSON formatter", "JSON validator", "JSON prettifier", "JSON beautifier", "format JSON online"],
  alternates: { canonical: "https://codedmind.co.in/tools/json-formatter" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I fix invalid JSON?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Paste it in and the tool reports the first syntax error with its position. The usual culprits are trailing commas after the last item, single quotes instead of double quotes, unquoted keys, and comments \u2014 none of which are valid JSON."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between formatting and minifying?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Formatting adds indentation and line breaks so a human can read the structure. Minifying strips every optional space and newline to make the payload as small as possible for transmission. The data is identical either way."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use comments in JSON?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not in standard JSON \u2014 the specification has no comment syntax, so // and /* */ will fail validation. Some parsers accept them as an extension (often called JSONC), but anything strictly following the spec will reject them."
      }
    },
    {
      "@type": "Question",
      "name": "Is my JSON sent to a server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Parsing and formatting use your browser's built-in JSON functions. Nothing leaves your machine, which matters when the JSON you are debugging contains API responses or customer data."
      }
    },
    {
      "@type": "Question",
      "name": "Why does my JSON fail with a trailing comma?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON does not allow a comma after the final element of an array or object, even though JavaScript does. It is the single most common cause of a parse failure when copying code into a JSON file."
      }
    },
    {
      "@type": "Question",
      "name": "What is the largest file I can format?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "There is no hard limit, but very large documents \u2014 tens of megabytes \u2014 may slow your browser down, since the whole structure is held in memory while it is parsed."
      }
    }
  ]
};

export default function JsonFormatterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Suspense>
        <JsonFormatterTool />
      </Suspense>

      {/* Content below the tool: useful to a reader, and the substance search
          engines and ad reviewers look for on an otherwise interactive page. */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
<section className="mt-12 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">About this tool</h2>
        <p className="text-sm leading-relaxed text-stone-600">Paste minified or messy JSON and get it back readable, with syntax errors pinpointed as you type. Formatting, validating, and minifying all happen in your browser.</p>
      </section>

<section className="mt-10 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">How do I fix invalid JSON?</p>
            <p className="mt-1">Paste it in and the tool reports the first syntax error with its position. The usual culprits are trailing commas after the last item, single quotes instead of double quotes, unquoted keys, and comments — none of which are valid JSON.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What is the difference between formatting and minifying?</p>
            <p className="mt-1">Formatting adds indentation and line breaks so a human can read the structure. Minifying strips every optional space and newline to make the payload as small as possible for transmission. The data is identical either way.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Can I use comments in JSON?</p>
            <p className="mt-1">Not in standard JSON — the specification has no comment syntax, so // and /* */ will fail validation. Some parsers accept them as an extension (often called JSONC), but anything strictly following the spec will reject them.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Is my JSON sent to a server?</p>
            <p className="mt-1">No. Parsing and formatting use your browser&apos;s built-in JSON functions. Nothing leaves your machine, which matters when the JSON you are debugging contains API responses or customer data.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Why does my JSON fail with a trailing comma?</p>
            <p className="mt-1">JSON does not allow a comma after the final element of an array or object, even though JavaScript does. It is the single most common cause of a parse failure when copying code into a JSON file.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What is the largest file I can format?</p>
            <p className="mt-1">There is no hard limit, but very large documents — tens of megabytes — may slow your browser down, since the whole structure is held in memory while it is parsed.</p>
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
