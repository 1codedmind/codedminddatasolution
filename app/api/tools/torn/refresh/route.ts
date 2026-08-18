import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { TORN_DEALS_TAG } from "@/lib/torn/deals";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, isTrustedOrigin } from "@/lib/auth/security";

/**
 * Force fresh prices.
 *
 * The cache is shared, so one person's refresh serves everyone — which is the
 * point, but also the risk: without a floor, a jammed button becomes a request
 * flood against someone else's free service. The original tool used a 20-second
 * floor for a single desktop user; this is a public page, so the floor is a
 * minute and applies globally, not per visitor.
 */
const GLOBAL_FLOOR_MS = 60_000;

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = getClientIp(request);

  // Per-visitor courtesy limit, so one person cannot monopolise the global slot.
  if (!(await enforceRateLimit(`torn-refresh:ip:${ip}`, 10, 5 * 60_000))) {
    return NextResponse.json(
      { error: "You have refreshed a lot recently. Please wait a few minutes." },
      { status: 429 },
    );
  }

  // The floor that actually protects the upstream service.
  if (!(await enforceRateLimit("torn-refresh:global", 1, GLOBAL_FLOOR_MS))) {
    return NextResponse.json(
      {
        ok: false,
        throttled: true,
        message: "Prices were refreshed moments ago — showing the latest snapshot.",
      },
      { status: 200 },
    );
  }

  // Daily ceiling as well as the per-minute floor: 1/min is 1,440 forced
  // refreshes a day, which is more than this tool ever needs.
  if (!(await enforceRateLimit(`torn-refresh:day:${new Date().toISOString().slice(0, 10)}`, 300, 24 * 60 * 60_000))) {
    return NextResponse.json(
      { ok: false, throttled: true, message: "Refreshes have hit today's limit. Prices still update automatically every few minutes." },
      { status: 200 },
    );
  }

  revalidateTag(TORN_DEALS_TAG, "max");

  return NextResponse.json({ ok: true, message: "Fetching the latest prices…" });
}
