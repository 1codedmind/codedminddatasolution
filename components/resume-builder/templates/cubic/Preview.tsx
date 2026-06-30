import type { ResumeData } from "@/lib/resume/types";
import { renderCustomSection } from "@/lib/resume/customSectionHelper";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

function fmt(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m,10)-1] + " " + y;
}

export default function CubicPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const ff = fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const rightSet = new Set(["skills", "certifications", "languages"]);
  const mainOrder = sectionOrder.filter(k => !rightSet.has(k));
  const rightOrder = sectionOrder.filter(k => rightSet.has(k));

  function MainLabel({ label }: { label: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, background: color, borderRadius: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#111827" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>
    );
  }

  function RightLabel({ label }: { label: string }) {
    return (
      <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color, marginBottom: 8 }}>{label}</div>
    );
  }

  const mainMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 16 }}>
        <MainLabel label="Summary" />
        <p style={{ fontSize: 9.5, lineHeight: 1.7, color: "#374151", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 16 }}>
        <MainLabel label="Experience" />
        {experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 12, paddingLeft: 6, borderLeft: `2px solid ${color}20` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#111827" }}>{exp.title}</span>
                <span style={{ fontSize: 9, color: "#6B7280", marginLeft: 6 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</span>
              </div>
              <span style={{ fontSize: 8.5, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
                {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
              </span>
            </div>
            {exp.bullets.filter(Boolean).map((b, i) => (
              <div key={i} style={{ display: "flex", marginTop: 3 }}>
                <span style={{ color, fontWeight: 700, marginRight: 5, fontSize: 10, lineHeight: "15px", flexShrink: 0 }}>–</span>
                <span style={{ fontSize: 9.5, color: "#4B5563", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 16 }}>
        <MainLabel label="Education" />
        {education.map(edu => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingLeft: 6, borderLeft: `2px solid ${color}20` }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 9, color: "#6B7280" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
            </div>
            <div style={{ fontSize: 8.5, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
              {fmt(edu.startDate)} – {fmt(edu.endDate)}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 16 }}>
        <MainLabel label="Projects" />
        {projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: 9, paddingLeft: 6, borderLeft: `2px solid ${color}20` }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#111827" }}>
              {proj.name}{proj.url && <span style={{ fontSize: 8.5, color, fontWeight: 400, marginLeft: 6 }}>{proj.url}</span>}
            </div>
            {proj.description && <p style={{ fontSize: 9.5, color: "#4B5563", margin: "2px 0 0", lineHeight: 1.5 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,
  };

  const rightMap: Record<string, React.ReactNode> = {
    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 16 }}>
        <RightLabel label="Skills" />
        {skills.map(sk => (
          <div key={sk.id} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: "#374151", marginBottom: 2 }}>{sk.name}</div>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= sk.level ? color : "#E5E7EB" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 16 }}>
        <RightLabel label="Certifications" />
        {certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 7 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#111827" }}>{c.name}</div>
            <div style={{ fontSize: 8, color: "#6B7280", marginTop: 1 }}>{c.issuer}{c.date ? ` · ${fmt(c.date)}` : ""}</div>
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 16 }}>
        <RightLabel label="Languages" />
        {languages.map(l => (
          <div key={l.id} style={{ marginBottom: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#374151" }}>{l.name}</span>
            {l.level && <span style={{ fontSize: 8.5, color: "#9CA3AF" }}> · {l.level}</span>}
          </div>
        ))}
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: ff, background: "#fff", width: "100%", minHeight: "100%", boxSizing: "border-box" }}>
      {/* Full-width header */}
      <div style={{ background: "#111827", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>{p.fullName || "Your Name"}</h1>
          {p.jobTitle && <div style={{ fontSize: 11, color, marginTop: 5, fontWeight: 600, letterSpacing: "0.05em" }}>{p.jobTitle}</div>}
        </div>
        <div style={{ textAlign: "right" as const }}>
          {p.email && <div style={{ fontSize: 8.5, color: "#9CA3AF", marginBottom: 2 }}>{p.email}</div>}
          {p.phone && <div style={{ fontSize: 8.5, color: "#9CA3AF", marginBottom: 2 }}>{p.phone}</div>}
          {p.location && <div style={{ fontSize: 8.5, color: "#9CA3AF", marginBottom: 2 }}>{p.location}</div>}
          {p.linkedin && <div style={{ fontSize: 8.5, color, marginBottom: 2 }}>{p.linkedin}</div>}
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: "flex" }}>
        {/* Main */}
        <div style={{ flex: 1, padding: "24px 28px" }}>
          {mainOrder.map(k => mainMap[k] ?? renderCustomSection(data, k, color, fontFamily))}
        </div>
        {/* Right sidebar */}
        <div style={{ width: 185, flexShrink: 0, background: "#F9FAFB", padding: "24px 18px", borderLeft: "1px solid #E5E7EB" }}>
          {rightOrder.map(k => rightMap[k] ?? null)}
        </div>
      </div>
    </div>
  );
}
