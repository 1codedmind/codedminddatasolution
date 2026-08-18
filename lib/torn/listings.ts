import { cacheLife } from "next/cache";

/**
 * Individual bazaar listings for one item.
 *
 * This is the drill-down behind a row: every bazaar currently selling the item,
 * cheapest first, so you can see how many units are actually available below
 * market value rather than just the single cheapest price.
 *
 * Fetched server-side and cached, even though weav3r allows browser calls —
 * one cached fetch per item serves every visitor, rather than each of them
 * hitting someone else's free service directly.
 */

const WEAV3R_ITEM = "https://weav3r.dev/api/marketplace";
const USER_AGENT =
  "codedmind-torn-tools/1.0 (+https://codedmind.co.in/tools/games/torn-profit; cached, low volume)";

export type TornListing = {
  player: number;
  playerName: string;
  price: number;
  quantity: number;
  /** Opens that player's bazaar with this item highlighted. */
  link: string;
};

export type TornListingsResult = {
  itemId: number;
  name: string;
  marketPrice: number;
  bazaarAverage: number;
  listings: TornListing[];
  error?: string;
};

function asInt(value: unknown): number {
  const n = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export async function getItemListings(itemId: number): Promise<TornListingsResult> {
  "use cache";
  // Individual listings are the most perishable data here — a specific seller's
  // stock gets bought out. Short expiry so a stale one is discarded rather than
  // served.
  cacheLife({ stale: 60, revalidate: 120, expire: 300 });

  const empty: TornListingsResult = {
    itemId,
    name: "",
    marketPrice: 0,
    bazaarAverage: 0,
    listings: [],
  };

  let data: Record<string, unknown>;
  try {
    const res = await fetch(`${WEAV3R_ITEM}/${itemId}`, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
      return { ...empty, error: `Price service returned HTTP ${res.status}` };
    }
    data = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    return {
      ...empty,
      error: err instanceof Error ? err.message : "Could not reach the price service.",
    };
  }

  const listings: TornListing[] = [];
  const seen = new Set<string>();

  for (const entry of (data.listings as Record<string, unknown>[]) ?? []) {
    const price = asInt(entry.price);
    if (!price) continue;

    const player = asInt(entry.player_id);
    const quantity = asInt(entry.quantity);

    // Sponsored rows repeat the seller's real listing; keep one of each.
    const fingerprint = `${player}:${price}:${quantity}`;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);

    listings.push({
      player,
      playerName: String(entry.player_name || `Player ${player}`),
      price,
      quantity,
      link: `https://www.torn.com/bazaar.php?userId=${player}&itemId=${itemId}&price=${price}&highlight=1#/`,
    });
  }

  // Sponsored entries come back pinned to the top; rank purely by price.
  listings.sort((a, b) => a.price - b.price);

  return {
    itemId,
    name: String(data.item_name ?? ""),
    marketPrice: asInt(data.market_price),
    bazaarAverage: asInt(data.bazaar_average),
    listings,
  };
}
