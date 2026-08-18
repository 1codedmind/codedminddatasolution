import { cacheLife, cacheTag } from "next/cache";

import type { TornDeal, TornDealsResult } from "@/lib/torn/types";
import { bestExit } from "@/lib/torn/profit";

/**
 * Torn buy-low finder — the "cheapest bazaar price per item" view.
 *
 * Ported from a local Python tool. Two upstream sources:
 *
 *   weav3r.dev  A public, unauthenticated crawler that continuously polls player
 *               bazaars. One call returns the cheapest bazaar price for every
 *               item, so it sees far more than Torn's own endpoint, which only
 *               exposes the ten "specialized" bazaars per item.
 *   Torn API    The item catalogue, for type, vendor shop, and vendor sell price.
 *               Optional: without it prices and names still work, only the
 *               metadata is missing.
 *
 * The original tool also had a "sweeper" that walked the Torn API using the
 * player's own key. That is deliberately not ported — it needs a long-running
 * background process, and it would mean asking visitors to hand us their API
 * key. The bazaar view was the main view anyway, and it needs no key at all.
 *
 * Caching matters here for a reason beyond speed: weav3r.dev is someone else's
 * free service. One cached fetch every few minutes serves every visitor, which
 * is far politer than each of them running the desktop tool.
 */

/** Shared by the refresh endpoint, so a manual refresh clears both layers. */
export const TORN_DEALS_TAG = "torn-deals";

const WEAV3R_MARKETPLACE = "https://weav3r.dev/api/marketplace";
const TORN_ITEMS = "https://api.torn.com/v2/torn/items";

const USER_AGENT =
  "codedmind-torn-tools/1.0 (+https://codedmind.co.in/tools/games/torn-profit; cached, low volume)";

type Weav3rRow = {
  item_id?: number | string;
  item_name?: string;
  lowest_price?: number | string;
  market_price?: number | string;
  total_bazaars?: number | string;
  bazaar_average?: number | string;
};

type CatalogueItem = {
  name: string;
  type: string;
  market: number;
  sell: number;
  vendor: string;
  country: string;
};

/** Torn's API returns numbers as strings in places; normalise defensively. */
function asInt(value: unknown): number {
  const n = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Cheapest bazaar price for every item.
 *
 * `revalidate` matches the upstream crawler's own cadence — asking more often
 * returns identical data and just costs them bandwidth.
 */
async function fetchMarketplace(): Promise<{ items: Weav3rRow[]; generatedAt: number }> {
  "use cache";
  // expire is deliberately close to revalidate. Between the two, Next serves the
  // old snapshot and refreshes behind it — fine for a blog, wrong for prices,
  // because a visitor after a quiet spell would be handed listings that are long
  // gone. Past 10 minutes idle we would rather they wait ~0.5s for real data.
  cacheLife({ stale: 120, revalidate: 300, expire: 600 });
  cacheTag(TORN_DEALS_TAG);

  const res = await fetch(WEAV3R_MARKETPLACE, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`weav3r.dev returned HTTP ${res.status}`);
  }

  const data = (await res.json()) as { items?: Weav3rRow[]; generated_at?: number | string };
  return { items: data.items ?? [], generatedAt: asInt(data.generated_at) };
}

/**
 * Item catalogue, keyed by id.
 *
 * Uses a single server-side key for everyone, refreshed every six hours — well
 * inside Torn's limits. Returns an empty map when unset or failing, because a
 * key problem must never take the whole view down.
 */
