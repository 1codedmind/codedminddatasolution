import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Services from "@/sections/Services";
import Solutions from "@/sections/Solutions";
import WhyUs from "@/sections/WhyUs";
import Process from "@/sections/Process";
import CTA from "@/sections/CTA";

export const metadata: Metadata = {
  title: "Data Engineering & Analytics Services",
  description:
    "Data engineering, cloud data platforms, reporting dashboards, automation, custom data products, and data quality — built on Snowflake, Databricks, AWS, GCP, Azure, Airflow, and dbt.",
  keywords: [
    "data engineering services",
    "ETL pipeline development",
    "cloud data platform",
    "Snowflake consulting",
    "Databricks consulting",
    "dbt Airflow pipelines",
    "business intelligence dashboards",
    "data automation services",
  ],
  alternates: { canonical: "https://codedmind.co.in/services" },
  openGraph: {
    title: "Data Engineering & Analytics Services — Coded Mind",
    description:
      "Scalable pipelines, cloud data infrastructure, dashboards, and automation — designed around how your team actually works.",
    url: "https://codedmind.co.in/services",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Data Engineering and Analytics",
  provider: {
    "@type": "Organization",
    name: "Coded Mind",
    url: "https://codedmind.co.in",
    email: "hr@codedmind.co.in",
  },
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Data services",
    itemListElement: [
      "Data Engineering",
      "Cloud Data Solutions",
      "Reporting & Dashboards",
      "Data Automation",
      "Custom Data Products",
      "Data Quality & Optimization",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
};

export default function ServicesPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Page header — the landing hero links here, so this is the entry point
          for anyone arriving from "Explore data services". */}
      <section className="bg-stone-950 border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
            What we do
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] max-w-3xl">
            Data services that turn scattered data into decisions.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-400">
            We design and build the pipelines, platforms, and dashboards that move your
            data reliably — from ingestion through transformation to the report someone
            actually reads on Monday morning.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C87660] text-white text-sm font-semibold hover:bg-[#b5664f] transition-colors"
            >
              Talk to us <ArrowRight size={15} />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-stone-700 text-stone-300 text-sm font-semibold hover:border-stone-600 hover:text-white transition-colors"
            >
              Explore free tools
            </Link>
          </div>
        </div>
      </section>

      <Services />
      <Solutions />
      <WhyUs />
      <Process />
      <CTA />
    </main>
  );
}
