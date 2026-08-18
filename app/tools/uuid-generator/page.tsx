import type { Metadata } from "next";
import { Suspense } from "react";
import UuidGeneratorTool from "./UuidGeneratorTool";

export const metadata: Metadata = {
  title: "UUID Generator — Free Online UUIDv4 Generator",
  description:
    "Generate multiple UUIDs (UUIDv4) instantly in your browser. Copy individual UUIDs or all at once. No signup required.",
  keywords: ["UUID generator", "UUID v4", "GUID generator", "random UUID", "online UUID"],
  alternates: { canonical: "https://codedmind.co.in/tools/uuid-generator" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a UUID?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A UUID (Universally Unique Identifier) is a 128-bit value written as 36 characters, such as 3f2504e0-4f89-41d3-9a0c-0305e82c3301. It is designed so that anyone can generate one independently without coordinating with a central authority, and still not collide with anyone else's."
      }
    },
    {
      "@type": "Question",
      "name": "What is a version 4 UUID?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Version 4 UUIDs are generated from random data rather than from a timestamp or hardware address. That makes them the right choice when you do not want the identifier to leak when or where it was created."
      }
    },
    {
      "@type": "Question",
      "name": "Can two UUIDs ever be the same?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In theory yes, in practice no. A v4 UUID has 122 random bits, giving about 5.3 x 10^36 possibilities. You would need to generate billions per second for many years before a collision became likely."
      }
    },
    {
      "@type": "Question",
      "name": "Are these UUIDs cryptographically secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. They use crypto.getRandomValues(), your browser's cryptographically secure random source, rather than Math.random(). That matters if the identifier must be unguessable, such as a share link or session token."
      }
    },
    {
      "@type": "Question",
      "name": "Should I use a UUID as a database primary key?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It depends. UUIDs let you generate ids on the client and merge data across systems without collisions, but they are larger than integers and randomly ordered, which can hurt index performance on very large tables. Many teams use UUIDs as public identifiers and integers internally."
      }
    },
    {
      "@type": "Question",
      "name": "Is anything sent to a server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Generation happens entirely in your browser. The UUIDs you see are never transmitted, logged, or stored anywhere, so they are safe to use as secrets."
      }
    }
  ]
};

export default function UuidGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Suspense>
        <UuidGeneratorTool />
      </Suspense>

      {/* Content below the tool: useful to a reader, and the substance search
          engines and ad reviewers look for on an otherwise interactive page. */}
      <div className="max-w-3xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
<section className="mt-12 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">About this tool</h2>
        <p className="text-sm leading-relaxed text-stone-600">Generate version 4 UUIDs using your browser&apos;s cryptographic random number generator. One at a time, or up to 100 at once for seeding a database or test fixtures.</p>
      </section>

<section className="mt-10 space-y-4 border-t border-stone-100 pt-10">
        <h2 className="text-lg font-bold text-stone-800">Frequently asked questions</h2>
        <div className="space-y-4 text-sm text-stone-600">
          <div>
            <p className="font-semibold text-stone-700">What is a UUID?</p>
            <p className="mt-1">A UUID (Universally Unique Identifier) is a 128-bit value written as 36 characters, such as 3f2504e0-4f89-41d3-9a0c-0305e82c3301. It is designed so that anyone can generate one independently without coordinating with a central authority, and still not collide with anyone else&apos;s.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">What is a version 4 UUID?</p>
            <p className="mt-1">Version 4 UUIDs are generated from random data rather than from a timestamp or hardware address. That makes them the right choice when you do not want the identifier to leak when or where it was created.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Can two UUIDs ever be the same?</p>
            <p className="mt-1">In theory yes, in practice no. A v4 UUID has 122 random bits, giving about 5.3 x 10^36 possibilities. You would need to generate billions per second for many years before a collision became likely.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Are these UUIDs cryptographically secure?</p>
            <p className="mt-1">Yes. They use crypto.getRandomValues(), your browser&apos;s cryptographically secure random source, rather than Math.random(). That matters if the identifier must be unguessable, such as a share link or session token.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Should I use a UUID as a database primary key?</p>
            <p className="mt-1">It depends. UUIDs let you generate ids on the client and merge data across systems without collisions, but they are larger than integers and randomly ordered, which can hurt index performance on very large tables. Many teams use UUIDs as public identifiers and integers internally.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700">Is anything sent to a server?</p>
            <p className="mt-1">No. Generation happens entirely in your browser. The UUIDs you see are never transmitted, logged, or stored anywhere, so they are safe to use as secrets.</p>
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
