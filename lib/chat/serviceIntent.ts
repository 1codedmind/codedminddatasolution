/**
 * Detects whether a visitor's chat message is a service enquiry worth handing
 * to the sales team.
 *
 * This is deliberately a deterministic keyword match rather than an LLM call:
 * lead capture writes to the database, so it must not be steerable by anything
 * a visitor types into the chat box, and it must not cost an extra inference
 * on every message.
 */

/** Terms that indicate the visitor is asking about paid work. */
const SERVICE_TERMS = [
  // IT services
  "it service", "it services", "software development", "web development",
  "app development", "mobile app", "custom software", "build an app",
  "build a website", "web app", "internal tool", "api development",
  "staff augmentation", "dedicated team", "hire a developer", "hire developers",
  "outsource", "consulting", "consultant",
  // Cloud & DevOps
  "cloud migration", "devops", "ci/cd", "kubernetes", "terraform",
  "infrastructure", "aws", "azure", "gcp", "google cloud",
  // Data engineering
  "data engineering", "data pipeline", "etl", "elt", "data warehouse",
  "snowflake", "databricks", "bigquery", "redshift", "airflow", "dbt",
  "dashboard", "power bi", "tableau", "analytics", "reporting",
  // AI
  "ai solution", "ai service", "machine learning", "ml model", "llm",
  "chatbot", "rag", "automation", "automate",
  // Commercial signals
  "quote", "quotation", "proposal", "pricing", "how much would it cost",
  "engagement", "contract", "project scope", "sow",
];

/** Terms that mean the visitor is asking about the free tools, not paid work. */
const TOOL_TERMS = [
  "resume builder", "resume template", "json formatter", "base64",
  "uuid generator", "word counter", "password generator", "timestamp",
  "timezone converter", "merge pdf", "split pdf", "compress pdf",
  "rotate pdf", "sign pdf", "jpg to pdf",
];

export type IntentResult = {
  isServiceEnquiry: boolean;
  matched: string[];
};

export function detectServiceIntent(message: string): IntentResult {
  const text = message.toLowerCase();

  // A question purely about a free tool is support, not a sales lead.
  const mentionsTool = TOOL_TERMS.some((term) => text.includes(term));
  const matched = SERVICE_TERMS.filter((term) => text.includes(term));

  if (mentionsTool && matched.length === 0) {
    return { isServiceEnquiry: false, matched: [] };
  }

  return { isServiceEnquiry: matched.length > 0, matched };
}
