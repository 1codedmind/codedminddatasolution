"use client";

import AdSlot from "@/components/ads/AdSlot";

/**
 * Sticky vertical ad rail.
 *
 * Only rendered from `xl` upward, where there is genuinely spare horizontal
 * space beside the content. Below that it is absent from the layout entirely —
 * a 160px column squeezed next to a data table on a laptop makes both unusable,
 * and on a phone a sidebar ad is just a banner that stole a screenful.
 *
 * `sticky` keeps it in view while the table scrolls, which is what makes a
 * vertical unit worth more than a single impression, without covering content.
 */
export default function AdSidebar({ slot }: { slot: string }) {
  return (
    <aside className="hidden xl:block" aria-label="Advertisement">
      <div className="sticky top-24">
        <AdSlot slot={slot} format="vertical" minHeight={600} />
      </div>
    </aside>
  );
}
