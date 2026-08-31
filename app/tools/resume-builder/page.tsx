import type { Metadata } from "next";

import ResumeBuilderClient from "@/components/resume-builder/ResumeBuilderClient";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Free Resume Builder — Templates & PDF Download",
  description:
    "Build a professional resume in minutes — five templates, custom colours, instant PDF. Runs in your browser, so your details are never uploaded. Free.",
  alternates: { canonical: "https://codedmind.co.in/tools/resume-builder" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Free Resume Builder — Coded Mind",
    description: "Professional resume builder with five templates and instant PDF download.",
    url: "https://codedmind.co.in/tools/resume-builder",
  },
};

const faqs = [
  {
    q: "Is this resume builder really free?",
    a: "Yes. Every template and the PDF download are free, with no signup and no watermark. The editor runs entirely in your browser, so the details you type are never uploaded to a server.",
  },
  {
    q: "Will my resume pass an ATS?",
    a: "The templates use standard section headings, real selectable text rather than images, and a single-column reading order where it matters. That is what applicant tracking systems parse reliably. Avoid adding tables or graphics on top of the generated PDF.",
  },
  {
    q: "Can I download my resume as a PDF?",
    a: "Yes. The download produces a print-quality PDF with selectable text, generated in your browser. You can re-download as many times as you like.",
  },
  {
    q: "Do you store my personal details?",
    a: "No. The builder keeps your draft in your own browser so you can come back to it, and nothing is sent to us. Clearing your browser data removes it.",
  },
  {
    q: "How long should a resume be?",
    a: "One page for most people, and two only once you have roughly a decade of relevant experience. Recruiters scan rather than read, so the first third of page one carries most of the weight.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

/**
 * The editor itself is client-only (`ssr: false`), so a crawler previously
 * received a page with no heading and no content — 153 words, all of it site
 * chrome. The section below is server-rendered, which gives the page a real
 * H1, indexable copy, and FAQ structured data without changing the editor.
 */
export default function ResumeBuilderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Tools", path: "/tools" },
          { name: "Resume Builder", path: "/tools/resume-builder" },
        ]}
      />

      <ResumeBuilderClient />

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-950">
            Free resume builder
          </h1>
          <p className="mt-4 leading-relaxed text-stone-600">
            Fill in your details, pick one of five templates, and download a
            print-quality PDF. The editor above runs entirely in your browser —
            your name, history and contact details are never sent to a server,
            and your draft is saved locally so you can come back to it.
          </p>

          <h2 className="mt-10 text-lg font-bold text-stone-800">
            Frequently asked questions
          </h2>
          <div className="mt-4 space-y-4 text-sm text-stone-600">
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <p className="font-semibold text-stone-700">{q}</p>
                <p className="mt-1 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
