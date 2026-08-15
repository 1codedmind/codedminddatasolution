import { KNOWLEDGE, passageSearchText, type Passage } from "@/data/knowledge";
import embeddingIndex from "@/data/knowledge-index.json";

/**
 * Retrieval for the site assistant.
 *
 * Hybrid on purpose. Semantic search handles paraphrase — "can you make me an
 * app" matching a passage about software development — while lexical overlap
 * handles the exact product names and acronyms that embeddings blur together
 * (GST, UUID, dbt). Either alone leaves obvious gaps.
 *
 * If the embedding call fails or the index is stale, lexical scoring still
 * returns sensible passages, so the assistant degrades rather than breaking.
 */

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";

type IndexShape = {
  model: string;
  built: string;
  vectors: Record<string, number[]>;
};

const index = embeddingIndex as IndexShape;

/* ── Lexical scoring ──────────────────────────────────────────────────────── */

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been",
  "do", "does", "did", "you", "your", "we", "our", "us", "i", "me", "my", "it",
  "to", "of", "in", "on", "for", "with", "at", "by", "from", "can", "could",
  "would", "should", "will", "what", "how", "who", "when", "where", "why",
  "have", "has", "had", "about", "any", "some", "please", "tell", "give",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// Inverse document frequency, so a rare term like "gst" outweighs "services".
const documentFrequency = new Map<string, number>();
for (const passage of KNOWLEDGE) {
  for (const term of new Set(tokenize(passageSearchText(passage)))) {
    documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }
}

function lexicalScore(queryTerms: string[], passage: Passage): number {
  const passageTerms = new Set(tokenize(passageSearchText(passage)));
  let score = 0;

  for (const term of queryTerms) {
    if (!passageTerms.has(term)) continue;
    const df = documentFrequency.get(term) ?? 1;
    score += Math.log(1 + KNOWLEDGE.length / df);
  }

  // Normalise by query length so long questions do not dominate.
  return queryTerms.length ? score / Math.sqrt(queryTerms.length) : 0;
}

/* ── Semantic scoring ─────────────────────────────────────────────────────── */

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom ? dot / denom : 0;
}

async function embedQuery(query: string): Promise<number[] | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) return null;

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${EMBEDDING_MODEL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ text: [query] }),
      },
    );

    if (!res.ok) {
      console.error("[retrieval] embedding request failed:", res.status);
      return null;
    }

    const json = (await res.json()) as { result?: { data?: number[][] } };
    return json.result?.data?.[0] ?? null;
  } catch (err) {
    console.error("[retrieval] embedding error:", err);
    return null;
  }
}

/* ── Cheap paths ──────────────────────────────────────────────────────────── */

const GREETINGS = new Set([
  "hi", "hey", "hello", "yo", "hiya", "howdy", "greetings", "sup",
  "good", "morning", "afternoon", "evening", "thanks", "thank", "ok",
  "okay", "cool", "nice", "bye", "goodbye", "test", "testing",
  "hola", "namaste", "cheers", "welcome", "please", "sorry",
]);

/**
 * Words that carry no retrievable meaning on their own. A phrase made only of
 * greetings and these is still small talk — "hello there", "how are you".
 */
const FILLERS = new Set([
  "there", "how", "are", "you", "is", "it", "going", "doing", "im", "i", "am",
  "all", "well", "mate", "buddy", "friend", "again", "so", "just", "a", "the",
  "to", "me", "my", "we", "up", "whats", "your", "day",
]);

/**
 * True for greetings and other content-free openers.
 *
 * These carry no retrievable intent, so paying for an embedding call to match
 * them against the knowledge base is pure waste — and it is a meaningful share
 * of real traffic, since most conversations open with "hi".
 */
function isSmallTalk(query: string): boolean {
  const words = query
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return true;
  if (words.length > 5) return false;

  // Must be built only from greetings and filler, and contain at least one
  // actual greeting — so "how much" or "are you free" still get retrieved.
  const onlyChitChat = words.every((w) => GREETINGS.has(w) || FILLERS.has(w));
  const hasGreeting = words.some((w) => GREETINGS.has(w));
  return onlyChitChat && hasGreeting;
}

/** Passages that introduce the company, used when there is nothing to retrieve. */
const INTRO_IDS = ["company-overview", "software-overview", "data-overview", "ai-overview", "tools-overview"];

/* ── Public API ───────────────────────────────────────────────────────────── */

export type RetrievedPassage = Passage & { score: number };

/**
 * Return the passages most relevant to a question.
 *
 * `minScore` drops weak matches entirely — it is better to hand the model three
 * good passages and let it say "I don't know" than to pad with noise it will
 * feel obliged to use.
 */
export async function retrieve(
  query: string,
  { topK = 6, minScore = 0.12 }: { topK?: number; minScore?: number } = {},
): Promise<RetrievedPassage[]> {
  // Greetings get a fixed introductory set — no embedding call, no lookup.
  if (isSmallTalk(query)) {
    return KNOWLEDGE.filter((p) => INTRO_IDS.includes(p.id)).map((p) => ({ ...p, score: 1 }));
  }

  const queryTerms = tokenize(query);
  const queryVector = await embedQuery(query);

  const scored = KNOWLEDGE.map((passage) => {
    const lexical = lexicalScore(queryTerms, passage);
    const vector = index.vectors[passage.id];
    const semantic = queryVector && vector ? cosine(queryVector, vector) : 0;

    // Lexical scores are unbounded, so squash before blending with cosine.
    const lexicalNormalised = lexical / (lexical + 1.5);

    const score = queryVector
      ? 0.65 * semantic + 0.35 * lexicalNormalised
      : lexicalNormalised;

    return { ...passage, score };
  });

  return scored
    .filter((p) => p.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/** Format retrieved passages for injection into the system prompt. */
export function formatContext(passages: RetrievedPassage[]): string {
  if (passages.length === 0) {
    return "No relevant information was found in the knowledge base for this question.";
  }

  return passages
    .map((p, i) => {
      const source = p.url ? ` (source: codedmind.co.in${p.url})` : "";
      return `[${i + 1}] ${p.topic}${source}\n${p.text}`;
    })
    .join("\n\n");
}

/** True when the committed index no longer matches the knowledge base. */
export function isIndexStale(): boolean {
  return KNOWLEDGE.some((p) => !index.vectors[p.id]);
}
