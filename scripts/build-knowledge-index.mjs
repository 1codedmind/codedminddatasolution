/**
 * Builds the embedding index for the site assistant's knowledge base.
 *
 *   node --env-file=.env.local scripts/build-knowledge-index.mjs
 *
 * Re-run this whenever data/knowledge.ts changes. The output is committed to
 * the repo so production never pays to rebuild it, and so a deploy cannot fail
 * because an embedding API was briefly unavailable.
 *
 * Reads CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN from the environment.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const EMBEDDING_MODEL = "@cf/baai/bge-base-en-v1.5";
const OUT = join(root, "data", "knowledge-index.json");

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !apiToken) {
  console.error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set.");
  console.error("Run with: node --env-file=.env.local scripts/build-knowledge-index.mjs");
  process.exit(1);
}

/**
 * data/knowledge.ts is TypeScript, so rather than compiling it we extract the
 * passages with a light parse. Only id/topic/keywords/text matter here, and the
 * file is a plain array of object literals by design.
 */
function loadPassages() {
  const source = readFileSync(join(root, "data", "knowledge.ts"), "utf8");
  const passages = [];

  const blockRe = /\{\s*id:\s*"([^"]+)",\s*topic:\s*"([^"]+)",([\s\S]*?)\n\s{2}\},/g;
  let match;
  while ((match = blockRe.exec(source))) {
    const [, id, topic, rest] = match;
    const textMatch = rest.match(/text:\s*\n?\s*"((?:[^"\\]|\\.)*)"/);
    const keywordsMatch = rest.match(/keywords:\s*\[([^\]]*)\]/);
    if (!textMatch) continue;

    const text = textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, " ");
    const keywords = keywordsMatch
      ? [...keywordsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];

    passages.push({ id, topic, text, keywords });
  }

  return passages;
}

// Job passages are generated at runtime from jobOpenings, so mirror that here.
function loadJobPassages() {
  const source = readFileSync(join(root, "data", "jobOpenings.ts"), "utf8");
  const slugs = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  const titles = [...source.matchAll(/title:\s*"([^"]+)"/g)].map((m) => m[1]);
  return slugs.map((slug, i) => ({
    id: `job-${slug}`,
    topic: "Careers",
    text: `Open role at Coded Mind: ${titles[i] ?? slug}. Apply at codedmind.co.in/careers/${slug} or email hr@codedmind.co.in.`,
    keywords: [(titles[i] ?? slug).toLowerCase(), "job", "role", "apply", "opening"],
  }));
}

async function embed(texts) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${EMBEDDING_MODEL}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiToken}` },
      body: JSON.stringify({ text: texts }),
    },
  );

  if (!res.ok) {
    throw new Error(`Embedding request failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const data = json?.result?.data;
  if (!Array.isArray(data)) throw new Error("Unexpected embedding response shape");
  return data;
}

const passages = [...loadPassages(), ...loadJobPassages()];
console.log(`\nEmbedding ${passages.length} passages with ${EMBEDDING_MODEL}...\n`);

const vectors = {};
const BATCH = 20;

for (let i = 0; i < passages.length; i += BATCH) {
  const batch = passages.slice(i, i + BATCH);
  // Embed topic + keywords + text, matching what retrieval searches over.
  const inputs = batch.map((p) => [p.topic, p.text, ...(p.keywords ?? [])].join(" "));
  const embeddings = await embed(inputs);

  batch.forEach((p, j) => {
    // Four decimals is ample for cosine similarity and keeps the file small.
    vectors[p.id] = embeddings[j].map((v) => Number(v.toFixed(4)));
    console.log(`  ${p.id.padEnd(28)} ${p.topic}`);
  });
}

const output = {
  model: EMBEDDING_MODEL,
  built: new Date().toISOString(),
  dimensions: Object.values(vectors)[0]?.length ?? 0,
  vectors,
};

writeFileSync(OUT, JSON.stringify(output));
const kb = (readFileSync(OUT).length / 1024).toFixed(0);
console.log(`\nWrote ${Object.keys(vectors).length} vectors (${output.dimensions}d) to data/knowledge-index.json — ${kb}KB\n`);
