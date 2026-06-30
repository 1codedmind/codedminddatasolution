import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, getPDFFonts, renderPDFCustomSection } from "./shared";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function CascadePDF({ data, color, fontFamily }: Props) {
  const f = getPDFFonts(fontFamily);
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const rightSet = new Set(["skills", "certifications", "languages"]);
  const mainOrder = sectionOrder.filter(k => !rightSet.has(k));
  const sideOrder = sectionOrder.filter(k => rightSet.has(k));

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", fontFamily: f.regular, fontSize: 10, flexDirection: "row" },
    sidebar: { width: 175, backgroundColor: color, padding: "28 16", flexDirection: "column" },
    main: { flex: 1, padding: "28 24" },
    name: { fontSize: 17, fontFamily: f.bold, color: "#fff", marginBottom: 3 },
    jobTitle: { fontSize: 9, color: "rgba(255,255,255,0.75)", marginBottom: 18 },
    sideLabel: { fontSize: 7, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.4, color: "rgba(255,255,255,0.6)", marginBottom: 3 },
    sideDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 8 },
    sideContact: { fontSize: 8, color: "rgba(255,255,255,0.85)", marginBottom: 3 },
    sideSection: { marginBottom: 16 },
    skillName: { fontSize: 8.5, color: "rgba(255,255,255,0.9)", marginBottom: 2 },
    skillBarBg: { height: 3, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, marginBottom: 5 },
    mainLabel: { fontSize: 8.5, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.2, color, marginBottom: 3 },
    mainDivider: { height: 1, backgroundColor: color, opacity: 0.2, marginBottom: 10 },
    mainSection: { marginBottom: 14 },
    expTitle: { fontSize: 10, fontFamily: f.bold, color: "#111827" },
    expCompany: { fontSize: 8.5, color: "#6B7280", fontFamily: f.italic },
    expDate: { fontSize: 8, color: "#9CA3AF" },
    expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    bodyText: { fontSize: 9, color: "#4B5563", lineHeight: 1.5 },
  });

  function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <View style={s.sideSection}>
        <Text style={s.sideLabel}>{label}</Text>
        <View style={s.sideDivider} />
        {children}
      </View>
    );
  }

  function MainSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <View style={s.mainSection}>
        <Text style={s.mainLabel}>{label}</Text>
        <View style={s.mainDivider} />
        {children}
      </View>
    );
  }

  function renderSkillBar(level: number) {
    return (
      <View style={s.skillBarBg}>
        <View style={{ width: `${(level / 5) * 100}%`, height: 3, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
      </View>
    );
  }

  const sideMap: Record<string, React.ReactNode> = {
    skills: skills.length > 0 ? (
      <SideSection key="skills" label="Skills">
        {skills.map(sk => (
          <View key={sk.id} style={{ marginBottom: 6 }}>
            <Text style={s.skillName}>{sk.name}</Text>
            {renderSkillBar(sk.level)}
          </View>
        ))}
      </SideSection>
    ) : null,

    certifications: certifications.length > 0 ? (
      <SideSection key="certifications" label="Certifications">
        {certifications.map(c => (
          <View key={c.id} style={{ marginBottom: 7 }}>
            <Text style={{ fontSize: 8.5, fontFamily: f.bold, color: "rgba(255,255,255,0.95)" }}>{c.name}</Text>
            <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{c.issuer}{c.date ? ` · ${formatDate(c.date)}` : ""}</Text>
          </View>
        ))}
      </SideSection>
    ) : null,

    languages: languages.length > 0 ? (
      <SideSection key="languages" label="Languages">
        {languages.map(l => (
          <View key={l.id} style={{ marginBottom: 5 }}>
            <Text style={{ fontSize: 8.5, fontFamily: f.bold, color: "rgba(255,255,255,0.95)" }}>{l.name}</Text>
            {l.level ? <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)" }}>{l.level}</Text> : null}
          </View>
        ))}
      </SideSection>
    ) : null,
  };

  const mainMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <MainSection key="summary" label="Summary">
        <Text style={s.bodyText}>{summary}</Text>
      </MainSection>
    ) : null,

    experience: experience.length > 0 ? (
      <MainSection key="experience" label="Experience">
        {experience.map(exp => (
          <View key={exp.id} style={{ marginBottom: 11 }}>
            <View style={s.expRow}>
              <View>
                <Text style={s.expTitle}>{exp.title}</Text>
                <Text style={s.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
              </View>
              <Text style={s.expDate}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <PDFBullets bullets={exp.bullets} />
          </View>
        ))}
      </MainSection>
    ) : null,

    education: education.length > 0 ? (
      <MainSection key="education" label="Education">
        {education.map(edu => (
          <View key={edu.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 7 }}>
            <View>
              <Text style={s.expTitle}>{edu.institution}</Text>
              <Text style={{ fontSize: 8.5, color: "#6B7280" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.expDate}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </MainSection>
    ) : null,

    projects: projects.length > 0 ? (
      <MainSection key="projects" label="Projects">
        {projects.map(proj => (
          <View key={proj.id} style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 10, fontFamily: f.bold, color: "#111827" }}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
            <PDFBullets bullets={proj.bullets} />
          </View>
        ))}
      </MainSection>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <Text style={s.name}>{p.fullName || "Your Name"}</Text>
          {p.jobTitle ? <Text style={s.jobTitle}>{p.jobTitle}</Text> : null}
          <SideSection label="Contact">
            {p.email ? <Text style={s.sideContact}>{p.email}</Text> : null}
            {p.phone ? <Text style={s.sideContact}>{p.phone}</Text> : null}
            {p.location ? <Text style={s.sideContact}>{p.location}</Text> : null}
            {p.linkedin ? <Text style={[s.sideContact, { color: "rgba(255,255,255,0.7)" }]}>{p.linkedin}</Text> : null}
          </SideSection>
          {sideOrder.map(k => sideMap[k] ?? null)}
        </View>

        {/* Main */}
        <View style={s.main}>
          {mainOrder.map(k => mainMap[k] ?? renderPDFCustomSection(data, k, color, f))}
        </View>
      </Page>
    </Document>
  );
}
