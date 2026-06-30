import type { ResumeData } from "@/lib/resume/types";

interface Props {
  data: ResumeData;
  color: string;
}

function formatDate(d: string): string {
  if (!d) return "";
  const [year, month] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function MainSection({ label, children, color }: { label: string; children: React.ReactNode; color: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color }}>{label}</div>
        <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
      </div>
      {children}
    </div>
  );
}

export default function ExecutivePreview({ data, color }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const mainSections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <MainSection key="summary" label="Profile" color={color}>
        <p style={{ fontSize: 10, lineHeight: 1.7, color: "#374151", margin: 0 }}>{summary}</p>
      </MainSection>
    ) : null,

    experience: experience.length > 0 ? (
      <MainSection key="experience" label="Experience" color={color}>
        {experience.map((exp) => (
          <div key={exp.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{exp.title}</div>
              <div style={{ fontSize: 9, color: "#9CA3AF" }}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</div>
            </div>
            <div style={{ fontSize: 10, color, fontWeight: 500, marginBottom: 4 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 14 }}>
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} style={{ fontSize: 10, color: "#374151", lineHeight: 1.6, marginBottom: 2 }}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </MainSection>
    ) : null,

    education: education.length > 0 ? (
      <MainSection key="education" label="Education" color={color}>
        {education.map((edu) => (
          <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{edu.institution}</div>
              <div style={{ fontSize: 10, color: "#374151" }}>{edu.degree}{edu.field ? ` · ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</div>
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF" }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</div>
          </div>
        ))}
      </MainSection>
    ) : null,

    projects: projects.length > 0 ? (
      <MainSection key="projects" label="Projects" color={color}>
        {projects.map((proj) => (
          <div key={proj.id} style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{proj.name}</span>
            {proj.description && <p style={{ fontSize: 10, color: "#374151", margin: "3px 0 0 0" }}>{proj.description}</p>}
          </div>
        ))}
      </MainSection>
    ) : null,

    certifications: null,
    skills: null,
    languages: null,
  };

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#fff", width: "100%", minHeight: "100%", display: "flex", boxSizing: "border-box" }}>
      {/* Sidebar */}
      <div style={{ width: "34%", background: color, padding: "32px 20px", minHeight: "100%", boxSizing: "border-box" }}>
        {/* Photo placeholder */}
        {p.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt={p.fullName} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: "3px solid rgba(255,255,255,0.3)" }} />
        ) : (
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.2)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 24, color: "rgba(255,255,255,0.6)" }}>👤</span>
          </div>
        )}
        <h1 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 3px 0", lineHeight: 1.2 }}>{p.fullName || "Your Name"}</h1>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 500, marginBottom: 20 }}>{p.jobTitle}</div>

        {(p.email || p.phone || p.location || p.linkedin || p.website) && (
          <SideSection label="Contact">
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", lineHeight: 2 }}>
              {p.email && <div>✉ {p.email}</div>}
              {p.phone && <div>📞 {p.phone}</div>}
              {p.location && <div>📍 {p.location}</div>}
              {p.linkedin && <div>🔗 {p.linkedin}</div>}
              {p.website && <div>🌐 {p.website}</div>}
            </div>
          </SideSection>
        )}

        {skills.length > 0 && (
          <SideSection label="Skills">
            {skills.map((sk) => (
              <div key={sk.id} style={{ marginBottom: 5 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>{sk.name}</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${(sk.level / 5) * 100}%`, background: "rgba(255,255,255,0.8)", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </SideSection>
        )}

        {languages.length > 0 && (
          <SideSection label="Languages">
            {languages.map((l) => (
              <div key={l.id} style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
                <b>{l.name}</b>{l.level ? ` · ${l.level}` : ""}
              </div>
            ))}
          </SideSection>
        )}

        {certifications.length > 0 && (
          <SideSection label="Certifications">
            {certifications.map((c) => (
              <div key={c.id} style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", marginBottom: 5, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div>{c.issuer}</div>
              </div>
            ))}
          </SideSection>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "32px 28px", boxSizing: "border-box" }}>
        {sectionOrder.map((key) => mainSections[key] ?? null)}
      </div>
    </div>
  );
}
