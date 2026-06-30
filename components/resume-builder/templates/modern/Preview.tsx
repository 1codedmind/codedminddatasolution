import type { ResumeData } from "@/lib/resume/types";

interface Props {
  data: ResumeData;
  color: string;
  fontFamily?: string;
}

function formatDate(d: string): string {
  if (!d) return "";
  const [year, month] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function SectionHeading({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color }}>
        {label}
      </div>
      <div style={{ height: 2, background: color, marginTop: 3, borderRadius: 1 }} />
    </div>
  );
}

export default function ModernPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 18 }}>
        <SectionHeading label="Professional Summary" color={color} />
        <p style={{ fontSize: 10, lineHeight: 1.6, color: "#374151", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 18 }}>
        <SectionHeading label="Work Experience" color={color} />
        {experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.title}</div>
                <div style={{ fontSize: 10, color: "#4B5563", fontStyle: "italic" }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              </div>
              <div style={{ fontSize: 9, color: "#6B7280", whiteSpace: "nowrap", marginLeft: 8 }}>
                {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
              </div>
            </div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: "4px 0 0 0", paddingLeft: 14 }}>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ fontSize: 10, color: "#374151", lineHeight: 1.5, marginBottom: 2 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 18 }}>
        <SectionHeading label="Education" color={color} />
        {education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
                <div style={{ fontSize: 10, color: "#4B5563" }}>
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                  {edu.gpa ? ` · GPA ${edu.gpa}` : ""}
                </div>
              </div>
              <div style={{ fontSize: 9, color: "#6B7280", whiteSpace: "nowrap", marginLeft: 8 }}>
                {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : null,

    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 18 }}>
        <SectionHeading label="Skills" color={color} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {skills.map((sk) => (
            <span key={sk.id} style={{ fontSize: 9, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 4, padding: "2px 7px", color: "#374151" }}>
              {sk.name}
            </span>
          ))}
        </div>
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 18 }}>
        <SectionHeading label="Certifications" color={color} />
        {certifications.map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#111827" }}>{c.name}</div>
              <div style={{ fontSize: 9, color: "#6B7280" }}>{c.issuer}</div>
            </div>
            <div style={{ fontSize: 9, color: "#6B7280" }}>{formatDate(c.date)}</div>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 18 }}>
        <SectionHeading label="Projects" color={color} />
        {projects.map((proj) => (
          <div key={proj.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
              {proj.url && <span style={{ fontSize: 9, color, textDecoration: "underline" }}>{proj.url}</span>}
            </div>
            {proj.description && <p style={{ fontSize: 10, color: "#374151", margin: "2px 0 0 0", lineHeight: 1.5 }}>{proj.description}</p>}
            {proj.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: "3px 0 0 0", paddingLeft: 14 }}>
                {proj.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 18 }}>
        <SectionHeading label="Languages" color={color} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {languages.map((l) => (
            <div key={l.id} style={{ fontSize: 10, color: "#374151" }}>
              <span style={{ fontWeight: 600 }}>{l.name}</span>
              {l.level && <span style={{ color: "#6B7280" }}> · {l.level}</span>}
            </div>
          ))}
        </div>
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#fff", width: "100%", minHeight: "100%", padding: "32px 36px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: `3px solid ${color}` }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.1 }}>{p.fullName || "Your Name"}</h1>
          <div style={{ fontSize: 13, color, fontWeight: 600, marginTop: 4 }}>{p.jobTitle || "Job Title"}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 9, color: "#6B7280", lineHeight: 1.7 }}>
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.linkedin && <div style={{ color }}>{p.linkedin}</div>}
          {p.website && <div style={{ color }}>{p.website}</div>}
        </div>
      </div>

      {/* Sections in order */}
      {sectionOrder.map((key) => sectionMap[key] ?? null)}
    </div>
  );
}
