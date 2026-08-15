import { NextRequest, NextResponse } from "next/server";
import { retrieve, formatContext } from "@/lib/chat/retrieval";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";
import { getCurrentSession } from "@/lib/auth/session";
import { detectServiceIntent } from "@/lib/chat/serviceIntent";
import { upsertChatLead } from "@/lib/leads";
import { hasDatabaseUrl } from "@/lib/db";

const MAX_MESSAGE_LENGTH = 1000;
/**
 * Hard cap on the raw request body.
 *
 * The per-field caps below are applied after parsing, so without this a client
 * could post megabytes of history and make the server parse all of it before
 * anything gets trimmed. Generous next to a legitimate payload: 8 history items
 * of 500 chars plus a 1000-char message is well under 10KB.
 */
const MAX_BODY_BYTES = 64 * 1024;
const MAX_HISTORY_ITEMS  = 8;

/**
 * Usage quotas.
 *
 * The per-minute throttle stops one visitor hammering the endpoint, but on its
 * own it still permits 28,800 messages a day from a single address — and every
 * message costs two Workers AI calls. These daily ceilings bound the damage,
 * and the global one is the only limit a distributed script cannot route around
 * by rotating IP addresses.
 *
 * All are overridable by environment variable so they can be tuned without a
 * code change.
 */
function envInt(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

const DAY_MS = 24 * 60 * 60_000;

const QUOTAS = {
  perMinutePerIp: 20,
  perDayPerIp:     () => envInt("CHAT_DAILY_PER_IP", 100),
  perDayPerAccount: () => envInt("CHAT_DAILY_PER_ACCOUNT", 200),
  globalPerDay:    () => envInt("CHAT_DAILY_GLOBAL", 5000),
};

/** Calendar-day key, so the global budget resets at midnight UTC rather than rolling. */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type ChatHistoryItem = {
  role: "assistant" | "user";
  text: string;
};

type ChatRequestBody = {
  message?: string;
  history?: ChatHistoryItem[];
};

const systemPrompt = `You are the website assistant for Coded Mind (codedmind.co.in).

You help two types of visitors:
1. Developers and teams looking for free browser-based tools (JSON formatter, Base64, UUID, timezone converter, PDF tools, and more).
2. Businesses and teams looking for data engineering, automation, and analytics services.
3. Job seekers exploring current openings and how to apply.

Tone: concise, warm, and practical. Never pushy.

Reply format:
- Write ONE reply and then stop. Never write "User:" or "Assistant:". Never
  continue the conversation on the visitor's behalf or invent their next question.
- Keep it under 70 words.
- For a simple question, answer in one or two short sentences — no bullets.
- Only use bullets when listing three or more things. Start each with "• " on its
  own line, maximum 4 bullets, one short phrase each.
- Close with at most one short line: a relevant URL, or an offer to go deeper.

Rules:
- For tool questions: confirm the tool is free, runs in the browser, no login needed. Give the URL.
- For service questions: briefly describe the relevant service and invite them to email hr@codedmind.co.in.
- For job questions: describe the role, key skills, and direct them to /careers or hr@codedmind.co.in.
- Never invent pricing, SLAs, timelines, delivery estimates, team size, or office
  locations. If asked how long something takes or what it costs, say it depends on
  scope and the team will give a proper answer — then point to hr@codedmind.co.in.
- Only name technologies that appear in the site context below.
- If you don't know: say so honestly, then suggest hr@codedmind.co.in.

GROUNDING (most important rule):
- Answer ONLY from the numbered passages supplied under "RETRIEVED CONTEXT".
- If the passages do not cover the question, say you don't have that detail and
  point to hr@codedmind.co.in. Do not fill the gap from general knowledge.
- Never name a technology, product, price, or timeline that is not in the passages.`.trim();

/**
 * Extra guidance appended to the system prompt once we know who is asking and
 * whether their question is a service enquiry.
 */
function buildContextNote(input: {
  signedIn: boolean;
  name?: string;
  isServiceEnquiry: boolean;
  leadCaptured: boolean;
}): string {
  if (!input.isServiceEnquiry) return "";

  if (input.leadCaptured) {
    return [
      "Context: this visitor is signed in" + (input.name ? ` as ${input.name}` : "") + ",",
      "and their enquiry has just been passed to the team.",
      "Answer their question, then tell them the team has their query and will",
      "follow up by email within 1-2 business days. Do not ask them to fill in a form.",
    ].join(" ");
  }

  if (input.signedIn) {
    return [
      "Context: this visitor is signed in and asking about our services.",
      "Answer their question, then mention the team already has their earlier query",
      "and will be in touch.",
    ].join(" ");
  }

  return [
    "Context: this visitor is asking about our services but is NOT signed in.",
    "Answer their question, then invite them to sign in or use the contact page",
    "at /contact so the team can follow up properly.",
  ].join(" ");
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Build a proper chat message array.
 *
 * The previous version concatenated everything into one text-completion prompt
 * ending in "Assistant:". Instruct models continue that pattern happily, so the
 * assistant would answer and then invent several more "User:"/"Assistant:"
 * turns. Using the messages format gives the model real turn boundaries and
 * stops the runaway transcript at the source.
 */
function buildMessages(
  history: ChatHistoryItem[],
  message: string,
  retrievedContext: string,
  contextNote = "",
): ChatMessage[] {
  const system = [
    systemPrompt,
    `RETRIEVED CONTEXT (the only facts you may use):\n\n${retrievedContext}`,
    contextNote,
  ]
    .filter(Boolean)
    .join("\n\n");

  const turns: ChatMessage[] = history
    .filter((h) => (h.role === "user" || h.role === "assistant") && typeof h.text === "string")
    .slice(-MAX_HISTORY_ITEMS)
    .map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("assistant" as const),
      content: h.text.slice(0, 500),
    }));

  return [
    { role: "system", content: system },
    ...turns,
    { role: "user", content: message.trim() },
  ];
}

