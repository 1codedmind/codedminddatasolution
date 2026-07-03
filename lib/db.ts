import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

// Two drivers behind one tagged-template interface:
//  - neon()   HTTP/fetch — no TCP handshake on cold starts; stateless queries,
//             each completes in a single round-trip. Used in cloud (Vercel+Neon).
//  - postgres TCP with a small pool — used for local Docker development where
//             there is no fetch-based endpoint and connections are cheap.
// Selection: DATABASE_DRIVER=local|neon overrides; otherwise localhost URLs
// get the TCP driver.
type Sql = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T>;

let sqlClient: Sql | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function useLocalDriver(url: string) {
  const driver = process.env.DATABASE_DRIVER;
  if (driver === "local") return true;
  if (driver === "neon") return false;
  return /localhost|127\.0\.0\.1/.test(url);
}

// Cast to a generic-friendly interface that mirrors the postgres driver's API.
// Both drivers return Record<string,any>[] at runtime; generics here are
// purely compile-time hints and are safe because we control every query.
export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!sqlClient) {
    sqlClient = useLocalDriver(url)
      ? (postgres(url, { max: 10 }) as unknown as Sql)
      : (neon(url) as unknown as Sql);
  }
  return sqlClient as Sql;
}
