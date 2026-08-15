"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, GraduationCap, Receipt, Users, FileText, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Credibility through things that actually exist and can be clicked, rather
 * than logos and testimonials. Every claim here is checkable against a live
 * product on this domain.
 */

type Product = {
  Icon: LucideIcon;
  name: string;
  summary: string;
  details: string[];
  href?: string;
  accent: string;
};

const PRODUCTS: Product[] = [
  {
    Icon: GraduationCap,
    name: "Examination Platform",
    summary: "Multi-tenant online exams for universities and corporate hiring.",
    details: [
      "Isolated tenants with role-based access",
      "LeetCode-style coding questions in a Monaco editor",
      "Python executed entirely in the browser via Pyodide",
    ],
    accent: "#3B82F6",
  },
  {
    Icon: Receipt,
    name: "Billing & Accounting Engine",
    summary: "India-first GST invoicing, usable through its own REST API.",
    details: [
      "Automatic CGST/SGST versus IGST split",
      "Payments with status rollover and GST-compliant PDFs",
      "API-key authentication for embedding in other products",
    ],
    accent: "#10B981",
  },
  {
    Icon: Users,
    name: "HRMS",
    summary: "The HR system we run our own company on.",
    details: [
      "Employees, departments, attendance, and leave approvals",
      "Payroll runs with line items and performance reviews",
      "Granular permissions with an append-only audit trail",
    ],
    accent: "#F59E0B",
  },
  {
    Icon: FileText,
    name: "Resume Builder",
    summary: "Twelve templates, AI parsing, and ATS scoring — free to use.",
    details: [
      "Upload a PDF and have it parsed into structured fields",
      "Twelve templates rendered for both screen and print",
      "Per-account quotas that keep inference costs predictable",
    ],
    href: "/tools/resume-builder",
    accent: "#A855F7",
  },
  {
    Icon: Wrench,
    name: "Developer Tools",
    summary: "A dozen browser-based utilities, no login, nothing uploaded.",
    details: [
      "JSON, Base64, UUID, timestamps, timezones, passwords",
      "A full PDF suite: merge, split, compress, rotate, sign",
      "All processing happens client-side, by design",
    ],
    href: "/tools",
    accent: "#C87660",
  },
];

/** Counts up when scrolled into view. Static if the user prefers less motion. */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    let frame = 0;
    const duration = 1100;
    const start = performance.now();

    // setState happens inside the rAF callback, never synchronously in the
    // effect body — the animation frame is the external system driving it.
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease-out cubic: fast at first, settles gently on the final number.
      setAnimated(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, reduced]);

  // Reduced motion skips the count entirely and shows the final figure.
  const value = reduced ? to : animated;

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

const FACTS = [
  { value: 3, suffix: "", label: "production platforms we build and operate" },
  { value: 12, suffix: "", label: "free tools running in the browser" },
  { value: 12, suffix: "", label: "resume templates, screen and print" },
  { value: 100, suffix: "%", label: "of our own systems run on this stack" },
];

export default function Proof() {
  const reduced = useReducedMotion();

  return (
    <section className="border-b border-stone-900 bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Evidence</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            We are our own hardest client.
          </h2>
          <p className="mt-4 leading-relaxed text-stone-400">
            Everything below is something we designed, built, and now operate —
            using the same practices we would bring to your project. Two of them
            you can open right now and judge for yourself.
          </p>
        </motion.div>

        {/* Facts */}
        <motion.dl
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
          className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {FACTS.map((fact) => (
            <motion.div
              key={fact.label}
              variants={{
                hidden: { opacity: 0, y: reduced ? 0 : 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6"
            >
              <dt className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <Counter to={fact.value} suffix={fact.suffix} />
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-500">{fact.label}</dd>
            </motion.div>
          ))}
        </motion.dl>

        {/* Products */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {PRODUCTS.map(({ Icon, name, summary, details, href, accent }) => {
            const card = (
              <motion.article
                variants={{
                  hidden: { opacity: 0, y: reduced ? 0 : 22 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover={reduced ? undefined : { y: -4 }}
                className="group h-full rounded-2xl border border-stone-800 bg-stone-900/50 p-7 transition-colors hover:border-stone-700"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${accent}1a`, border: `1px solid ${accent}40` }}
                  >
                    <Icon size={17} style={{ color: accent }} />
                  </span>
                  {href && (
                    <ArrowUpRight
                      size={16}
                      className="text-stone-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-stone-400"
                    />
                  )}
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">{summary}</p>

                <ul className="mt-5 space-y-2 border-t border-stone-800 pt-5">
                  {details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs leading-relaxed text-stone-500">
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                        style={{ background: accent }}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );

            return href ? (
              <Link key={name} href={href} className="h-full">
                {card}
              </Link>
            ) : (
              <div key={name} className="h-full">
                {card}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
