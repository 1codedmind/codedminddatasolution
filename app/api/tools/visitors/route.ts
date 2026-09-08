import { NextRequest, NextResponse } from "next/server";

import { recordAndCountVisit, resolvePage } from "@/lib/tools/visitors";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, isTrustedOrigin } from "@/lib/auth/security";

/**
 * Visitor counter for any tracked tool page.
 *
 * POST only, on purpose. With Cache Components enabled a GET Route Handler can
 * be prerendered at build time, which would serve every visitor the same frozen
 * number.
 *
 * The body carries a slug, not a page name. The slug is looked up in the
 * TRACKED_PAGES registry, so a caller cannot invent a page and write rows for
 * it — the only writable pages are the ones we ship.
 */
export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  let slug = "";
  try {
    const body = (await request.json()) as { page?: unknown };
    slug = typeof body.page === "string" ? body.page : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const page = resolvePage(slug);
  if (!page) {
    return NextResponse.json({ error: "Unknown page" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");

  // Repeat views are counted, so this limit stops a jammed refresh inflating
  // the visit total rather than protecting the deduplicated unique count.
  const allowed = await enforceRateLimit(`page-visit:${page}:${ip}`, 20, 60_000);

  const counts = await recordAndCountVisit({ page, ip, userAgent, record: allowed });

  if (!counts) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
  return NextResponse.json({ ok: true, ...counts });
}
