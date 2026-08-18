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
  /** Seconds since the upstream crawler generated this snapshot. */
  ageSeconds: number;
  /** True when the Torn item catalogue was unavailable, so metadata is missing. */
  degraded: boolean;
  error?: string;
};
