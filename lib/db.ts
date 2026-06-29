import { neon } from "@neondatabase/serverless";

// neon() uses HTTP/fetch — no TCP handshake on cold starts.
// Queries are stateless and each one completes in a single round-trip.
let sqlClient: ReturnType<typeof neon> | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

// Cast to a generic-friendly interface that mirrors the postgres driver's API.
// The neon driver returns Record<string,any>[] at runtime; generics here are
// purely compile-time hints and are safe because we control every query.
export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient as unknown as <T>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<T>;
}
