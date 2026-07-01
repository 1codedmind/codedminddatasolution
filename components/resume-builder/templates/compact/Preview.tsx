import type { ResumeData } from "@/lib/resume/types";
import { renderCustomSection } from "@/lib/resume/customSectionHelper";
import { formatDate as fmt } from "@/lib/resume/dateUtils";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function CompactPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const ff = fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const right: string[] = [];
  const left: string[] = [];
  const rightSet = new Set(["skills", "certifications", "languages"]);
  for (const k of sectionOrder) {
    if (rightSet.has(k)) right.push(k);
    else left.push(k);
  }

  function renderLeft(key: string) {
    if (key === "summary" && summary) return (
      <div key="summary" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 3 }}>Summary</div>
        <div style={{ height: 1.5, background: color, marginBottom: 6 }} />
        <p style={{ fontSize: 9, lineHeight: 1.6, color: "#374151", margin: 0 }}>{summary}</p>
      </div>
    );
    if (key === "experience" && experience.length > 0) return (
      <div key="experience" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 3 }}>Experience</div>
        <div style={{ height: 1.5, background: color, marginBottom: 6 }} />
        {experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>{exp.title}</span>
                <span style={{ fontSize: 9, color: "#6B7280", marginLeft: 4 }}>— {exp.company}{exp.location ? `, ${exp.location}` : ""}</span>
              </div>
              <span style={{ fontSize: 8, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 6 }}>
                {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
              </span>
            </div>
            {exp.bullets.filter(Boolean).map((b,i) => (
              <div key={i} style={{ display: "flex", marginTop: 2 }}>
                <span style={{ fontSize: 8, color: "#9CA3AF", marginRight: 4 }}>•</span>
                <span style={{ fontSize: 9, color: "#374151", lineHeight: 1.45 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
    if (key === "education" && education.length > 0) return (
      <div key="education" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 3 }}>Education</div>
        <div style={{ height: 1.5, background: color, marginBottom: 6 }} />
        {education.map(edu => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 9, color: "#4B5563" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
            </div>
            <div style={{ fontSize: 8, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 6 }}>
              {fmt(edu.startDate)} – {fmt(edu.endDate)}
            </div>
          </div>
        ))}
      </div>
    );
    if (key === "projects" && projects.length > 0) return (
      <div key="projects" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 3 }}>Projects</div>
        <div style={{ height: 1.5, background: color, marginBottom: 6 }} />
        {projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: 7 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
            {proj.url && <span style={{ fontSize: 8, color, marginLeft: 5 }}>{proj.url}</span>}
            {proj.description && <p style={{ fontSize: 9, color: "#374151", margin: "2px 0 0 0", lineHeight: 1.45 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    );
    return renderCustomSection(data, key, color, fontFamily) ?? null;
  }

  function renderRight(key: string) {
    if (key === "skills" && skills.length > 0) return (
      <div key="skills" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 3 }}>Skills</div>
        <div style={{ height: 1.5, background: color, marginBottom: 6 }} />
        {skills.map(sk => (
          <div key={sk.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: "#374151" }}>{sk.name}</span>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ width: 5, height: 5, borderRadius: "50%", background: n <= sk.level ? color : "#E5E7EB" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
    if (key === "certifications" && certifications.length > 0) return (
      <div key="certifications" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 3 }}>Certifications</div>
        <div style={{ height: 1.5, background: color, marginBottom: 6 }} />
        {certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 5 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#111827" }}>{c.name}</div>
            <div style={{ fontSize: 8, color: "#6B7280" }}>{c.issuer}{c.date ? ` · ${fmt(c.date)}` : ""}</div>
          </div>
        ))}
      </div>
    );
    if (key === "languages" && languages.length > 0) return (
      <div key="languages" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 3 }}>Languages</div>
        <div style={{ height: 1.5, background: color, marginBottom: 6 }} />
        {languages.map(l => (
          <div key={l.id} style={{ fontSize: 9, color: "#374151", marginBottom: 3 }}>
            <span style={{ fontWeight: 600 }}>{l.name}</span>{l.level && <span style={{ color: "#6B7280" }}> · {l.level}</span>}
          </div>
        ))}
      </div>
    );
    return null;
  }

  return (
    <div style={{ fontFamily: ff, background: "#fff", width: "100%", minHeight: "100%", padding: "28px 32px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `2px solid ${color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.1 }}>{p.fullName || "Your Name"}</h1>
            <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>{p.jobTitle || "Job Title"}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 8, color: "#6B7280", lineHeight: 1.7 }}>
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.location && <div>{p.location}</div>}
            {p.linkedin && <div style={{ color }}>{p.linkedin}</div>}
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* Left — main content */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          {left.map(k => renderLeft(k))}
        </div>
        {/* Right — sidebar */}
        <div style={{ width: 180, flexShrink: 0 }}>
          {right.map(k => renderRight(k))}
        </div>
      </div>
    </div>
  );
}
