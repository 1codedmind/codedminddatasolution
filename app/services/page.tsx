import type { Metadata } from "next";

import ServicesHero from "@/components/services/ServicesHero";
import Capabilities from "@/components/services/Capabilities";
import Proof from "@/components/services/Proof";
import Approach from "@/components/services/Approach";
import Solutions from "@/sections/Solutions";
import CTA from "@/sections/CTA";

export const metadata: Metadata = {
  title: "Services — Data Engineering, Full-Stack Development & AI",
  description:
    "One team across data engineering, full-stack software, and AI. ETL pipelines on Snowflake and Databricks, web applications and APIs, and AI features with real evaluation — built by the team that runs its own platforms on the same stack.",
  keywords: [
    "data engineering services",
    "full stack development company",
    "AI solutions provider",
    "ETL pipeline development",
    "custom software development",
    "machine learning integration",
    "Snowflake Databricks consulting",
    "RAG chatbot development",
    "cloud data platform",
  ],
  alternates: { canonical: "https://codedmind.co.in/services" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Services — Coded Mind",
    description:
      "Data engineering, full-stack development, and AI solutions from one team. See what we have already built and shipped.",
    url: "https://codedmind.co.in/services",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Data Engineering, Software Development and AI Solutions",
  provider: {
    "@type": "Organization",
    name: "Coded Mind",
    url: "https://codedmind.co.in",
    email: "hr@codedmind.co.in",
  },
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: [
      "Data Engineering",
      "Full-Stack Development",
      "AI Solutions",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
};

export default function ServicesPage() {
  return (
    <main className="bg-stone-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <ServicesHero />
      <Capabilities />
      <Proof />
      <Approach />
      <Solutions />
      <CTA />
    </main>
  );
}
