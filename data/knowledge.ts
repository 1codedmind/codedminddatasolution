import { jobOpenings } from "@/data/jobOpenings";

/**
 * The assistant's knowledge base, as discrete retrievable passages.
 *
 * Previously the entire site context — roughly 9.7KB — was pasted into every
 * request regardless of what was asked. That buries the relevant two sentences
 * among fifty irrelevant ones, which is a large part of why the model drifted
 * and invented details. Each entry here is a single self-contained fact that
 * can be retrieved on its own.
 *
 * Keep passages short and specific. If a passage needs "and also", it is
 * probably two passages.
 */

export type Passage = {
  id: string;
  topic: string;
  /** Where a visitor can verify this, if anywhere. */
  url?: string;
  /** Extra search terms that do not appear in the text itself. */
  keywords?: string[];
  text: string;
};

const company: Passage[] = [
  {
    id: "company-overview",
    topic: "Company",
    url: "/",
    keywords: ["about", "who are you", "what do you do", "coded mind"],
    text: "Coded Mind is a technology company delivering data engineering, full-stack software development, and AI solutions. We also publish a set of free browser-based developer tools. Contact: hr@codedmind.co.in. We work with clients remotely, worldwide.",
  },
  {
    id: "company-contact",
    topic: "Contact",
    url: "/contact",
    keywords: ["email", "get in touch", "reach", "talk", "enquiry", "phone"],
    text: "To contact Coded Mind, email hr@codedmind.co.in or use the contact form at codedmind.co.in/contact. We reply within 1-2 business days.",
  },
  {
    id: "company-engagement-models",
    topic: "Engagement",
    url: "/it-services",
    keywords: ["contract", "retainer", "how do we work together", "engage", "hire"],
    text: "Coded Mind offers three engagement models: fixed scope (a defined deliverable at a fixed price), dedicated team (engineers working only on your roadmap, billed monthly), and advisory retainer (a set number of hours each month for reviews and architecture guidance).",
  },
  {
    id: "company-pricing",
    topic: "Pricing",
    keywords: [
      "cost", "price", "quote", "rate", "budget", "how much", "expensive",
      "how long", "timeline", "duration", "delivery time", "turnaround",
      "estimate", "weeks", "months", "lead time", "when can you deliver",
    ],
    text: "Coded Mind does not publish prices or delivery timelines. Every engagement is custom-quoted after understanding scope. There are no published day rates, package prices, or delivery estimates in weeks or months. Anyone asking how much something costs or how long it takes should be told it depends on scope and directed to hr@codedmind.co.in for a scoped quote.",
  },
  {
    id: "company-process",
    topic: "Process",
    url: "/services",
    keywords: ["how do you work", "methodology", "process", "delivery"],
    text: "Coded Mind follows five steps on every engagement: understand the client's existing systems, shape a written scope with architecture and trade-offs, build in short cycles with working software each cycle, ship with monitoring and rollback in place, then hand over with documentation and a walkthrough.",
  },
];

const dataServices: Passage[] = [
  {
    id: "data-overview",
    topic: "Data Engineering",
    url: "/services",
    keywords: ["data services", "data engineering", "pipelines"],
    text: "Coded Mind builds data engineering solutions: ETL and ELT pipelines with tested transformations and traceable lineage, warehouse and lakehouse modelling, orchestration with retries and alerting, data quality gates, and reporting dashboards.",
  },
  {
    id: "data-stack",
    topic: "Data Engineering",
    url: "/services",
    keywords: ["tools", "technologies", "platforms", "which tools"],
    text: "For data work Coded Mind uses Python, SQL, dbt, Airflow, Spark, and Kafka, with warehouses on Snowflake, BigQuery, Databricks, or Redshift. Dashboards are built in Power BI, Tableau, or Metabase.",
  },
  {
    id: "data-quality",
    topic: "Data Engineering",
    url: "/services",
    keywords: ["data quality", "validation", "monitoring", "testing"],
    text: "Coded Mind builds data quality gates so incorrect figures are caught before reaching a report, along with monitoring, alerting, and backfill handling for pipelines.",
  },
];

