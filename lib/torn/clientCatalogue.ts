"use client";

/**
 * Fetch the Torn item catalogue in the browser, using the visitor's own API key.
 *
 * The key is deliberately never sent to our servers. It lives in this browser's
 * localStorage and is used for a direct call to api.torn.com, which allows
 * cross-origin requests. That means we never store, log, or become responsible
 * for anyone's Torn credentials — and the visitor can verify it in their network
 * tab.
 *
 * A public ("Limited Access") key is all this needs; /torn/items is public data.
 */

export type CatalogueEntry = {
  type: string;
  marketValue: number;
  vendorPrice: number;
  vendorShop: string;
  vendorCountry: string;
};

export type Catalogue = Record<number, CatalogueEntry>;

const STORAGE_KEY = "cm_torn_api_key";
const CACHE_KEY = "cm_torn_catalogue";
const CACHE_TTL_MS = 6 * 60 * 60_000;

export function loadStoredKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storeKey(key: string): void {
  try {
    if (key) window.localStorage.setItem(STORAGE_KEY, key);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing or blocked storage — the key simply will not persist.
  }
}

export function clearStoredCatalogue(): void {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

function readCache(): Catalogue | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: Catalogue };
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: Catalogue): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // The catalogue is a few hundred KB; if the quota is full, just skip caching.
  }
}

function asInt(value: unknown): number {
  const n = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export class TornKeyError extends Error {}

/**
 * Load the catalogue, from this browser's cache when it is fresh.
 *
 * Torn's catalogue changes rarely, so a six-hour cache keeps this to roughly one
 * request per visitor per session — well clear of the API's limits.
 */
export async function fetchCatalogue(key: string, force = false): Promise<Catalogue> {
  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }

  const res = await fetch(`https://api.torn.com/v2/torn/items?key=${encodeURIComponent(key)}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new TornKeyError(`Torn API returned HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    items?: Record<string, unknown>[] | Record<string, Record<string, unknown>>;
    error?: { code?: number; error?: string };
  };

  if (data.error) {
    throw new TornKeyError(data.error.error ?? "Torn rejected that API key.");
  }

  const rows = Array.isArray(data.items)
    ? data.items
    : Object.entries(data.items ?? {}).map(([id, row]) => ({ ...row, id }));

  const catalogue: Catalogue = {};
  for (const raw of rows as Record<string, unknown>[]) {
    const id = asInt(raw.id);
    if (!id) continue;
    const value = raw.value as Record<string, unknown> | undefined;
    const vendor = raw.vendor as Record<string, unknown> | undefined;
    catalogue[id] = {
      type: String(raw.type ?? "Unknown"),
      marketValue: asInt(value?.market_price ?? raw.market_value),
      vendorPrice: asInt(value?.sell_price ?? raw.sell_price),
      vendorShop: String(vendor?.name ?? ""),
      vendorCountry: String(vendor?.country ?? ""),
    };
  }

  writeCache(catalogue);
  return catalogue;
}
