import { NextRequest, NextResponse } from "next/server";

import { getItemListings } from "@/lib/torn/listings";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const ip = getClientIp(request);

  // Generous per visitor: opening a dozen items while browsing is normal use.
  if (!(await enforceRateLimit(`torn-listings:${ip}`, 60, 60_000))) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  // The limit that actually matters. Per-IP alone means a hundred visitors could
  // aim thousands of requests a minute at weav3r's per-item endpoint. Cached
  // items never reach here, so this only bites on distinct cold lookups — and it
  // roughly matches the 0.7s minimum gap the original tool held itself to.
  // A per-minute cap still permits 86,400 calls a day against someone else's
  // free service. This is the ceiling that bounds sustained abuse.
  if (!(await enforceRateLimit(`torn-listings:day:${new Date().toISOString().slice(0, 10)}`, 5000, 24 * 60 * 60_000))) {
    return NextResponse.json(
      { error: "Item lookups have hit today's limit. Prices on the main table are unaffected." },
      { status: 503 },
    );
  }

  if (!(await enforceRateLimit("torn-listings:global", 30, 60_000))) {
    return NextResponse.json(
      { error: "The tool is unusually busy — please try that item again in a moment." },
      { status: 503 },
    );
  }

  const { itemId } = await params;
  const id = Number(itemId);
  if (!Number.isInteger(id) || id <= 0 || id > 100_000) {
    return NextResponse.json({ error: "Invalid item id." }, { status: 400 });
  }

  const result = await getItemListings(id);
  return NextResponse.json(result);
}
