import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Briefcase, Clock, Globe } from "lucide-react";

import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Coded Mind about data engineering, cloud data platforms, dashboards, and automation. Email hr@codedmind.co.in or send us a message — we reply within 1–2 business days.",
  alternates: { canonical: "https://codedmind.co.in/contact" },
  openGraph: {
    title: "Contact Coded Mind",
    description: "Tell us what you're building. We reply within 1–2 business days.",
    url: "https://codedmind.co.in/contact",
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Coded Mind",
  url: "https://codedmind.co.in/contact",
  mainEntity: {
    "@type": "Organization",
    name: "Coded Mind",
    url: "https://codedmind.co.in",
    email: "hr@codedmind.co.in",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hr@codedmind.co.in",
      availableLanguage: ["English"],
    },
  },
};

const facts = [
  { Icon: Mail, label: "Email", value: "hr@codedmind.co.in", href: "mailto:hr@codedmind.co.in" },
  { Icon: Clock, label: "Response time", value: "Within 1–2 business days" },
  { Icon: Globe, label: "Availability", value: "Remote projects worldwide" },
  { Icon: Briefcase, label: "Careers", value: "View open positions", href: "/careers" },
];

export default function ContactPage() {
  return (
    <main className="bg-stone-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
              Contact
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.07]">
              Tell us what you&apos;re<br />working on.
            </h1>
            <p className="mt-5 text-stone-400 text-base leading-relaxed max-w-md">
              Whether it&apos;s a pipeline that keeps breaking, a report nobody trusts, or a
              platform you haven&apos;t built yet — send us the details and we&apos;ll come back
              with a straight answer. No commitment required.
            </p>

            <dl className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {facts.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#C87660]" />
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
                      {label}
                    </dt>
                    <dd className="text-sm text-stone-300 mt-1">
                      {href ? (
                        href.startsWith("mailto:") ? (
                          <a href={href} className="hover:text-white transition-colors underline underline-offset-2">
                            {value}
                          </a>
                        ) : (
                          <Link href={href} className="hover:text-white transition-colors underline underline-offset-2">
                            {value}
                          </Link>
                        )
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <p className="mt-12 pt-8 border-t border-stone-800 text-xs text-stone-600 leading-relaxed">
              By sending this form you agree to our{" "}
              <Link href="/privacy" className="text-stone-500 hover:text-stone-300 underline underline-offset-2">
                Privacy Policy
              </Link>
              . We use your details only to reply to your enquiry.
            </p>
          </div>

          <div>
            <ContactForm source="contact_page" />
          </div>
        </div>
      </div>
    </main>
  );
}
