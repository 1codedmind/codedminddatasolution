/** A buyable-below-value listing, as shown in the deals table. */
export type TornDeal = {
  itemId: number;
  name: string;
  type: string;
  /** Cheapest bazaar asking price found by the crawler. */
  price: number;
  /** What you realistically get back, via whichever exit route is better. */
  value: number;
  marketValue: number;
  vendorPrice: number;
  /** "Market" = relist on the item market, "Vendor" = sell straight to a shop. */
  exit: "Market" | "Vendor";
  /** True when item metadata was available, so the vendor route was considered. */
  enriched: boolean;
  vendorShop: string;
  vendorCountry: string;
  bazaars: number;
  bazaarAvg: number;
  profit: number;
  margin: number;
};

export type TornDealsResult = {
  deals: TornDeal[];
  /**
   * Unix seconds at which the upstream crawler generated this snapshot.
   *
   * Absolute rather than a relative age: this value is computed inside a cached
   * function, so anything derived from "now" freezes at cache time and is wrong
   * for every later visitor. The age is calculated in the browser instead.
   */
  generatedAt: number;
  /** True when the Torn item catalogue was unavailable, so metadata is missing. */
  degraded: boolean;
  error?: string;
};
