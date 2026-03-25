import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, RATE_LIMITS } from "@/lib/auth/config";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, isTrustedOrigin } from "@/lib/auth/security";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const allowed = enforceRateLimit(
    `logout:${ip}`,
    RATE_LIMITS.logout.maxAttempts,
    RATE_LIMITS.logout.windowMs,
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  return NextResponse.json({ ok: true });
}
