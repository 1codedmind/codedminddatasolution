import { NextRequest, NextResponse } from "next/server";

import { recordAndCountVisit } from "@/lib/tools/visitors";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, isTrustedOrigin } from "@/lib/auth/security";

/**
 * Unique-visitor counter for the Torn profit finder.
 *
 * POST only, on purpose. With Cache Components enabled a GET Route Handler can
 * be prerendered at build time, which would serve every visitor the same
 * frozen number; POST is never cached.
 *
 * The page key is fixed here rather than taken from the request body. Letting
 * a caller name the page would turn this into an open write endpoint that
 * anyone could use to create arbitrary rows in our table.
 */
const PAGE = "tools/games/torn-profit";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");

  // A normal visitor records once per page load. The insert is deduplicated by
  // digest, so repeat loads cannot inflate the count anyway; this limit exists
  // to stop someone turning a page refresh into a write flood.
  const allowed = await enforceRateLimit(`page-visit:${PAGE}:${ip}`, 20, 60_000);

  const counts = await recordAndCountVisit({
    page: PAGE,
    ip,
    userAgent,
    record: allowed,
  });

  if (!counts) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true, ...counts });
}
