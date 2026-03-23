import { jobOpenings } from "@/data/jobOpenings";

const services = [
  "Data Engineering",
  "Cloud Data Solutions",
  "Reporting & Dashboards",
  "Data Automation",
  "Custom Data Products",
  "Data Quality & Optimization",
];

export function buildSiteChatContext() {
  const jobSummary = jobOpenings
    .map((job) => {
      const keyDetails = job.details
        .map((detail) => `${detail.label}: ${detail.value}`)
        .join("; ");

      return [
        `Role: ${job.title}`,
        `Slug: ${job.slug}`,
        `Summary: ${job.summary}`,
        `Overview: ${job.overview}`,
        `Responsibilities: ${job.responsibilities.join(" | ")}`,
        `Required skills: ${job.requiredSkills.join(" | ")}`,
        `Details: ${keyDetails}`,
        `Ideal candidate: ${job.idealCandidate}`,
      ].join("\n");
    })
    .join("\n\n");

  return `
Company: Coded Mind Data Solution
Contact email: hr@codedmind.co.in

Primary services:
- ${services.join("\n- ")}

Careers:
${jobSummary}

Website guidance:
- Help prospective clients understand the services, process, and how to contact the company.
- Help job seekers understand current openings, eligibility, required skills, and how to apply.
- For job applications, direct users to the careers pages and mention that applications are sent by email with resume attachment.
- If the website does not clearly contain an answer, say so instead of inventing facts.
`.trim();
}
