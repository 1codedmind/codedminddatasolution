export type TemplateName =
  | "modern" | "classic" | "minimal" | "executive" | "creative"
  | "compact" | "sharp" | "elegant"
  | "cascade" | "cubic" | "nanica" | "enfold";

export type FontOption =
  | "inter" | "roboto" | "montserrat" | "opensans" | "lato" | "nunito" | "raleway"
  | "georgia" | "merriweather" | "playfair" | "garamond";

export const FONT_OPTIONS: Record<FontOption, { label: string; css: string; serif: boolean; google?: string }> = {
  // ── Sans-serif ─────────────────────────────────────────────────────────
  inter:        { label: "Inter",            css: "'Inter', system-ui, sans-serif",                         serif: false, google: "Inter:wght@400;500;600;700;800" },
  roboto:       { label: "Roboto",           css: "'Roboto', Arial, sans-serif",                             serif: false, google: "Roboto:wght@300;400;500;700" },
  montserrat:   { label: "Montserrat",       css: "'Montserrat', Helvetica, sans-serif",                     serif: false, google: "Montserrat:wght@400;500;600;700;800" },
  opensans:     { label: "Open Sans",        css: "'Open Sans', Arial, sans-serif",                          serif: false, google: "Open+Sans:wght@300;400;600;700" },
  lato:         { label: "Lato",             css: "'Lato', Arial, sans-serif",                               serif: false, google: "Lato:wght@300;400;700" },
  nunito:       { label: "Nunito",           css: "'Nunito', system-ui, sans-serif",                         serif: false, google: "Nunito:wght@300;400;600;700;800" },
  raleway:      { label: "Raleway",          css: "'Raleway', Helvetica, sans-serif",                        serif: false, google: "Raleway:wght@400;500;600;700" },
  // ── Serif ──────────────────────────────────────────────────────────────
  georgia:      { label: "Georgia",          css: "Georgia, 'Times New Roman', serif",                       serif: true },
  merriweather: { label: "Merriweather",     css: "'Merriweather', Georgia, serif",                          serif: true,  google: "Merriweather:wght@400;700" },
  playfair:     { label: "Playfair Display", css: "'Playfair Display', Georgia, serif",                      serif: true,  google: "Playfair+Display:wght@400;600;700" },
  garamond:     { label: "EB Garamond",      css: "'EB Garamond', Georgia, serif",                           serif: true,  google: "EB+Garamond:wght@400;500;600;700" },
};

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
  fontScale: number;
  fontFamily: FontOption;
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
  compact:    { label: "Compact",    description: "Two-column layout, fits more on one page" },
  sharp:      { label: "Sharp",      description: "Bold geometric lines, strong section borders" },
  elegant:    { label: "Elegant",    description: "Centered, refined — ideal with serif fonts" },
  cascade:    { label: "Cascade",    description: "Colored left sidebar blends style with space efficiency" },
  cubic:      { label: "Cubic",      description: "Geometric header + gray right sidebar, highly structured" },
  nanica:     { label: "Nanica",     description: "Clean single-column, great readability for ATS" },
  enfold:     { label: "Enfold",     description: "Summary-first layout with elegant accent sidebar" },
};
