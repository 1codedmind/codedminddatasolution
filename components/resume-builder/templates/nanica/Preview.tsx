import type { ResumeData } from "@/lib/resume/types";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

function fmt(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m,10)-1] + " " + y;
}

export default function NanicaPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const ff = fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";

  function SectionHead({ label }: { label: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#111827", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>
    );
  }

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 20 }}>
        <SectionHead label="Profile" />
        <p style={{ fontSize: 10, lineHeight: 1.75, color: "#4B5563", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 20 }}>
        <SectionHead label="Experience" />
        {experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.title}</span>
                <span style={{ fontSize: 9.5, color, fontWeight: 600, marginLeft: 8 }}>{exp.company}</span>
                {exp.location && <span style={{ fontSize: 9, color: "#9CA3AF" }}> · {exp.location}</span>}
              </div>
              <span style={{ fontSize: 9, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
                {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
              </span>
            </div>
            {exp.bullets.filter(Boolean).map((b, i) => (
              <div key={i} style={{ display: "flex", marginTop: 4 }}>
                <span style={{ color, marginRight: 7, fontSize: 12, lineHeight: "16px", flexShrink: 0, fontWeight: 700 }}>·</span>
                <span style={{ fontSize: 9.5, color: "#4B5563", lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 20 }}>
        <SectionHead label="Education" />
        {education.map(edu => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 9.5, color: "#6B7280" }}>
                {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                {edu.gpa ? <span style={{ color: "#9CA3AF" }}> · GPA {edu.gpa}</span> : null}
              </div>
            </div>
            <span style={{ fontSize: 9, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
              {fmt(edu.startDate)} – {fmt(edu.endDate)}
            </span>
          </div>
        ))}
      </div>
    ) : null,

    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 20 }}>
        <SectionHead label="Skills" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 10px" }}>
          {skills.map((sk, i) => (
            <span key={sk.id} style={{ fontSize: 9.5, color: "#374151" }}>
              {sk.name}{i < skills.length - 1 && <span style={{ color: "#D1D5DB", marginLeft: 10 }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 20 }}>
        <SectionHead label="Certifications" />
        {certifications.map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>{c.name}</span>
              {c.issuer && <span style={{ fontSize: 9.5, color: "#6B7280" }}> · {c.issuer}</span>}
            </div>
            {c.date && <span style={{ fontSize: 9, color: "#9CA3AF" }}>{fmt(c.date)}</span>}
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 20 }}>
        <SectionHead label="Projects" />
        {projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
              {proj.url && <span style={{ fontSize: 8.5, color }}>{proj.url}</span>}
            </div>
            {proj.description && <p style={{ fontSize: 9.5, color: "#4B5563", margin: "3px 0 0", lineHeight: 1.6 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 20 }}>
        <SectionHead label="Languages" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
          {languages.map(l => (
            <div key={l.id} style={{ fontSize: 9.5, color: "#374151" }}>
              <span style={{ fontWeight: 700 }}>{l.name}</span>
              {l.level && <span style={{ color: "#9CA3AF" }}> · {l.level}</span>}
            </div>
          ))}
        </div>
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: ff, background: "#fff", width: "100%", minHeight: "100%", padding: "36px 44px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.15 }}>{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4, letterSpacing: "0.02em" }}>{p.jobTitle}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", marginTop: 8, fontSize: 9, color: "#6B7280", alignItems: "center" }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <><span style={{ color: "#D1D5DB" }}>|</span><span>{p.phone}</span></>}
          {p.location && <><span style={{ color: "#D1D5DB" }}>|</span><span>{p.location}</span></>}
          {p.linkedin && <><span style={{ color: "#D1D5DB" }}>|</span><span style={{ color }}>{p.linkedin}</span></>}
        </div>
        <div style={{ height: 3, background: color, marginTop: 12, borderRadius: 1 }} />
      </div>
      {sectionOrder.map(k => sectionMap[k] ?? null)}
    </div>
  );
}