/** Markers that mean the model has started inventing further dialogue. */
const RUNAWAY_PATTERN = /\n\s*(user|assistant|human|ai)\s*:/i;
// Held back so a marker split across two tokens is still caught before emitting.
const HOLDBACK = 16;

/**
 * Stop the stream the moment the model starts writing someone else's turn.
 *
 * Belt-and-braces alongside the messages format: smaller instruct models still
 * occasionally run on, and the visitor should never see a fabricated dialogue.
 */
function sanitizeStream(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let sseBuffer = "";
  let pending = "";
  let closed = false;

  const send = (controller: ReadableStreamDefaultController<Uint8Array>, text: string) => {
    if (!text) return;
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: text })}\n\n`));
  };

  const finish = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (closed) return;
    closed = true;
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    controller.close();
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();

      try {
        while (!closed) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (closed) break;
            if (!line.startsWith("data: ")) continue;

            const payload = line.slice(6).trim();
            if (payload === "[DONE]") {
              send(controller, pending);
              pending = "";
              finish(controller);
              break;
            }

            let token = "";
            try {
              token = (JSON.parse(payload) as { response?: string }).response ?? "";
            } catch {
              continue; // malformed chunk — skip it
            }
            if (!token) continue;

            pending += token;

            const runaway = pending.match(RUNAWAY_PATTERN);
            if (runaway?.index !== undefined) {
              send(controller, pending.slice(0, runaway.index).trimEnd());
              pending = "";
              finish(controller);
              break;
            }

            // Emit everything except a short tail, so a marker spanning two
            // tokens is still detected before any of it reaches the client.
            if (pending.length > HOLDBACK) {
              const flush = pending.slice(0, pending.length - HOLDBACK);
              pending = pending.slice(pending.length - HOLDBACK);
              send(controller, flush);
            }
          }
        }

        if (!closed) {
          send(controller, pending);
          finish(controller);
        }
      } catch (err) {
        console.error("[chat] stream error:", err);
        finish(controller);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!(await enforceRateLimit(`chat:${ip}`, 20, 60_000))) {
    return NextResponse.json({ error: "Too many messages. Slow down." }, { status: 429 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: ChatRequestBody;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    body = JSON.parse(raw) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { message, history = [] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  // Session is needed for both the per-account quota and lead capture. The
  // lookup is memoised per request, so reading it here costs nothing extra.
  const session = await getCurrentSession();

  // ── Usage quotas ─────────────────────────────────────────────────────────
  // Checked only once the request is known to be well-formed, so malformed
  // traffic cannot burn a visitor's daily allowance.
  if (!(await enforceRateLimit(`chat:day:${ip}`, QUOTAS.perDayPerIp(), DAY_MS))) {
    return NextResponse.json(
      { error: "You have reached today's message limit. Email hr@codedmind.co.in and we'll help directly." },
      { status: 429 },
    );
  }

  if (session && !(await enforceRateLimit(`chat:day:acct:${session.sub}`, QUOTAS.perDayPerAccount(), DAY_MS))) {
    return NextResponse.json(
      { error: "You have reached today's message limit for this account. Email hr@codedmind.co.in and we'll help directly." },
      { status: 429 },
    );
  }

  // Circuit breaker across all traffic. This is what actually bounds the bill:
  // rotating IP addresses defeats the per-IP limits, but not this one.
  if (!(await enforceRateLimit(`chat:global:${todayKey()}`, QUOTAS.globalPerDay(), DAY_MS))) {
    console.warn("[chat] global daily budget exhausted");
    return NextResponse.json(
      { error: "The assistant is unusually busy today. Please email hr@codedmind.co.in — we reply within 1-2 business days." },
      { status: 503 },
    );
  }

  // ── Lead capture ──────────────────────────────────────────────────────────
  // A signed-in visitor asking about paid work becomes a lead for the sales
  // team. Anonymous visitors are never recorded — we have no identity for them,
  // and silently storing chat text would be the wrong default.
  const intent = detectServiceIntent(message);
  let leadCaptured = false;

  if (session && intent.isServiceEnquiry && hasDatabaseUrl()) {
    // Cap how often one account can generate lead writes, so a chatty visitor
    // cannot flood the leads table.
    const allowed = await enforceRateLimit(`chat-lead:${session.sub}`, 20, 60 * 60_000);
    if (allowed) {
      try {
        leadCaptured = await upsertChatLead({
          name: session.email.split("@")[0] ?? "Website visitor",
          email: session.email,
          question: message,
        });
      } catch (err) {
        // A lead-capture failure must never break the conversation.
        console.error("[chat] lead capture failed:", err);
      }
    }
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: "Chat is not configured. Contact hr@codedmind.co.in directly." },
      { status: 500 }
    );
  }

  // Retrieve only the passages relevant to this question, rather than pasting
  // the whole site into every request.
  const passages = await retrieve(message);
  const retrievedContext = formatContext(passages);

  const model =
    process.env.CLOUDFLARE_AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct-fast";

  const cfResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        messages: buildMessages(
          history,
          message,
          retrievedContext,
          buildContextNote({
            signedIn: Boolean(session),
            name: session?.email,
            isServiceEnquiry: intent.isServiceEnquiry,
            leadCaptured,
          }),
        ),
        max_tokens: 400,
        temperature: 0.3,
        stream: true,
      }),
    }
  );

  if (!cfResponse.ok || !cfResponse.body) {
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Try again shortly." },
      { status: 502 }
    );
  }

  // Forward the Cloudflare SSE stream directly to the client.
  return new Response(sanitizeStream(cfResponse.body), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      // The body is a stream, so status flags travel as headers.
      "X-Lead-Captured": leadCaptured ? "1" : "0",
      "X-Service-Enquiry": intent.isServiceEnquiry ? "1" : "0",
      "X-Signed-In": session ? "1" : "0",
      "X-Retrieved": passages.map((p) => p.id).join(",") || "none",
    },
  });
}
