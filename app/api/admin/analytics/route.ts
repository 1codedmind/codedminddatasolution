import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { getAllPageAnalytics, defaultRange, safeDay } from "@/lib/tools/visitors";

/**
 * Range-scoped page analytics for the admin dashboard.
 *
 * Behind the same role check as the admin pages themselves — visitor totals are
 * business data, not something to expose on an open endpoint.
 *
 * Dates are validated rather than passed through: they reach SQL as bound
 * parameters, so this is not an injection concern, but a malformed date would
 * silently produce an empty range and look like data loss.
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !["superadmin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const fallback = defaultRange();
  const params = request.nextUrl.searchParams;
  let from = safeDay(params.get("from"), fallback.from);
  let to = safeDay(params.get("to"), fallback.to);

  // A backwards range returns nothing and reads as a bug; swap instead.
  if (from > to) [from, to] = [to, from];

  const pages = await getAllPageAnalytics({ from, to });
  return NextResponse.json({ ok: true, pages });
}
