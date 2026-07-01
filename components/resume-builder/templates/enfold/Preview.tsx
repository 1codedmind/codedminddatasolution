import type { ResumeData } from "@/lib/resume/types";
import { renderCustomSection } from "@/lib/resume/customSectionHelper";
import { formatDate as fmt } from "@/lib/resume/dateUtils";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function EnfoldPreview({ data, color, fontFamily }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const ff = fontFamily || "'Helvetica Neue', Helvetica, Arial, sans-serif";

  // Sidebar sections (contact + skills in sidebar, rest in main)
  const sideSet = new Set(["skills", "certifications", "languages"]);
  const mainOrder = sectionOrder.filter(k => !sideSet.has(k));
  const sideOrder = sectionOrder.filter(k => sideSet.has(k));

  // Make summary appear first in main
  const orderedMain = [
    ...mainOrder.filter(k => k === "summary"),
    ...mainOrder.filter(k => k !== "summary"),
  ];

  function SideLabel({ label }: { label: string }) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.6)" }}>{label}</div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.15)", marginTop: 4 }} />
      </div>
    );
  }

  function MainLabel({ label }: { label: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#111827" }}>{label}</span>
        <div style={{ flex: 1, height: 2, background: color, opacity: 0.15, borderRadius: 1 }} />
      </div>
    );
  }

  const sideMap: Record<string, React.ReactNode> = {
    skills: skills.length > 0 ? (
      <div key="skills" style={{ marginBottom: 20 }}>
        <SideLabel label="Skills" />
        {skills.map(sk => (
          <div key={sk.id} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>{sk.name}</div>
            <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <div style={{ width: `${(sk.level / 5) * 100}%`, height: "100%", background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    ) : null,

    certifications: certifications.length > 0 ? (
      <div key="certifications" style={{ marginBottom: 20 }}>
        <SideLabel label="Certifications" />
        {certifications.map(c => (
          <div key={c.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>{c.name}</div>
            <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>{c.issuer}{c.date ? ` · ${fmt(c.date)}` : ""}</div>
          </div>
        ))}
      </div>
    ) : null,

    languages: languages.length > 0 ? (
      <div key="languages" style={{ marginBottom: 20 }}>
        <SideLabel label="Languages" />
        {languages.map(l => (
          <div key={l.id} style={{ marginBottom: 5, fontSize: 8.5 }}>
            <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{l.name}</span>
            {l.level && <span style={{ color: "rgba(255,255,255,0.5)" }}> · {l.level}</span>}
          </div>
        ))}
      </div>
    ) : null,
  };

  const mainMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <div key="summary" style={{ marginBottom: 18, padding: "12px 14px", background: "#F9FAFB", borderRadius: 6, borderLeft: `3px solid ${color}` }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color, marginBottom: 5 }}>Profile</div>
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
                <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.title}</span>
                <span style={{ fontSize: 9.5, color: "#6B7280", marginLeft: 7 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</span>
              </div>
              <span style={{ fontSize: 8.5, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
                {fmt(exp.startDate)} – {exp.current ? "Present" : fmt(exp.endDate)}
              </span>
            </div>
            {exp.bullets.filter(Boolean).map((b, i) => (
              <div key={i} style={{ display: "flex", marginTop: 4 }}>
                <span style={{ color, marginRight: 6, fontSize: 10, lineHeight: "16px", flexShrink: 0, fontWeight: 700 }}>▸</span>
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
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 9.5, color: "#6B7280" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
            </div>
            <span style={{ fontSize: 8.5, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>
              {fmt(edu.startDate)} – {fmt(edu.endDate)}
            </span>
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
            {proj.description && <p style={{ fontSize: 9.5, color: "#4B5563", margin: "3px 0 0", lineHeight: 1.55 }}>{proj.description}</p>}
          </div>
        ))}
      </div>
    ) : null,
  };

  return (
    <div style={{ fontFamily: ff, background: "#fff", width: "100%", minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Header bar */}
      <div style={{ background: color, padding: "24px 28px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 4, letterSpacing: "0.03em" }}>{p.jobTitle}</div>}
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left sidebar */}
        <div style={{ width: 190, flexShrink: 0, background: `${color}e6`, padding: "22px 18px", display: "flex", flexDirection: "column" }}>
          {/* Contact */}
          <div style={{ marginBottom: 20 }}>
            <SideLabel label="Contact" />
            {p.email && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginBottom: 4, wordBreak: "break-all" as const }}>{p.email}</div>}
            {p.phone && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{p.phone}</div>}
            {p.location && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{p.location}</div>}
            {p.linkedin && <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.7)", wordBreak: "break-all" as const }}>{p.linkedin}</div>}
          </div>
          {sideOrder.map(k => sideMap[k] ?? null)}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "22px 26px" }}>
          {orderedMain.map(k => mainMap[k] ?? renderCustomSection(data, k, color, fontFamily))}
        </div>
      </div>
    </div>
  );
}
