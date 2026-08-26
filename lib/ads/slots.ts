/**
 * AdSense ad unit IDs, in one place.
 *
 * EMPTY MEANS DORMANT. An <ins> tag pointing at a slot ID that does not exist
 * in your account requests a unit Google cannot fill, which logs errors and
 * serves nothing — worse than showing no unit at all. So AdSlot renders
 * nothing while its ID is blank.
 *
 * To switch a placement on: AdSense dashboard → Ads → By ad unit → create the
 * unit, copy its data-ad-slot number, and paste it here. Every page using that
 * slot picks it up at once.
 *
 * Auto ads do not need any of these. Google places those itself using only the
 * site-wide script in AdSenseScript, so leaving this file empty is a perfectly
 * valid steady state.
 */
export const AD_SLOTS = {
  /** Horizontal unit under the Torn deals table. */
  tornBelowTable: "",
  /** Horizontal unit on the game tools index. */
  gamesIndex: "",
  /** Sticky 160px vertical rail, wide screens only. */
  tornSidebar: "",
} as const;
