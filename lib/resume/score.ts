import type { ResumeData } from "./types";

export interface ScoreResult {
  score: number; // 0-100
  tips: ScoreTip[];
}

export interface ScoreTip {
  key: string;
  label: string;
  done: boolean;
}

export function scoreResume(data: ResumeData): ScoreResult {
  const tips: ScoreTip[] = [
    {
      key: "name",
      label: "Add your full name",
      done: data.personalInfo.fullName.trim().length > 1,
    },
    {
      key: "job_title",
      label: "Add a job title",
      done: data.personalInfo.jobTitle.trim().length > 1,
    },
    {
      key: "email",
      label: "Add an email address",
      done: data.personalInfo.email.trim().length > 3,
    },
    {
      key: "phone",
      label: "Add a phone number",
      done: data.personalInfo.phone.trim().length > 5,
    },
    {
      key: "location",
      label: "Add your location",
      done: data.personalInfo.location.trim().length > 1,
    },
    {
      key: "summary",
      label: "Write a professional summary (40+ words)",
      done: data.summary.trim().split(/\s+/).filter(Boolean).length >= 40,
    },
    {
      key: "experience",
      label: "Add at least one work experience",
      done: data.experience.length >= 1,
    },
    {
      key: "experience_bullets",
      label: "Add bullet points to your experience",
      done: data.experience.some((e) => e.bullets.filter((b) => b.trim()).length >= 2),
    },
    {
      key: "education",
      label: "Add your education",
      done: data.education.length >= 1,
    },
    {
      key: "skills",
      label: "List at least 3 skills",
      done: data.skills.length >= 3,
    },
    {
      key: "linkedin",
      label: "Add your LinkedIn URL",
      done: data.personalInfo.linkedin.trim().length > 5,
    },
    {
      key: "certifications",
      label: "Add certifications or projects",
      done: data.certifications.length >= 1 || data.projects.length >= 1,
    },
  ];

  const doneTips = tips.filter((t) => t.done);
  const score = Math.round((doneTips.length / tips.length) * 100);

  return { score, tips };
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#15803d"; // green
  if (score >= 50) return "#c2410c"; // orange
  return "#b91c1c"; // red
}
