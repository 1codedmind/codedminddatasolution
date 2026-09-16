import type { ReactNode } from "react";

/**
 * Substantive page content for a PDF tool.
 *
 * The PDF tool pages carried 67–103 unique words each — near-identical
 * templates differing by a verb. AdSense rejected the site for "low value
 * content", and pages like that are exactly what the policy describes.
 *
 * The answer is not padding. Each tool genuinely has things worth explaining
 * that no generic article covers: that it runs pdf-lib in the visitor's own
 * browser so nothing is uploaded, the real file and size limits enforced in
 * the code, and the specific ways PDFs behave that surprise people. That is
 * information only we can write, and it is useful whether or not it helps a
 * review.
 */

export type GuideFaq = { q: string; a: string };

export type ToolGuideProps = {
  /** "Merge PDF" — used in prose and the schema. */
  name: string;
  /** What the tool does and why you would reach for it. */
  intro: ReactNode;
  /** Numbered steps. Kept short — the tool is above, this is a reference. */
  steps: string[];
  /** Real limits enforced by the code, not marketing rounding. */
  limits: { label: string; value: string }[];
  /** Behaviour worth knowing before you rely on it. */
  notes: ReactNode[];
  faqs: GuideFaq[];
};

export function ToolGuide({ name, intro, steps, limits, notes, faqs }: ToolGuideProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-stone-200 pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-extrabold tracking-tight text-stone-950">
        About {name}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-stone-600">{intro}</div>

      <h3 className="mt-10 text-lg font-bold text-stone-900">How to use it</h3>
      <ol className="mt-3 space-y-2.5">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3 text-stone-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-500">
              {i + 1}
            </span>
            <span className="leading-relaxed">{s}</span>
          </li>
        ))}
      </ol>

      <h3 className="mt-10 text-lg font-bold text-stone-900">Limits</h3>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {limits.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-stone-200 px-4 py-3">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
              {label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-stone-800">{value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-10 text-lg font-bold text-stone-900">Worth knowing</h3>
      <ul className="mt-3 space-y-3">
        {notes.map((n, i) => (
          <li key={i} className="flex gap-3 leading-relaxed text-stone-600">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" />
            <span>{n}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-lg font-bold text-stone-900">
        Frequently asked questions
      </h3>
      <div className="mt-3 space-y-4">
        {faqs.map(({ q, a }) => (
          <div key={q}>
            <p className="font-semibold text-stone-800">{q}</p>
            <p className="mt-1 leading-relaxed text-stone-600">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