async function fetchCatalogue(): Promise<Record<number, CatalogueItem>> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 21600, expire: 86400 });

  const key = process.env.TORN_API_KEY;
  if (!key) return {};

  try {
    const res = await fetch(`${TORN_ITEMS}?key=${encodeURIComponent(key)}`, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    });
    if (!res.ok) return {};

    const data = (await res.json()) as {
      items?: Record<string, unknown> | unknown[];
      error?: { error?: string };
    };
    if (data.error) {
      console.error("[torn] catalogue error:", data.error.error);
      return {};
    }

    // v2 returns an array; older shapes return an object keyed by id.
    const rows = Array.isArray(data.items)
      ? data.items
      : Object.entries(data.items ?? {}).map(([id, row]) => ({
          ...(row as Record<string, unknown>),
          id,
        }));

    const catalogue: Record<number, CatalogueItem> = {};
    for (const raw of rows as Record<string, unknown>[]) {
      const id = asInt(raw.id);
      if (!id) continue;
      const value = raw.value as Record<string, unknown> | undefined;
      catalogue[id] = {
        name: String(raw.name ?? ""),
        type: String(raw.type ?? "Unknown"),
        market: asInt(value?.market_price ?? raw.market_value),
        sell: asInt(value?.sell_price ?? raw.sell_price),
        vendor: String((raw.vendor as Record<string, unknown> | undefined)?.name ?? ""),
        country: String((raw.vendor as Record<string, unknown> | undefined)?.country ?? ""),
      };
    }
    return catalogue;
  } catch (err) {
    console.error("[torn] catalogue fetch failed:", err);
    return {};
  }
}

/**
 * Build the deals list.
 *
 * Profit logic ported verbatim from the original, including the part that is
 * easy to get wrong: there are two ways out of a purchase, and the obvious one
 * is not always better. Relisting on the item market earns market value minus
 * fees and a wait; selling to a shop is instant and guaranteed. For some items
 * the vendor price genuinely beats market value.
 */
export async function getTornDeals(): Promise<TornDealsResult> {
  "use cache";
  // expire is deliberately close to revalidate. Between the two, Next serves the
  // old snapshot and refreshes behind it — fine for a blog, wrong for prices,
  // because a visitor after a quiet spell would be handed listings that are long
  // gone. Past 10 minutes idle we would rather they wait ~0.5s for real data.
  cacheLife({ stale: 120, revalidate: 300, expire: 600 });
  cacheTag(TORN_DEALS_TAG);

  let marketplace: { items: Weav3rRow[]; generatedAt: number };
  try {
    marketplace = await fetchMarketplace();
  } catch (err) {
    return {
      deals: [],
      ageSeconds: 0,
      degraded: true,
      error: err instanceof Error ? err.message : "Could not reach the price crawler.",
    };
  }

  const catalogue = await fetchCatalogue();
  const degraded = Object.keys(catalogue).length === 0;
  const deals: TornDeal[] = [];

  for (const row of marketplace.items) {
    const itemId = asInt(row.item_id);
    const low = asInt(row.lowest_price);
    if (!itemId || !low) continue;

    const item = catalogue[itemId];
    const marketValue = asInt(row.market_price) || item?.market || 0;
    const vendorPrice = item?.sell ?? 0;

    const exit = bestExit(low, marketValue, vendorPrice);
    if (exit.profit <= 0) continue;

    deals.push({
      itemId,
      name: row.item_name || item?.name || `Item ${itemId}`,
      type: item?.type ?? "Unknown",
      price: low,
      value: exit.value,
      marketValue,
      vendorPrice,
      exit: exit.exit,
      enriched: Boolean(item),
      // A shop that stocks the item is the evidence a shop will buy it back.
      // Without one, the sell price is a number the API reports but you may not
      // be able to realise — surfaced in the UI rather than silently trusted.
      vendorShop: item?.vendor ?? "",
      vendorCountry: item?.country ?? "",
      bazaars: asInt(row.total_bazaars),
      bazaarAvg: asInt(row.bazaar_average),
      profit: exit.profit,
      margin: exit.margin,
    });
  }

  deals.sort((a, b) => b.profit - a.profit);

  const ageSeconds = marketplace.generatedAt
    ? Math.max(0, Math.floor(Date.now() / 1000) - marketplace.generatedAt)
    : 0;

  return { deals, ageSeconds, degraded };
}
