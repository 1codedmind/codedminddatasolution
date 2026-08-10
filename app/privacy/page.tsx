import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Coded Mind collects, uses, stores, and protects your personal data across our website, free developer tools, resume builder, and candidate accounts.",
  alternates: { canonical: "https://codedmind.co.in/privacy" },
  robots: { index: true, follow: true },
};

// Update this whenever the policy text below changes.
const LAST_UPDATED = "10 August 2026";

export default function PrivacyPage() {
  return (
    <main className="bg-[#fcfaf6]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Legal</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-stone-950 md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-stone-500">Last updated: {LAST_UPDATED}</p>

        <div className="prose-legal mt-12 space-y-10 text-stone-700">
          <section>
            <h2 className="text-xl font-bold text-stone-950">1. Who we are</h2>
            <p className="mt-3 leading-relaxed">
              Coded Mind (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates{" "}
              <span className="font-medium">codedmind.co.in</span> and provides data
              engineering services, free browser-based developer tools, a resume builder,
              and a candidate portal. For any privacy question, contact us at{" "}
              <a href="mailto:hr@codedmind.co.in" className="font-medium text-amber-700 hover:text-amber-800">
                hr@codedmind.co.in
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">2. What we collect</h2>
            <ul className="mt-3 space-y-2 leading-relaxed list-disc pl-5">
              <li>
                <strong>Contact enquiries.</strong> Name, email address, and optionally
                phone number, company, and your message, when you submit our contact form.
              </li>
              <li>
                <strong>Account data.</strong> Full name, email address, and a securely
                hashed password when you create a candidate account. We never store your
                password in readable form.
              </li>
              <li>
                <strong>Resume content.</strong> If you use the AI resume upload, the text
                extracted from your file is sent to our AI provider for parsing. We store a
                timestamped usage record (not the resume content) to enforce plan limits.
              </li>
              <li>
                <strong>Employment data.</strong> If you are an employee or contractor, our
                internal HR system holds the records needed to administer your employment.
              </li>
              <li>
                <strong>Usage analytics.</strong> Anonymised page and event data, only if
                you accept analytics cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">3. What we do not collect</h2>
            <p className="mt-3 leading-relaxed">
              Our free developer tools — the JSON formatter, Base64 encoder, UUID generator,
              password generator, word counter, timestamp and timezone converters, and the
              PDF tools — run entirely in your browser. The content you paste or the files
              you upload to those tools are never transmitted to our servers. The one
              exception is the optional AI resume upload described above, which is clearly
              labelled where it appears.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">4. Why we use your data</h2>
            <ul className="mt-3 space-y-2 leading-relaxed list-disc pl-5">
              <li>To reply to your enquiry and provide the services you request.</li>
              <li>To create and secure your account, and to authenticate you.</li>
              <li>To send transactional email such as password reset links.</li>
              <li>To administer job applications and, where applicable, employment.</li>
              <li>To understand aggregate site usage and improve the product.</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              We do not sell your personal data, and we do not use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">5. Cookies and similar technologies</h2>
            <p className="mt-3 leading-relaxed">
              We set a strictly necessary, HTTP-only session cookie when you sign in; it
              expires after 24 hours and cannot be read by JavaScript. We store your cookie
              preference in your browser&apos;s local storage. Google Analytics cookies are
              loaded <em>only</em> after you accept analytics cookies in the consent banner.
              You can withdraw consent at any time by clearing your browser storage for this
              site, and the banner will ask again.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">6. Service providers</h2>
            <p className="mt-3 leading-relaxed">
              We share data only with providers that help us run the service, under their
              own data protection terms: our hosting provider (Vercel), our database
              provider (Neon), our transactional email provider (Resend), our AI provider
              for resume parsing and the site assistant (Cloudflare Workers AI), and Google
              Analytics where consented. Some of these providers process data outside India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">7. How long we keep it</h2>
            <p className="mt-3 leading-relaxed">
              Contact enquiries are retained while they remain commercially relevant.
              Account data is retained for as long as your account is active. Password reset
              tokens expire after one hour. Employment records are retained for the period
              required by applicable law. You can ask us to delete your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">8. Your rights</h2>
            <p className="mt-3 leading-relaxed">
              You may request access to, correction of, or deletion of your personal data,
              and you may object to or restrict certain processing. Write to{" "}
              <a href="mailto:hr@codedmind.co.in" className="font-medium text-amber-700 hover:text-amber-800">
                hr@codedmind.co.in
              </a>{" "}
              and we will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">9. Security</h2>
            <p className="mt-3 leading-relaxed">
              Passwords are hashed with a per-user salt. Sessions use signed, HTTP-only
              cookies. Traffic is served over HTTPS with a strict content security policy,
              and authentication endpoints are rate limited. No system is perfectly secure,
              but we take these measures seriously and review them regularly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">10. Children</h2>
            <p className="mt-3 leading-relaxed">
              Our services are not directed at children under 16, and we do not knowingly
              collect their personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-950">11. Changes to this policy</h2>
            <p className="mt-3 leading-relaxed">
              We may update this policy from time to time. The &ldquo;last updated&rdquo;
              date above always reflects the current version. Material changes will be
              announced on this page.
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-stone-200 pt-8 text-sm text-stone-600">
          See also our{" "}
          <Link href="/terms" className="font-semibold text-amber-700 hover:text-amber-800">
            Terms &amp; Conditions
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
