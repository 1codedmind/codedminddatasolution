import type { JobOpening } from "@/data/jobOpenings";

const BASE = "https://codedmind.co.in";

/**
 * JobPosting structured data.
 *
 * This is the only way onto Google Jobs, which is a separate search surface
 * with far higher intent than a normal blue link — someone browsing it is
 * looking for a role, not reading.
 *
 * `datePosted` is required by Google. Rather than invent one, it comes from the
 * job data, which records the real date the opening was published.
 *
 * `jobLocation` carries only the country. Google accepts that, and adding a
 * city we cannot verify would be worse than being less specific — a wrong
 * location surfaces the role to the wrong candidates.
 */
export default function JobPostingJsonLd({ job }: { job: JobOpening }) {
  const detail = (label: string) =>
    job.details.find((d) => d.label.toLowerCase() === label.toLowerCase())?.value ?? null;

  const stipend = detail("Stipend");
  // "Rs. 10,000 per month" -> 10000
  const amount = stipend ? Number(stipend.replace(/[^\d]/g, "")) : null;

  const description = [
    job.overview,
    job.responsibilities.length ? `Responsibilities: ${job.responsibilities.join(" ")}` : "",
    job.requiredSkills.length ? `Requirements: ${job.requiredSkills.join(" ")}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: "Coded Mind",
      value: job.slug,
    },
    datePosted: job.postedAt,
    validThrough: job.closesAt,
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "Coded Mind",
      sameAs: BASE,
      logo: `${BASE}/icon.svg`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
    },
    url: `${BASE}/careers/${job.slug}`,
    directApply: true,
  };

  if (amount && Number.isFinite(amount)) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        value: amount,
        unitText: "MONTH",
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
