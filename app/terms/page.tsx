import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing your use of the Coded Mind website, free developer tools, resume builder, and candidate accounts.",
  alternates: { canonical: "https://codedmind.co.in/terms" },
  robots: { index: true, follow: true },
};

// Update this whenever the terms below change.
const LAST_UPDATED = "10 August 2026";

export default function TermsPage() {
  return (
    <main className="bg-[#fcfaf6]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Legal</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-stone-950 md:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-sm text-stone-500">Last updated: {LAST_UPDATED}</p>

        <div className="mt-12 space-y-10 text-stone-700">
          <section>
            <h2 className="text-xl font-bold text-stone-950">1. Acceptance</h2>
            <p className="mt-3 leading-relaxed">
              By accessing codedmind.co.in or creating an account, you agree to these terms.
              If you do not agree, please do not use the service. These terms apply
              alongside our{" "}
              <Link href="/privacy" className="font-medium text-amber-700 hover:text-amber-800">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">2. The service</h2>
            <p className="mt-3 leading-relaxed">
              Coded Mind provides data engineering and analytics services, free
              browser-based developer tools, a resume builder, and a candidate portal for
              job applications. Free tools are offered as-is for personal and commercial use
              at no charge, and we may change or withdraw any of them at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">3. Accounts</h2>
            <ul className="mt-3 space-y-2 leading-relaxed list-disc pl-5">
              <li>You must provide accurate information when you register.</li>
              <li>
                You are responsible for keeping your password confidential and for all
                activity under your account.
              </li>
              <li>
                You must be at least 16 years old to create an account.
              </li>
              <li>
                Tell us immediately at hr@codedmind.co.in if you suspect unauthorised access.
              </li>
              <li>
                We may suspend or terminate an account that breaches these terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">4. Acceptable use</h2>
            <p className="mt-3 leading-relaxed">You agree not to:</p>
            <ul className="mt-3 space-y-2 leading-relaxed list-disc pl-5">
              <li>Use the service for anything unlawful, or to infringe anyone&apos;s rights.</li>
              <li>
                Attempt to gain unauthorised access to the service, other accounts, or the
                systems behind them.
              </li>
              <li>
                Interfere with the service — including automated scraping, denial-of-service
                attempts, or circumventing rate limits and usage quotas.
              </li>
              <li>Upload malware, or content that is unlawful, defamatory, or abusive.</li>
              <li>Resell or redistribute the service as your own product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">5. Your content</h2>
            <p className="mt-3 leading-relaxed">
              You keep all rights in the content you create with our tools, including your
              resume data. You grant us only the limited permission needed to operate the
              service on your behalf — for example, sending resume text to our AI provider
              when you explicitly request AI parsing. We do not use your content to train
              our own models, and we do not publish it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">6. AI-generated output</h2>
            <p className="mt-3 leading-relaxed">
              The site assistant and the AI resume parser produce automated output that can
              be incomplete or wrong. Always review it before relying on it. AI features are
              subject to usage quotas that we may change.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">7. Our intellectual property</h2>
            <p className="mt-3 leading-relaxed">
              The Coded Mind name, logo, website design, resume templates, and software are
              our property or licensed to us. You may use the service as intended, but you
              may not copy, modify, or redistribute the underlying software or designs
              without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">8. Availability and changes</h2>
            <p className="mt-3 leading-relaxed">
              We aim to keep the service available but do not guarantee uninterrupted
              access. We may modify, suspend, or discontinue any part of it, and we may
              update these terms. Continued use after a change means you accept the updated
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">9. Disclaimer and liability</h2>
            <p className="mt-3 leading-relaxed">
              The free tools and the website are provided &ldquo;as is&rdquo;, without
              warranties of any kind. To the fullest extent permitted by law, we are not
              liable for indirect or consequential loss, loss of data, or loss of profit
              arising from your use of the free services. Nothing here limits liability that
              cannot lawfully be limited. Paid engagements are governed by the separate
              written agreement for that engagement, which prevails over these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">10. Recruitment</h2>
            <p className="mt-3 leading-relaxed">
              Job listings and application forms do not constitute an offer of employment,
              and submitting an application creates no obligation on either side.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">11. Governing law</h2>
            <p className="mt-3 leading-relaxed">
              These terms are governed by the laws of India, and the courts of India have
              exclusive jurisdiction over any dispute arising from them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">12. Contact</h2>
            <p className="mt-3 leading-relaxed">
              Questions about these terms? Email{" "}
              <a href="mailto:hr@codedmind.co.in" className="font-medium text-amber-700 hover:text-amber-800">
                hr@codedmind.co.in
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-stone-200 pt-8 text-sm text-stone-600">
          See also our{" "}
          <Link href="/privacy" className="font-semibold text-amber-700 hover:text-amber-800">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
