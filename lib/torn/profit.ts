/**
 * Shared profit maths.
 *
 * Lives in its own module because it runs in two places — on the server with the
 * site's catalogue, and in the browser when a visitor supplies their own Torn API
 * key. Two copies of this logic would drift.
 */

export type ExitRoute = "Market" | "Vendor";

export type ExitResult = {
  profit: number;
  margin: number;
  exit: ExitRoute;
  value: number;
};

/**
 * Pick the better of the two ways out of a purchase.
 *
 * Relisting on the item market earns market value, minus fees and a wait.
 * Selling to a shop is instant and guaranteed. For some items — Pangolin Scales
 * being the classic — the vendor price genuinely beats market value, so the
 * obvious route is not always the right one.
 */
export function bestExit(price: number, marketValue: number, vendorPrice: number): ExitResult {
  const resell = marketValue - price;
  const vendor = vendorPrice - price;
  const useVendor = vendor > resell;

  const profit = useVendor ? vendor : resell;
  return {
    profit,
    margin: price > 0 ? (profit / price) * 100 : 0,
    exit: useVendor ? "Vendor" : "Market",
    value: useVendor ? vendorPrice : marketValue,
  };
}
