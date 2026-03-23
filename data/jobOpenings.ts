export type JobDetail = {
  label: string;
  value: string;
};

export type JobOpening = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  overview: string;
  responsibilities: string[];
  requiredSkills: string[];
  details: JobDetail[];
  idealCandidate: string;
};

export const jobOpenings: JobOpening[] = [
  {
    slug: "data-engineering-intern",
    title: "Data Engineering Intern",
    eyebrow: "Current Opening",
    summary:
      "Hands-on internship focused on production-grade data engineering pipelines and AI-driven solutions using modern cloud and data platforms.",
    overview:
      "This internship offers an opportunity to work on production-grade data engineering pipelines and AI-driven solutions. Selected candidates will gain hands-on experience in designing and building scalable data systems using modern data engineering tools and cloud platforms.",
    responsibilities: [
      "Design, develop, and maintain ETL/ELT pipelines.",
      "Process and transform large datasets using PySpark.",
      "Work with cloud-based data infrastructure on AWS including S3, Lambda, and Glue.",
      "Utilize platforms such as Databricks for data processing and workflow management.",
      "Assist in designing data architectures and optimized data models.",
      "Contribute to AI/ML-oriented data workflows and solutions.",
      "Ensure data quality, performance optimization, and system reliability.",
    ],
    requiredSkills: [
      "Strong foundation in Python and SQL.",
      "Understanding of data engineering concepts including ETL, data pipelines, and data modeling.",
      "Familiarity with PySpark or distributed data processing frameworks.",
      "Exposure to cloud platforms, preferably AWS.",
      "Basic knowledge of Databricks or willingness to learn.",
      "Strong analytical and problem-solving skills.",
    ],
    details: [
      { label: "Duration", value: "6 Months, extendable based on performance" },
      { label: "Stipend", value: "Rs. 10,000 per month" },
      { label: "Mode", value: "Hybrid" },
      { label: "Selection", value: "Direct Technical Interview" },
      { label: "Eligibility", value: "Minimum 75% academic performance" },
      {
        label: "PPO",
        value:
          "Exceptional performers may be considered for a full-time opportunity based on their performance during the internship.",
      },
    ],
    idealCandidate:
      "We are looking for candidates who demonstrate strong fundamentals, intellectual curiosity, and a genuine interest in building scalable data systems.",
  },
];

export function getJobOpening(slug: string) {
  return jobOpenings.find((job) => job.slug === slug);
}
