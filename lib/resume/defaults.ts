import type { ResumeData } from "./types";

function uuid() { return globalThis.crypto.randomUUID(); }

export function emptyResume(): ResumeData {
  return {
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
      photoUrl: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    customSections: [],
    sectionOrder: ["summary", "experience", "education", "skills", "certifications", "projects", "languages"],
  };
}

export function sampleResume(): ResumeData {
  return {
    personalInfo: {
      fullName: "Alex Johnson",
      jobTitle: "Senior Software Engineer",
      email: "alex.johnson@email.com",
      phone: "+1 (555) 012-3456",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexjohnson",
      website: "alexjohnson.dev",
      photoUrl: "",
    },
    summary:
      "Results-driven software engineer with 6+ years of experience building scalable web applications. Passionate about clean code, developer experience, and shipping products that users love. Led teams of up to 8 engineers across multiple high-impact initiatives.",
    experience: [
      {
        id: uuid(),
        company: "Stripe",
        title: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2021-03",
        endDate: "",
        current: true,
        bullets: [
          "Led development of the new Dashboard payments UI serving 4M+ merchants, reducing page load by 40%.",
          "Architected real-time fraud detection pipeline processing 10,000+ transactions per second.",
          "Mentored 3 junior engineers and established code review best practices adopted org-wide.",
        ],
      },
      {
        id: uuid(),
        company: "Airbnb",
        title: "Software Engineer",
        location: "San Francisco, CA",
        startDate: "2018-07",
        endDate: "2021-02",
        current: false,
        bullets: [
          "Built and maintained search infrastructure serving 150M+ monthly active users.",
          "Reduced search latency by 35% through query optimization and strategic caching.",
          "Contributed to open-source accessibility improvements adopted by 200+ projects.",
        ],
      },
    ],
    education: [
      {
        id: uuid(),
        institution: "UC Berkeley",
        degree: "B.S.",
        field: "Computer Science",
        location: "Berkeley, CA",
        startDate: "2014-08",
        endDate: "2018-05",
        gpa: "3.8",
        bullets: [],
      },
    ],
    skills: [
      { id: uuid(), name: "TypeScript", level: 5 },
      { id: uuid(), name: "React", level: 5 },
      { id: uuid(), name: "Node.js", level: 4 },
      { id: uuid(), name: "PostgreSQL", level: 4 },
      { id: uuid(), name: "AWS", level: 3 },
      { id: uuid(), name: "Docker", level: 3 },
    ],
    certifications: [
      {
        id: uuid(),
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2022-06",
        url: "",
      },
    ],
    projects: [],
    languages: [
      { id: uuid(), name: "English", level: "Native" },
      { id: uuid(), name: "Spanish", level: "Intermediate" },
    ],
    customSections: [],
    sectionOrder: ["summary", "experience", "education", "skills", "certifications", "projects", "languages"],
  };
}
