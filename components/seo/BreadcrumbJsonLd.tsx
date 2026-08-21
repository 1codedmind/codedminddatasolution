const BASE = "https://codedmind.co.in";

/**
 * BreadcrumbList structured data.
 *
 * Renders no visible markup — it exists so search results show
 * "codedmind.co.in › Tools › Game tools" instead of a bare URL, which measurably
 * improves click-through on nested pages.
 */
export default function BreadcrumbJsonLd({
  items,
}: {
  /** Ordered, excluding Home — that is prepended automatically. */
  items: { name: string; path: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE}${item.path === "/" ? "" : item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
