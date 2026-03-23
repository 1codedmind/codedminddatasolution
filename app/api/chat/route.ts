import { NextResponse } from "next/server";
import { buildSiteChatContext } from "@/data/siteChatContext";

type ChatHistoryItem = {
  role: "assistant" | "user";
  text: string;
};

type ChatRequestBody = {
  message?: string;
  history?: ChatHistoryItem[];
};

type CloudflareResponseBody = {
  result?: {
    response?: string;
  };
  success?: boolean;
  errors?: Array<{
    message?: string;
  }>;
};

const systemPrompt = `
You are the website assistant for Coded Mind Data Solution.

Your audience includes:
1. Prospective clients looking for data engineering and analytics services.
2. Job seekers looking for current openings and application guidance.

Rules:
- Be concise, warm, and practical.
- Stay grounded in the website context provided below.
- If a visitor asks about services, explain relevant offerings and invite them to contact hr@codedmind.co.in for next steps.
- If a visitor asks about jobs, summarize the current role, eligibility, skills, and direct them to the careers page application form.
- Do not claim services, pricing, office locations, or job openings that are not in the site context.
- If the answer is not available from the site context, say that clearly and suggest emailing hr@codedmind.co.in.

Site context:
${buildSiteChatContext()}
`.trim();

function buildConversationPrompt(
  history: ChatHistoryItem[],
  message: string
) {
  const recentHistory = history.slice(-8);

  const historyText = recentHistory
    .map((item) => `${item.role === "user" ? "User" : "Assistant"}: ${item.text}`)
    .join("\n");

  return [systemPrompt, historyText, `User: ${message.trim()}`, "Assistant:"]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: Request) {
  const { message, history = [] } = (await request.json()) as ChatRequestBody;

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "A message is required." },
      { status: 400 }
    );
  }

  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Chat is not configured yet. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to enable the assistant.",
      },
      { status: 500 }
    );
  }

  const model =
    process.env.CLOUDFLARE_AI_MODEL ||
    "@cf/meta/llama-3.1-8b-instruct-fast";

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: buildConversationPrompt(history, message),
        max_tokens: 500,
      }),
    }
  );

  const responseBody = (await response.json()) as CloudflareResponseBody;

  if (!response.ok || !responseBody.success) {
    const errorMessage =
      responseBody.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
      "The assistant could not respond right now.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message:
      responseBody.result?.response?.trim() ||
      "I’m here to help with services, job openings, and application guidance.",
  });
}
