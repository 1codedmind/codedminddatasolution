import { promises as dns } from "dns";

/**
 * Rejects addresses that cannot receive mail.
 *
 * Two separate problems, needing two separate checks:
 *
 *   Non-existent domains  — "@232.com", "@34.lll", "@s.com". These have no mail
 *                           server at all, so a verification email can never
 *                           arrive. An MX lookup catches them.
 *   Disposable inboxes    — mailinator and friends. These have perfectly valid
 *                           MX records, so DNS says nothing about them; they
 *                           need a blocklist.
 *
 * This runs before an account is created. It is not a replacement for email
 * verification — someone can still type a real address they do not own — but it
 * stops the throwaway signups that never had a chance of being confirmed.
 */

/**
 * Known disposable and throwaway mail providers.
 *
 * Deliberately conservative: every entry here is a service whose entire purpose
 * is temporary addresses. Blocking a legitimate provider by mistake is far worse
 * than letting one throwaway through, so nothing ambiguous is on this list.
 */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "throwawaymail.com", "yopmail.com", "yopmail.fr", "getnada.com", "nada.email",
  "trashmail.com", "trashmail.de", "sharklasers.com", "grr.la", "spam4.me",
  "maildrop.cc", "mailnesia.com", "mintemail.com", "mytemp.email",
  "dispostable.com", "fakeinbox.com", "spamgourmet.com", "mailcatch.com",
  "tempinbox.com", "emailondeck.com", "burnermail.io", "moakt.com",
  "tempmailo.com", "luxusmail.org", "inboxkitten.com", "harakirimail.com",
  "mail-temporaire.fr", "jetable.org", "discard.email", "mailde.de",
  "einrot.com", "cuvox.de", "dayrep.com", "armyspy.com", "teleworm.us",
  "rhyta.com", "superrito.com", "gustr.com", "fleckens.hu", "jourrapide.com",
  "1secmail.com", "1secmail.net", "1secmail.org", "wwjmp.com", "esiix.com",
  "vjuum.com", "laafd.com", "txcct.com", "xojxe.com", "yoggm.com",
]);

export type DomainCheck =
  | { ok: true }
  | { ok: false; reason: "disposable" | "no-mail-server"; message: string };

/**
 * MX results, cached per process.
 *
 * A DNS round trip on every signup is wasted work — the answer for gmail.com is
 * not going to change between requests. Per-instance caching is fine here; the
 * worst case is a redundant lookup after a cold start.
 */
const mxCache = new Map<string, { ok: boolean; at: number }>();
const MX_CACHE_TTL_MS = 6 * 60 * 60_000;
const DNS_TIMEOUT_MS = 3_000;

function cached(domain: string): boolean | null {
  const hit = mxCache.get(domain);
  if (!hit) return null;
  if (Date.now() - hit.at > MX_CACHE_TTL_MS) {
    mxCache.delete(domain);
    return null;
  }
  return hit.ok;
}

/**
 * Whether the domain publishes a mail server.
 *
 * Fails OPEN on anything other than a definitive "this domain has no mail". A
 * DNS timeout or a resolver hiccup must never stop a real person signing up —
 * blocking genuine users to catch a few fakes is the wrong trade.
 */
async function hasMailServer(domain: string): Promise<boolean> {
  const hit = cached(domain);
  if (hit !== null) return hit;

  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("dns-timeout")), DNS_TIMEOUT_MS),
      ),
    ]);

    const ok = Array.isArray(records) && records.length > 0;
    mxCache.set(domain, { ok, at: Date.now() });
    return ok;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;

    // ENOTFOUND: no such domain. ENODATA: domain exists but publishes no MX.
    // Both mean mail cannot be delivered, so these are real rejections.
    if (code === "ENOTFOUND" || code === "ENODATA") {
      mxCache.set(domain, { ok: false, at: Date.now() });
      return false;
    }

    // Timeout, SERVFAIL, refused resolver — our problem, not the user's.
    console.warn(`[emailDomain] MX lookup inconclusive for ${domain}:`, code ?? err);
    return true;
  }
}

export async function checkEmailDomain(email: string): Promise<DomainCheck> {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) {
    return { ok: false, reason: "no-mail-server", message: "Please enter a valid email address." };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: "disposable",
      message: "Please use a permanent email address rather than a temporary one.",
    };
  }

  if (!(await hasMailServer(domain))) {
    return {
      ok: false,
      reason: "no-mail-server",
      message: `We couldn't find a mail server for "${domain}". Please check the address for a typo.`,
    };
  }

  return { ok: true };
}
