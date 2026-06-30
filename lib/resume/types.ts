export type TemplateName = "modern" | "classic" | "minimal" | "executive" | "creative";

export type SectionName =
  | "personalInfo"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects"
  | "languages";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  photoUrl: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  bullets: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  bullets: string[];
}

export interface Language {
  id: string;
  name: string;
  level: string; // "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic"
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  languages: Language[];
  sectionOrder: SectionName[];
}

export interface ResumeConfig {
  template: TemplateName;
  accentColor: string;
}

export const LANGUAGE_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"] as const;

export const ACCENT_COLORS = [
  "#1d4ed8", // blue
  "#0f766e", // teal
  "#7c3aed", // violet
  "#b91c1c", // red
  "#c2410c", // orange
  "#0e7490", // cyan
  "#15803d", // green
  "#86198f", // fuchsia
  "#0369a1", // sky
  "#92400e", // amber
  "#374151", // gray
  "#111827", // near-black
] as const;

export const TEMPLATE_META: Record<TemplateName, { label: string; description: string }> = {
  modern:     { label: "Modern",     description: "Clean two-column header with accent color" },
  classic:    { label: "Classic",    description: "Traditional single-column, timeless look" },
  minimal:    { label: "Minimal",    description: "Ultra-clean with plenty of whitespace" },
  executive:  { label: "Executive",  description: "Bold sidebar layout, corporate feel" },
  creative:   { label: "Creative",   description: "Color-band header, contemporary design" },
};
