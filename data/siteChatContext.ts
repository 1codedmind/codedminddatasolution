import { jobOpenings } from "@/data/jobOpenings";

const devTools = [
  { name: "JSON Formatter",      path: "/tools/json-formatter",     desc: "Format, validate, and minify JSON. Highlights syntax errors in real time." },
  { name: "Timezone Converter",  path: "/tools/timezone-converter", desc: "Visual timeline across 500+ IANA timezones, DST-aware, searchable by city or country." },
  { name: "Timestamp Converter", path: "/tools/timestamp",          desc: "Convert Unix timestamps to human-readable dates and back, in any timezone." },
  { name: "Base64 Encoder",      path: "/tools/base64",             desc: "Encode text or files to Base64, or decode Base64 strings, entirely in the browser." },
  { name: "UUID Generator",      path: "/tools/uuid-generator",     desc: "Generate cryptographically secure v4 UUIDs, one at a time or in bulk up to 100." },
  { name: "Word Counter",        path: "/tools/word-counter",       desc: "Count words, characters, sentences, paragraphs, and estimated reading time live." },
  { name: "Password Generator",  path: "/tools/password-generator", desc: "Generate strong, random passwords with custom length, symbols, and character rules." },
];

const pdfTools = [
  { name: "Merge PDF",    path: "/tools/pdf/merge",      desc: "Combine multiple PDFs into one file. Expand to individual pages and drag-reorder before merging." },
  { name: "Split PDF",    path: "/tools/pdf/split",      desc: "Extract individual pages or custom ranges (e.g. 1-3, 5, 7-9) from any PDF." },
  { name: "Rotate PDF",   path: "/tools/pdf/rotate",     desc: "Rotate all pages or specific pages by 90°, 180°, or 270°." },
  { name: "JPG to PDF",   path: "/tools/pdf/jpg-to-pdf", desc: "Convert JPG, PNG, or WebP images into a single PDF document with page-size options." },
  { name: "Compress PDF", path: "/tools/pdf/compress",   desc: "Coming soon — server-side compression with Ghostscript for significant size reduction." },
];

const services = [
  { name: "Data Engineering",           desc: "Scalable ETL/ELT pipelines using Airflow, dbt, Spark, and modern cloud-native tooling." },
  { name: "Cloud Data Solutions",        desc: "Cloud data infrastructure on AWS, GCP, or Azure, designed around your workloads and budget." },
  { name: "Reporting & Dashboards",     desc: "Interactive dashboards and automated scheduled reports for real-time business visibility." },
  { name: "Data Automation",            desc: "End-to-end automation from data ingestion and transformation through to delivery and alerting." },
  { name: "Custom Data Products",       desc: "Internal tools, APIs, and analytics apps tailored to your team's specific data workflows." },
  { name: "Data Quality & Optimization",desc: "Validation, monitoring, lineage, and performance tuning for clean, fast, reliable data systems." },
];

const process = [
  { step: "01 Discover", desc: "Understand business goals, existing infrastructure, and the specific problems to solve before writing a line of code." },
  { step: "02 Design",   desc: "Architect a solution tailored to the client's stack — right tools, right patterns, right data models." },
  { step: "03 Build",    desc: "Develop, test, and deploy with clean, well-documented, production-ready code." },
  { step: "04 Optimize", desc: "Monitor performance and continuously improve systems as the business grows." },
];

export function buildSiteChatContext() {
  const jobSummary = jobOpenings
    .map((job) => {
      const keyDetails = job.details
        .map((d) => `${d.label}: ${d.value}`)
        .join("; ");
      return [
        `Role: ${job.title}`,
        `URL: codedmind.co.in/careers/${job.slug}`,
        `Summary: ${job.summary}`,
        `Overview: ${job.overview}`,
        `Responsibilities: ${job.responsibilities.join(" | ")}`,
        `Required skills: ${job.requiredSkills.join(" | ")}`,
        `Details: ${keyDetails}`,
        `Ideal candidate: ${job.idealCandidate}`,
      ].join("\n");
    })
    .join("\n\n");

  const devToolsList = devTools
    .map((t) => `- ${t.name} (${t.path}): ${t.desc}`)
    .join("\n");

  const pdfToolsList = pdfTools
    .map((t) => `- ${t.name} (${t.path}): ${t.desc}`)
    .join("\n");

  const servicesList = services
    .map((s) => `- ${s.name}: ${s.desc}`)
    .join("\n");

  const processList = process
    .map((p) => `- ${p.step}: ${p.desc}`)
    .join("\n");

  return `
COMPANY: Coded Mind (codedmind.co.in)
CONTACT: hr@codedmind.co.in
TAGLINE: Free developer tools + professional data engineering services

--- FREE DEVELOPER TOOLS (codedmind.co.in/tools) ---
All tools run entirely in the browser. No login, no data sent, completely free.
${devToolsList}

--- FREE PDF TOOLS (codedmind.co.in/tools/pdf) ---
All PDF tools process files locally in the browser using WebAssembly — files never leave the user's device.
${pdfToolsList}

--- DATA ENGINEERING SERVICES ---
For teams that need custom data infrastructure, automation, and reporting.
${servicesList}

--- HOW WE WORK ---
${processList}

--- CAREERS ---
${jobSummary.length > 0 ? jobSummary : "No active openings at this time. Email hr@codedmind.co.in to express interest."}

--- ASSESSMENTS ---
The website includes a coding assessment area with Python and SQL challenges that run directly in the browser — useful for candidates practicing for technical interviews.

--- GENERAL GUIDANCE ---
- All developer tools and PDF tools are free, need no account, and work offline.
- Services are custom-quoted — email hr@codedmind.co.in or use the contact form on the homepage.
- For job applications, candidates apply via the /careers page or directly by emailing their resume to hr@codedmind.co.in.
- If a question can't be answered from this context, say so and suggest the email above.
`.trim();
}
