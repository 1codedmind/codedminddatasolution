import type { ResumeData } from "@/lib/resume/types";
import { renderCustomSection } from "@/lib/resume/customSectionHelper";
import { formatDate as fmt } from "@/lib/resume/dateUtils";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

function SectionHead({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 4, height: 20, background: color, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#111827" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
    </div>
  );
}

export default function SharpPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const ff = fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 20 }}>
        <SectionHead label="Summary" color={color} />
        <p style={{ fontSize: 10, lineHeight: 1.65, color: "#374151", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 20 }}>
        <SectionHead label="Experience" color={color} />
        {experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 13, paddingLeft: 14, borderLeft: "2px solid #F3F4F6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#111827", textTransform: "uppercase" as const, letterSpacing: "0.03em" }}>{exp.title}</div>
                <div style={{ fontSize: 10, color: "#6B7280", marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              </div>
              <div style={{ fontSize: 9, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8, marginTop: 2 }}>
                {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
              </div>
            </div>
            {exp.bullets.filter(Boolean).map((b,i) => (
              <div key={i} style={{ display: "flex", marginTop: 4 }}>
                <span style={{ color, fontWeight: 800, marginRight: 5, fontSize: 9, lineHeight: "15px", flexShrink: 0 }}>›</span>
                <span style={{ fontSize: 9.5, color: "#374151", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 20 }}>
        <SectionHead label="Education" color={color} />
        {education.map(edu => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingLeft: 14, borderLeft: "2px solid #F3F4F6" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 9.5, color: "#6B7280" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
              {fmt(edu.startDate)} – {fmt(edu.endDate)}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 20 }}>
        <SectionHead label="Skills" color={color} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
          {skills.map(sk => (
            <div key={sk.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#111827" }}>{sk.name}</span>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ width: 6, height: 6, borderRadius: 1, background: n <= sk.level ? color : "#E5E7EB" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 20 }}>
        <SectionHead label="Certifications" color={color} />
        {certifications.map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>{c.name}</div>
              <div style={{ fontSize: 9, color: "#6B7280" }}>{c.issuer}</div>
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{fmt(c.date)}</div>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 20 }}>
        <SectionHead label="Projects" color={color} />
        {projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: 10, paddingLeft: 14, borderLeft: "2px solid #F3F4F6" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#111827" }}>{proj.name}{proj.url && <span style={{ fontSize: 9, color, fontWeight: 400, marginLeft: 6 }}>{proj.url}</span>}</div>
            {proj.description && <p style={{ fontSize: 9.5, color: "#374151", margin: "3px 0 0 0", lineHeight: 1.5 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 20 }}>
        <SectionHead label="Languages" color={color} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
          {languages.map(l => (
            <div key={l.id} style={{ fontSize: 10, color: "#374151" }}>
              <span style={{ fontWeight: 700 }}>{l.name}</span>{l.level && <span style={{ color: "#9CA3AF" }}> · {l.level}</span>}
            </div>
          ))}
        </div>
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: ff, background: "#fff", width: "100%", minHeight: "100%", padding: "36px 40px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `3px solid ${color}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: 0, lineHeight: 1, textTransform: "uppercase" as const, letterSpacing: "-0.02em" }}>
          {p.fullName || "Your Name"}
        </h1>
        <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 4, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
          {p.jobTitle || "Job Title"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", marginTop: 8, fontSize: 9, color: "#6B7280" }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span style={{ color }}>{p.linkedin}</span>}
          {p.website && <span style={{ color }}>{p.website}</span>}
        </div>
      </div>
      {sectionOrder.map(k => sectionMap[k] ?? renderCustomSection(data, k, color, fontFamily))}
    </div>
  );
}
