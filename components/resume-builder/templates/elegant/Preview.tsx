import type { ResumeData } from "@/lib/resume/types";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

function fmt(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m,10)-1] + " " + y;
}

function SectionHead({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" as const, color }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB", maxWidth: 60 }} />
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
        <div style={{ flex: 1, height: 1, background: "#E5E7EB", maxWidth: 60 }} />
      </div>
    </div>
  );
}

export default function ElegantPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const ff = fontFamily || "Georgia, 'Times New Roman', serif";

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 22 }}>
        <SectionHead label="Profile" color={color} />
        <p style={{ fontSize: 10, lineHeight: 1.8, color: "#374151", margin: 0, textAlign: "center" as const, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 22 }}>
        <SectionHead label="Experience" color={color} />
        {experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #F3F4F6", paddingBottom: 4, marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#111827", fontStyle: "italic" as const }}>{exp.title}</span>
                <span style={{ fontSize: 10, color: "#6B7280", marginLeft: 6 }}>at {exp.company}{exp.location ? `, ${exp.location}` : ""}</span>
              </div>
              <div style={{ fontSize: 9, color: "#9CA3AF", whiteSpace: "nowrap" as const }}>
                {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
              </div>
            </div>
            {exp.bullets.filter(Boolean).map((b,i) => (
              <div key={i} style={{ display: "flex", marginBottom: 3 }}>
                <span style={{ color, marginRight: 6, fontSize: 10, lineHeight: "16px", flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 9.5, color: "#4B5563", lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 22 }}>
        <SectionHead label="Education" color={color} />
        {education.map(edu => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111827", fontStyle: "italic" as const }}>{edu.institution}</span>
              <span style={{ fontSize: 9.5, color: "#6B7280", marginLeft: 6 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · ${edu.gpa} GPA` : ""}</span>
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF", whiteSpace: "nowrap" as const }}>
              {fmt(edu.startDate)} – {fmt(edu.endDate)}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 22 }}>
        <SectionHead label="Expertise" color={color} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 12px" }}>
          {skills.map((sk, i) => (
            <span key={sk.id} style={{ fontSize: 9.5, color: "#374151" }}>
              {sk.name}{i < skills.length - 1 && <span style={{ color: "#D1D5DB", marginLeft: 12 }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 22 }}>
        <SectionHead label="Certifications" color={color} />
        {certifications.map(c => (
          <div key={c.id} style={{ textAlign: "center" as const, marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontStyle: "italic" as const, color: "#111827" }}>{c.name}</span>
            <span style={{ fontSize: 9, color: "#6B7280" }}>{c.issuer ? ` · ${c.issuer}` : ""}{c.date ? ` · ${fmt(c.date)}` : ""}</span>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 22 }}>
        <SectionHead label="Projects" color={color} />
        {projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontStyle: "italic" as const, color: "#111827" }}>{proj.name}</span>
              {proj.url && <span style={{ fontSize: 9, color }}>{proj.url}</span>}
            </div>
            {proj.description && <p style={{ fontSize: 9.5, color: "#4B5563", margin: "3px 0 0 0", lineHeight: 1.6 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 22 }}>
        <SectionHead label="Languages" color={color} />
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 20px" }}>
          {languages.map(l => (
            <div key={l.id} style={{ fontSize: 9.5, color: "#374151", textAlign: "center" as const }}>
              <span style={{ fontStyle: "italic" as const }}>{l.name}</span>{l.level && <span style={{ color: "#9CA3AF" }}> ({l.level})</span>}
            </div>
          ))}
        </div>
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: ff, background: "#fff", width: "100%", minHeight: "100%", padding: "40px 48px", boxSizing: "border-box" }}>
      {/* Centered header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "0.04em" }}>
          {p.fullName || "Your Name"}
        </h1>
        {p.jobTitle && (
          <div style={{ fontSize: 12, color, marginTop: 5, fontStyle: "italic" as const, letterSpacing: "0.02em" }}>{p.jobTitle}</div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "3px 10px", marginTop: 10, fontSize: 9, color: "#6B7280" }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <><span style={{ color: "#D1D5DB" }}>·</span><span>{p.phone}</span></>}
          {p.location && <><span style={{ color: "#D1D5DB" }}>·</span><span>{p.location}</span></>}
          {p.linkedin && <><span style={{ color: "#D1D5DB" }}>·</span><span style={{ color }}>{p.linkedin}</span></>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
          <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
          <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
        </div>
      </div>
      {sectionOrder.map(k => sectionMap[k] ?? null)}
    </div>
  );
}
