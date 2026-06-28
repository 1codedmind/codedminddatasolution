import { NextRequest, NextResponse } from "next/server";
import { buildSiteChatContext } from "@/data/siteChatContext";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_ITEMS  = 8;

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
Response length: 2–4 short sentences unless the user asks for more detail.
Formatting: use plain text. Avoid markdown bullet points unless listing 3+ items.

Rules:
- For tool questions: confirm the tool is free, runs in the browser, no login needed. Give the URL.
- For service questions: briefly describe the relevant service and invite them to email hr@codedmind.co.in.
- For job questions: describe the role, key skills, and direct them to /careers or hr@codedmind.co.in.
- Never invent pricing, SLAs, team size, or office locations — they aren't in the site context.
- If you don't know: say so honestly, then suggest hr@codedmind.co.in.

Site context:
${buildSiteChatContext()}`.trim();

function buildPrompt(history: ChatHistoryItem[], message: string): string {
  const turns = history
    .filter((h) => (h.role === "user" || h.role === "assistant") && typeof h.text === "string")
    .slice(-MAX_HISTORY_ITEMS)
    .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.text.slice(0, 500)}`)
    .join("\n");

  return [systemPrompt, turns, `User: ${message.trim()}`, "Assistant:"]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!enforceRateLimit(`chat:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many messages. Slow down." }, { status: 429 });
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
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

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: "Chat is not configured. Contact hr@codedmind.co.in directly." },
      { status: 500 }
    );
  }

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
        prompt: buildPrompt(history, message),
        max_tokens: 600,
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
  return new Response(cfResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