const softwareServices: Passage[] = [
  {
    id: "software-overview",
    topic: "Software Development",
    url: "/it-services",
    keywords: ["software", "web app", "application", "build an app", "development", "website"],
    text: "Yes, Coded Mind builds software. This is a core offering alongside data work. We deliver web applications, internal tools, admin portals, customer-facing products, APIs, and system integrations.",
  },
  {
    id: "software-mobile",
    topic: "Software Development",
    url: "/it-services",
    keywords: ["mobile", "ios", "android", "app store", "native app", "phone"],
    text: "Coded Mind builds mobile-friendly responsive web applications that work on phones and tablets. We do NOT offer native iOS or Android app development. If a visitor needs a native mobile app, say responsive web is what we deliver and offer to discuss their requirement with the team.",
  },
  {
    id: "software-stack",
    topic: "Software Development",
    url: "/it-services",
    keywords: ["tech stack", "technologies", "frameworks", "languages"],
    text: "Coded Mind's software stack is TypeScript, JavaScript, Python, React, Next.js, Tailwind CSS, Node.js, REST APIs, and PostgreSQL. We do not use or advertise Angular, Vue, Ruby on Rails, PHP, Laravel, Django, MySQL, or MongoDB.",
  },
  {
    id: "software-architecture",
    topic: "Software Development",
    url: "/it-services",
    keywords: ["multi-tenant", "permissions", "rbac", "audit", "security"],
    text: "Coded Mind builds multi-tenant architecture with role-based access control and audit trails as standard, rather than as an afterthought.",
  },
  {
    id: "cloud-devops",
    topic: "Cloud & DevOps",
    url: "/it-services",
    keywords: ["aws", "azure", "gcp", "cloud", "devops", "kubernetes", "terraform", "ci/cd", "hosting", "migration"],
    text: "Coded Mind provides cloud and DevOps work: migration and architecture on AWS, Google Cloud, or Azure, CI/CD pipelines, infrastructure as code with Terraform, container orchestration with Kubernetes and Docker, plus monitoring, alerting, and cost optimisation.",
  },
  {
    id: "consulting",
    topic: "Consulting",
    url: "/it-services",
    keywords: ["consulting", "staff augmentation", "hire developers", "dedicated team", "outsource", "advisory"],
    text: "Coded Mind offers IT consulting and staff augmentation: architecture and code reviews, technology selection, roadmap planning, and senior engineers embedded in a client's team working in their tools and sprint cadence.",
  },
];

const aiServices: Passage[] = [
  {
    id: "ai-overview",
    topic: "AI Solutions",
    url: "/services",
    keywords: ["ai", "artificial intelligence", "machine learning", "ml", "llm", "gpt"],
    text: "Coded Mind builds AI solutions: document parsing, extraction and classification at volume, retrieval-augmented assistants grounded in a client's own content, and workflow automation where a model handles judgement and ordinary code handles the rest.",
  },
  {
    id: "ai-chatbot",
    topic: "AI Solutions",
    url: "/services",
    keywords: ["chatbot", "assistant", "rag", "retrieval", "knowledge base", "support bot"],
    text: "Coded Mind builds grounded chat assistants using retrieval-augmented generation over a client's own documents, so answers cite real source material rather than the open web.",
  },
  {
    id: "ai-governance",
    topic: "AI Solutions",
    url: "/services",
    keywords: ["evaluation", "cost", "guardrails", "accuracy", "hallucination", "testing ai"],
    text: "Coded Mind wraps AI features in evaluation harnesses so prompt changes are measurable, plus quotas, rate limits, and fallbacks that keep inference spend predictable.",
  },
];

const products: Passage[] = [
  {
    id: "product-exam",
    topic: "Our Work",
    keywords: ["exam", "examination", "assessment", "test platform", "proctoring", "university"],
    text: "Coded Mind built and operates a multi-tenant online examination platform for universities and corporate hiring, with isolated tenants, role-based access, LeetCode-style coding questions in a Monaco editor, and Python executed entirely in the browser via Pyodide.",
  },
  {
    id: "product-finance",
    topic: "Our Work",
    keywords: ["invoice", "billing", "gst", "accounting", "finance"],
    text: "Coded Mind built a GST-compliant billing and accounting engine for the Indian market, with automatic CGST/SGST versus IGST splitting, payments with status rollover, compliant PDF invoices, and an API-key-authenticated REST interface for embedding in other products.",
  },
  {
    id: "product-hrms",
    topic: "Our Work",
    keywords: ["hrms", "hr system", "payroll", "leave", "attendance", "employees"],
    text: "Coded Mind built the HRMS it runs its own company on, covering employees, departments, attendance, leave approvals, payroll runs, performance reviews, asset assignment, and an append-only audit trail.",
  },
  {
    id: "product-resume",
    topic: "Free Tools",
    url: "/tools/resume-builder",
    keywords: ["resume", "cv", "resume builder", "ats"],
    text: "The Coded Mind resume builder is free at codedmind.co.in/tools/resume-builder. It offers twelve templates rendered for both screen and print, AI parsing of an uploaded PDF into structured fields, and ATS scoring. Signing in is required only for the AI upload.",
  },
];

