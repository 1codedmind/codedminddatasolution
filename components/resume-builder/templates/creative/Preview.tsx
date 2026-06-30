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
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 4, height: 16, background: color, borderRadius: 2 }} />
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111827" }}>{label}</div>
    </div>
  );
}

export default function CreativePreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 18 }}>
        <SectionHeading label="About" color={color} />
        <p style={{ fontSize: 10, lineHeight: 1.75, color: "#374151", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 18 }}>
        <SectionHeading label="Experience" color={color} />
        {experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: 12, paddingLeft: 10, borderLeft: `2px solid #F3F4F6` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.title}</div>
                <div style={{ fontSize: 10, color, fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              </div>
              <div style={{ fontSize: 9, background: "#F3F4F6", borderRadius: 20, padding: "2px 8px", color: "#6B7280", whiteSpace: "nowrap" }}>
                {formatDate(exp.startDate)} – {exp.current ? "Now" : formatDate(exp.endDate)}
              </div>
            </div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: "5px 0 0 0", paddingLeft: 14 }}>
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
      <div key="education" style={{ marginBottom: 18 }}>
        <SectionHeading label="Education" color={color} />
        {education.map((edu) => (
          <div key={edu.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
                <div style={{ fontSize: 10, color: "#374151" }}>{edu.degree}{edu.field ? ` · ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
              </div>
              <div style={{ fontSize: 9, color: "#9CA3AF" }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</div>
            </div>
          </div>
        ))}
      </div>
    ) : null,

    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 18 }}>
        <SectionHeading label="Skills" color={color} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {skills.map((sk) => (
            <span key={sk.id} style={{ fontSize: 9, fontWeight: 600, background: color + "18", color, border: `1px solid ${color}40`, borderRadius: 20, padding: "3px 10px" }}>
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
            <div style={{ fontSize: 10, fontWeight: 600, color: "#111827" }}>{c.name}<span style={{ fontWeight: 400, color: "#6B7280" }}>{c.issuer ? ` · ${c.issuer}` : ""}</span></div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{formatDate(c.date)}</div>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 18 }}>
        <SectionHeading label="Projects" color={color} />
        {projects.map((proj) => (
          <div key={proj.id} style={{ marginBottom: 10, padding: "8px 10px", background: "#F9FAFB", borderRadius: 6, border: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
              {proj.url && <span style={{ fontSize: 9, color }}>{proj.url}</span>}
            </div>
            {proj.description && <p style={{ fontSize: 10, color: "#374151", margin: "3px 0 0 0", lineHeight: 1.6 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 18 }}>
        <SectionHeading label="Languages" color={color} />
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {languages.map((l) => (
            <div key={l.id} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>{l.name}</div>
              <div style={{ fontSize: 8, color: "#9CA3AF" }}>{l.level}</div>
            </div>
          ))}
        </div>
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#fff", width: "100%", minHeight: "100%", boxSizing: "border-box" }}>
      {/* Color-band header */}
      <div style={{ background: color, padding: "28px 36px 24px", marginBottom: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 3px 0", letterSpacing: "-0.01em" }}>{p.fullName || "Your Name"}</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 500, marginBottom: 14 }}>{p.jobTitle || "Job Title"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 9, color: "rgba(255,255,255,0.75)" }}>
          {p.email && <span>✉ {p.email}</span>}
          {p.phone && <span>📞 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.linkedin && <span>🔗 {p.linkedin}</span>}
          {p.website && <span>🌐 {p.website}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 36px" }}>
        {sectionOrder.map((key) => sectionMap[key] ?? null)}
      </div>
    </div>
  );
}
