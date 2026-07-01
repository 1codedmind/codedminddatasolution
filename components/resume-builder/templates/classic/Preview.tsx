import type { ResumeData } from "@/lib/resume/types";
import { renderCustomSection } from "@/lib/resume/customSectionHelper";
import { formatDate } from "@/lib/resume/dateUtils";

interface Props {
  data: ResumeData;
  color: string;
  fontFamily?: string;
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: 8, borderBottom: "1.5px solid #111827", paddingBottom: 3 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#111827" }}>{label}</div>
    </div>
  );
}

export default function ClassicPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 16 }}>
        <SectionHeading label="Summary" />
        <p style={{ fontSize: 10, lineHeight: 1.7, color: "#1F2937", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 16 }}>
        <SectionHeading label="Experience" />
        {experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.company}</div>
              <div style={{ fontSize: 9, color: "#6B7280" }}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</div>
            </div>
            <div style={{ fontSize: 10, fontStyle: "italic", color: "#374151", marginBottom: 4 }}>{exp.title}{exp.location ? `, ${exp.location}` : ""}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ fontSize: 10, color: "#374151", lineHeight: 1.6, marginBottom: 2 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 16 }}>
        <SectionHeading label="Education" />
        {education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</div>
              <div style={{ fontSize: 10, color: "#374151" }}>{edu.institution}{edu.location ? `, ${edu.location}` : ""}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</div>
            </div>
            <div style={{ fontSize: 9, color: "#6B7280" }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</div>
          </div>
        ))}
      </div>
    ) : null,

    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 16 }}>
        <SectionHeading label="Skills" />
        <p style={{ fontSize: 10, color: "#374151", margin: 0, lineHeight: 1.7 }}>
          {skills.map((sk) => sk.name).filter(Boolean).join(" · ")}
        </p>
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 16 }}>
        <SectionHeading label="Certifications" />
        {certifications.map((c) => (
          <div key={c.id} style={{ marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#111827" }}>{c.name}</span>
            <span style={{ fontSize: 10, color: "#6B7280" }}>{c.issuer ? ` · ${c.issuer}` : ""}{c.date ? ` · ${formatDate(c.date)}` : ""}</span>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 16 }}>
        <SectionHeading label="Projects" />
        {projects.map((proj) => (
          <div key={proj.id} style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
            {proj.url && <span style={{ fontSize: 9, color, marginLeft: 6 }}>{proj.url}</span>}
            {proj.description && <p style={{ fontSize: 10, color: "#374151", margin: "2px 0 0 0" }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 16 }}>
        <SectionHeading label="Languages" />
        <p style={{ fontSize: 10, color: "#374151", margin: 0 }}>
          {languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" · ")}
        </p>
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: fontFamily || "Georgia, 'Times New Roman', serif", background: "#fff", width: "100%", minHeight: "100%", padding: "36px 40px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #111827" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 6 }}>{p.jobTitle}</div>}
        <div style={{ fontSize: 9, color: "#6B7280", display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span style={{ color }}>{p.linkedin}</span>}
          {p.website && <span style={{ color }}>{p.website}</span>}
        </div>
      </div>

      {sectionOrder.map((key) => sectionMap[key] ?? renderCustomSection(data, key, color, fontFamily))}
    </div>
  );
}
