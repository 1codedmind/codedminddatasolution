/**
 * AdSense ad unit IDs, in one place.
 *
 * Every slot below is a placeholder until AdSense approves the site. Create the
 * matching unit in the AdSense dashboard, paste its ID here, and every page
 * using it updates at once — no hunting through page files.
 *
 * Nothing renders at all while NEXT_PUBLIC_ADSENSE_CLIENT is unset, so leaving
 * these as placeholders is safe.
 */
export const AD_SLOTS = {
  /** Horizontal unit under the Torn deals table. */
  tornBelowTable: "1234567890",
  /** Horizontal unit on the game tools index. */
  gamesIndex: "1234567891",
  /** Sticky 160px vertical rail, wide screens only. */
  tornSidebar: "1234567892",
} as const;
