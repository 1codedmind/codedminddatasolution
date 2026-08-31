import type { Metadata } from "next";

import TrainingHero from "@/components/training/TrainingHero";
import Courses from "@/components/training/Courses";
import Impact from "@/components/training/Impact";
import Formats from "@/components/training/Formats";
import WhyTraining from "@/components/training/WhyTraining";
import CTA from "@/sections/CTA";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Training — Data Science, Data Engineering & AI",
  description:
    "Training in data science, data engineering and AI, taught by the engineers who build these systems for clients. Python, SQL, Airflow, dbt, Spark and RAG.",
  keywords: [
    "data science training",
    "data engineering training",
    "AI training for teams",
    "machine learning course",
    "corporate data training",
    "Python data analysis training",
    "Airflow dbt training",
    "RAG development training",
    "upskilling data teams",
  ],
  alternates: { canonical: "https://codedmind.co.in/training" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Training — Coded Mind",
    description:
      "Data science, data engineering, and AI training taught by working engineers, using the same stack we use on client work.",
    url: "https://codedmind.co.in/training",
  },
};

const COURSES = [
  {
    name: "Data Science",
    description:
      "Python for analysis, statistics that survive review, exploratory analysis, modelling fundamentals, and communicating a result to people who will act on it.",
  },
  {
    name: "Data Engineering",
    description:
      "Advanced SQL, warehouse modelling, pipelines and orchestration with Airflow, transformation with dbt, and data quality, monitoring and cost control.",
  },
  {
    name: "AI & Machine Learning",
    description:
      "Language model behaviour, structured output, retrieval-augmented generation, evaluation, and the rate limiting and abuse handling a shipped AI feature needs.",
  },
];

const provider = {
  "@type": "Organization",
  name: "Coded Mind",
  url: "https://codedmind.co.in",
  email: "hr@codedmind.co.in",
};

// Course markup deliberately omits hasCourseInstance: Google wants a concrete
// schedule and price there, and we publish neither because both are agreed per
// engagement. Better to carry accurate, non-rich markup than invent a cohort.
const trainingSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      serviceType: "Professional training in data science, data engineering and AI",
      provider,
      areaServed: "Worldwide",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Training tracks",
        itemListElement: COURSES.map(({ name }) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: `${name} Training` },
        })),
      },
    },
    ...COURSES.map(({ name, description }) => ({
      "@type": "Course",
      name: `${name} Training`,
      description,
      provider,
      url: "https://codedmind.co.in/training",
    })),
  ],
};

export default function TrainingPage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trainingSchema) }}
      />
      <BreadcrumbJsonLd items={[{ name: "Training", path: "/training" }]} />

      <TrainingHero />
      <Courses />
      <Impact />
      <Formats />
      <WhyTraining />
      <CTA />
    </main>
  );
}