const tools: Passage[] = [
  {
    id: "tools-overview",
    topic: "Free Tools",
    url: "/tools",
    keywords: ["free tools", "developer tools", "utilities", "login required"],
    text: "Coded Mind publishes about a dozen free developer tools at codedmind.co.in/tools. They run entirely in the browser, need no account, and send nothing to a server.",
  },
  {
    id: "tool-json",
    topic: "Free Tools",
    url: "/tools/json-formatter",
    keywords: ["json", "formatter", "validate", "minify", "pretty print"],
    text: "The JSON Formatter at codedmind.co.in/tools/json-formatter formats, validates, and minifies JSON with real-time syntax error highlighting. Free, no login.",
  },
  {
    id: "tool-timezone",
    topic: "Free Tools",
    url: "/tools/timezone-converter",
    keywords: ["timezone", "time zone", "utc", "dst", "meeting time"],
    text: "The Timezone Converter at codedmind.co.in/tools/timezone-converter shows a visual timeline across 500+ IANA timezones, is DST-aware, and is searchable by city or country. Free, no login.",
  },
  {
    id: "tool-base64",
    topic: "Free Tools",
    url: "/tools/base64",
    keywords: ["base64", "encode", "decode"],
    text: "The Base64 tool at codedmind.co.in/tools/base64 encodes text or files to Base64 and decodes Base64 strings, entirely in the browser. Free, no login.",
  },
  {
    id: "tool-uuid",
    topic: "Free Tools",
    url: "/tools/uuid-generator",
    keywords: ["uuid", "guid", "identifier", "v4"],
    text: "The UUID Generator at codedmind.co.in/tools/uuid-generator creates cryptographically secure v4 UUIDs, singly or in bulk up to 100. Free, no login.",
  },
  {
    id: "tool-timestamp",
    topic: "Free Tools",
    url: "/tools/timestamp",
    keywords: ["timestamp", "unix", "epoch", "date convert"],
    text: "The Timestamp Converter at codedmind.co.in/tools/timestamp converts Unix timestamps to human-readable dates and back, in any timezone. Free, no login.",
  },
  {
    id: "tool-word-counter",
    topic: "Free Tools",
    url: "/tools/word-counter",
    keywords: ["word count", "character count", "readability", "reading time"],
    text: "The Word Counter at codedmind.co.in/tools/word-counter counts words, characters, sentences, and paragraphs, estimates reading time, and reports readability. Free, no login.",
  },
  {
    id: "tool-password",
    topic: "Free Tools",
    url: "/tools/password-generator",
    keywords: ["password", "random", "secure password"],
    text: "The Password Generator at codedmind.co.in/tools/password-generator creates strong random passwords with custom length, symbols, and character rules. Free, no login.",
  },
  {
    id: "tool-pdf",
    topic: "Free Tools",
    url: "/tools/pdf",
    keywords: ["pdf", "merge", "split", "rotate", "compress", "jpg to pdf", "sign"],
    text: "The PDF tools at codedmind.co.in/tools/pdf merge, split, rotate, compress, sign, and convert images to PDF. Files are processed locally in the browser and never leave the device. Free, no login.",
  },
];

const games: Passage[] = [
  {
    id: "tool-games",
    topic: "Free Tools",
    url: "/tools/games",
    keywords: ["game", "games", "gaming", "game tools"],
    text: "Coded Mind publishes free browser-based tools for online games at codedmind.co.in/tools/games. No login or API key needed.",
  },
  {
    id: "tool-torn",
    topic: "Free Tools",
    url: "/tools/games/torn-profit",
    keywords: ["torn", "torn city", "bazaar", "profit finder", "trading", "buy low sell high", "item market"],
    text: "The Torn Bazaar Profit Finder at codedmind.co.in/tools/games/torn-profit lists every Torn item currently selling in a player bazaar below what you can sell it for, ranked by profit, with both market-resale and vendor exit routes. Free, no Torn API key required. Coded Mind is not affiliated with Torn.",
  },
];

const careers: Passage[] = [
  {
    id: "careers-overview",
    topic: "Careers",
    url: "/careers",
    keywords: ["job", "hiring", "career", "vacancy", "apply", "internship", "role"],
    text: "Coded Mind lists open roles at codedmind.co.in/careers. Candidates apply from the role page or by emailing a resume to hr@codedmind.co.in.",
  },
  {
    id: "careers-assessments",
    topic: "Careers",
    url: "/assessments",
    keywords: ["assessment", "coding test", "practice", "interview prep"],
    text: "Coded Mind's website includes a coding assessment area with Python and SQL challenges that run in the browser, useful for candidates practising for technical interviews.",
  },
  // Live openings are generated so the assistant never describes a stale role.
  ...jobOpenings.map<Passage>((job) => ({
    id: `job-${job.slug}`,
    topic: "Careers",
    url: `/careers/${job.slug}`,
    keywords: [job.title.toLowerCase(), "job", "role", "apply", "opening"],
    text: `Open role at Coded Mind: ${job.title}. ${job.summary} Key skills: ${job.requiredSkills
      .slice(0, 4)
      .join(" ")} Apply at codedmind.co.in/careers/${job.slug} or email hr@codedmind.co.in.`,
  })),
];

const boundaries: Passage[] = [
  {
    id: "boundary-unknown",
    topic: "Boundaries",
    keywords: ["office", "location", "address", "team size", "employees", "founded", "clients", "sla", "uptime"],
    text: "Coded Mind does not publish office locations, team size, founding date, client names, SLAs, or uptime figures. If asked, say the information is not published and offer hr@codedmind.co.in.",
  },
];

export const KNOWLEDGE: Passage[] = [
  ...company,
  ...dataServices,
  ...softwareServices,
  ...aiServices,
  ...products,
  ...tools,
  ...games,
  ...careers,
  ...boundaries,
];

/** Full searchable text for a passage, including its keywords. */
export function passageSearchText(p: Passage): string {
  return [p.topic, p.text, ...(p.keywords ?? [])].join(" ");
}
