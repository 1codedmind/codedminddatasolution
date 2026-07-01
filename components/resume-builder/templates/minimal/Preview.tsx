import type { ResumeData } from "@/lib/resume/types";
import { renderCustomSection } from "@/lib/resume/customSectionHelper";
import { formatDate } from "@/lib/resume/dateUtils";

interface Props {
  data: ResumeData;
  color: string;
  fontFamily?: string;
}

export default function MinimalPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9CA3AF", marginBottom: 8 }}>Summary</div>
        <p style={{ fontSize: 10.5, lineHeight: 1.75, color: "#374151", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9CA3AF", marginBottom: 8 }}>Experience</div>
        {experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.title}</div>
              <div style={{ fontSize: 9, color: "#9CA3AF" }}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</div>
            </div>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 5 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 12 }}>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ fontSize: 10, color: "#4B5563", lineHeight: 1.65, marginBottom: 2 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9CA3AF", marginBottom: 8 }}>Education</div>
        {education.map((edu) => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 10, color: "#6B7280" }}>{edu.degree}{edu.field ? ` · ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</div>
          </div>
        ))}
      </div>
    ) : null,

    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9CA3AF", marginBottom: 8 }}>Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {skills.map((sk) => (
            <span key={sk.id} style={{ fontSize: 10, color: "#374151", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 3, padding: "2px 8px" }}>{sk.name}</span>
          ))}
        </div>
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9CA3AF", marginBottom: 8 }}>Certifications</div>
        {certifications.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ fontSize: 10, color: "#111827", fontWeight: 600 }}>{c.name}<span style={{ fontWeight: 400, color: "#6B7280" }}>{c.issuer ? ` · ${c.issuer}` : ""}</span></div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{formatDate(c.date)}</div>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9CA3AF", marginBottom: 8 }}>Projects</div>
        {projects.map((proj) => (
          <div key={proj.id} style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
            {proj.url && <span style={{ fontSize: 9, color, marginLeft: 8 }}>{proj.url}</span>}
            {proj.description && <p style={{ fontSize: 10, color: "#4B5563", margin: "3px 0 0 0", lineHeight: 1.6 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9CA3AF", marginBottom: 8 }}>Languages</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {languages.map((l) => (
            <span key={l.id} style={{ fontSize: 10, color: "#374151" }}><b>{l.name}</b>{l.level ? ` · ${l.level}` : ""}</span>
          ))}
        </div>
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#fff", width: "100%", minHeight: "100%", padding: "40px 44px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#111827", margin: "0 0 2px 0", letterSpacing: "-0.02em" }}>{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <div style={{ fontSize: 13, color, fontWeight: 500, marginBottom: 10 }}>{p.jobTitle}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 9, color: "#9CA3AF" }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span style={{ color }}>{p.linkedin}</span>}
          {p.website && <span style={{ color }}>{p.website}</span>}
        </div>
        <div style={{ height: 1, background: "#F3F4F6", marginTop: 16 }} />
      </div>

      {sectionOrder.map((key) => sectionMap[key] ?? renderCustomSection(data, key, color, fontFamily))}
    </div>
  );
}
