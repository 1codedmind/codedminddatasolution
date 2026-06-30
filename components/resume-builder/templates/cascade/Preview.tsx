import type { ResumeData } from "@/lib/resume/types";
import { renderCustomSection } from "@/lib/resume/customSectionHelper";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

function fmt(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m,10)-1] + " " + y;
}

export default function CascadePreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const ff = fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";

  // Sidebar sections
  const rightSections = new Set(["skills", "certifications", "languages"]);
  const mainOrder = sectionOrder.filter(k => !rightSections.has(k));
  const sideOrder = sectionOrder.filter(k => rightSections.has(k));

  function SideLabel({ label }: { label: string }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{label}</div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.2)" }} />
      </div>
    );
  }

  function MainLabel({ label }: { label: string }) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color }}>{label}</div>
        <div style={{ height: 1.5, background: color, marginTop: 3, opacity: 0.25 }} />
      </div>
    );
  }

  const sideMap: Record<string, React.ReactNode> = {
    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 18 }}>
        <SideLabel label="Skills" />
        {skills.map(sk => (
          <div key={sk.id} style={{ marginBottom: 7 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>{sk.name}</div>
            <div style={{ display: "flex", gap: 3 }}>
              {[1,2,3,4,5].map(n => (
                <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= sk.level ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 18 }}>
        <SideLabel label="Certifications" />
        {certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>{c.name}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{c.issuer}{c.date ? ` · ${fmt(c.date)}` : ""}</div>
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 18 }}>
        <SideLabel label="Languages" />
        {languages.map(l => (
          <div key={l.id} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>{l.name}</div>
            {l.level && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{l.level}</div>}
          </div>
        ))}
      </div>
    ) : null,
  };

  const mainMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 18 }}>
        <MainLabel label="Summary" />
        <p style={{ fontSize: 9.5, lineHeight: 1.7, color: "#374151", margin: 0 }}>{summary}</p>
      </div>
    ) : null,

    experience: experience.length > 0 ? (
      <div key="experience" style={{ marginBottom: 18 }}>
        <MainLabel label="Experience" />
        {experience.map(exp => (
          <div key={exp.id} style={{ marginBottom: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.title}</div>
                <div style={{ fontSize: 9.5, color: "#6B7280", marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              </div>
              <div style={{ fontSize: 8.5, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
                {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
              </div>
            </div>
            {exp.bullets.filter(Boolean).map((b, i) => (
              <div key={i} style={{ display: "flex", marginTop: 4, paddingLeft: 2 }}>
                <span style={{ color, marginRight: 6, fontSize: 9, lineHeight: "16px", flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 9.5, color: "#4B5563", lineHeight: 1.55 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : null,

    education: education.length > 0 ? (
      <div key="education" style={{ marginBottom: 18 }}>
        <MainLabel label="Education" />
        {education.map(edu => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 9.5, color: "#6B7280", marginTop: 1 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
            </div>
            <div style={{ fontSize: 8.5, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
              {fmt(edu.startDate)} – {fmt(edu.endDate)}
            </div>
          </div>
        ))}
      </div>
    ) : null,

    projects: projects.length > 0 ? (
      <div key="projects" style={{ marginBottom: 18 }}>
        <MainLabel label="Projects" />
        {projects.map(proj => (
          <div key={proj.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
              {proj.url && <span style={{ fontSize: 8.5, color }}>{proj.url}</span>}
            </div>
            {proj.description && <p style={{ fontSize: 9.5, color: "#4B5563", margin: "3px 0 0" }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: ff, background: "#fff", width: "100%", minHeight: "100%", display: "flex", boxSizing: "border-box" }}>
      {/* Left sidebar */}
      <div style={{ width: 210, flexShrink: 0, background: color, padding: "32px 20px", display: "flex", flexDirection: "column" }}>
        {/* Name / title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>{p.fullName || "Your Name"}</h1>
          {p.jobTitle && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 5, letterSpacing: "0.03em" }}>{p.jobTitle}</div>}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: 22 }}>
          <SideLabel label="Contact" />
          {p.email && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginBottom: 4, wordBreak: "break-all" as const }}>{p.email}</div>}
          {p.phone && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{p.phone}</div>}
          {p.location && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{p.location}</div>}
          {p.linkedin && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.7)", marginBottom: 4, wordBreak: "break-all" as const }}>{p.linkedin}</div>}
        </div>

        {/* Sidebar dynamic sections */}
        {sideOrder.map(k => sideMap[k] ?? null)}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "32px 28px", overflow: "hidden" }}>
        {mainOrder.map(k => mainMap[k] ?? renderCustomSection(data, k, color, fontFamily))}
      </div>
    </div>
  );
}
