import type { SessionPayload } from "@/lib/auth/session";
import { DEFAULT_TENANT_ID } from "./types";

/**
 * Resolve which tenant a session operates in.
 * Phase 1: everyone works in tenant zero (Coded Mind's own bank).
 * Phase 5 (tenanting) replaces this with a tenant_id claim on the session.
 */
export function resolveTenantId(_session: SessionPayload): string {
  return DEFAULT_TENANT_ID;
}
