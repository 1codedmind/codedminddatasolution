const BASE = "https://codedmind.co.in";

/**
 * Organization and WebSite structured data, emitted once from the root layout.
 *
 * This is what lets Google associate every page with one entity rather than
 * treating them as unrelated documents, and it is the prerequisite for a
 * knowledge panel.
 *
 * Two things are deliberately absent:
 *
 *  - `sameAs`. It lists an organisation's verified social profiles, and we do
 *    not have any to point at. Inventing URLs would be worse than omitting the
 *    field.
 *  - `potentialAction` / SearchAction. It promises a working `?q=` search
 *    endpoint, and this site has none. Declaring it would be a claim Google
 *    could check and find false.
 */
export default function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE}/#organization`,
        name: "Coded Mind",
        url: BASE,
        email: "hr@codedmind.co.in",
        logo: {
          "@type": "ImageObject",
          url: `${BASE}/icon.svg`,
        },
        description:
          "Data engineering, full-stack development, and AI solutions, plus free developer tools and training in data science, data engineering and AI.",
        areaServed: "Worldwide",
        knowsAbout: [
          "Data Engineering",
          "ETL Pipelines",
          "Cloud Data Platforms",
          "Full-Stack Development",
          "Artificial Intelligence",
          "Retrieval-Augmented Generation",
          "Online Examinations",
          "Technical Training",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "hr@codedmind.co.in",
          availableLanguage: ["English"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        url: BASE,
        name: "Coded Mind",
        publisher: { "@id": `${BASE}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
