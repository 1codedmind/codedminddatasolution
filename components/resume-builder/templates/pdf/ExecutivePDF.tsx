import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, renderPDFCustomSection } from "./shared";

interface Props { data: ResumeData; color: string; }

export default function ExecutivePDF({ data, color }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, languages, projects, sectionOrder } = data;
  const fonts = { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique", boldItalic: "Helvetica-BoldOblique" };

  const sidebarBg = color;

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", fontFamily: "Helvetica", fontSize: 10, flexDirection: "row" },
    sidebar: { width: "34%", backgroundColor: sidebarBg, paddingTop: 32, paddingBottom: 32, paddingLeft: 18, paddingRight: 18 },
    main: { flex: 1, paddingTop: 32, paddingBottom: 32, paddingLeft: 24, paddingRight: 24 },
    sideLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", marginBottom: 7 },
    sideName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#fff", marginBottom: 2, lineHeight: 1.2 },
    sideJob: { fontSize: 9, color: "rgba(255,255,255,0.75)", marginBottom: 16 },
    sideText: { fontSize: 8, color: "rgba(255,255,255,0.85)", marginBottom: 3, lineHeight: 1.5 },
    sideSection: { marginBottom: 16 },
    skillBar: { height: 3, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, marginBottom: 6 },
    skillFill: { height: 3, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 2 },
    mainSection: { marginBottom: 14 },
    mainLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    mainLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, marginRight: 8 },
    mainDivider: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    boldText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
    bodyText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    dateText: { fontSize: 8, color: "#9CA3AF" },
  });

  const mainSections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={s.mainSection}>
        <View style={s.mainLabelRow}>
          <Text style={[s.mainLabel, { color }]}>Profile</Text>
          <View style={s.mainDivider} />
        </View>
        <Text style={s.bodyText}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <View key="experience" style={s.mainSection}>
        <View style={s.mainLabelRow}>
          <Text style={[s.mainLabel, { color }]}>Experience</Text>
          <View style={s.mainDivider} />
        </View>
        {experience.map((exp) => (
          <View key={exp.id} style={{ marginBottom: 10 }}>
            <View style={s.row}>
              <Text style={s.boldText}>{exp.title}</Text>
              <Text style={s.dateText}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <Text style={{ fontSize: 9, color, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
            <PDFBullets bullets={exp.bullets} color="#374151" />
          </View>
        ))}
      </View>
    ) : null,

    education: education.length > 0 ? (
      <View key="education" style={s.mainSection}>
        <View style={s.mainLabelRow}>
          <Text style={[s.mainLabel, { color }]}>Education</Text>
          <View style={s.mainDivider} />
        </View>
        {education.map((edu) => (
          <View key={edu.id} style={[s.row, { marginBottom: 6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.boldText}>{edu.institution}</Text>
              <Text style={{ fontSize: 9, color: "#374151" }}>{edu.degree}{edu.field ? ` · ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.dateText}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    projects: projects.length > 0 ? (
      <View key="projects" style={s.mainSection}>
        <View style={s.mainLabelRow}>
          <Text style={[s.mainLabel, { color }]}>Projects</Text>
          <View style={s.mainDivider} />
        </View>
        {projects.map((proj) => (
          <View key={proj.id} style={{ marginBottom: 8 }}>
            <Text style={s.boldText}>{proj.name}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
          </View>
        ))}
      </View>
    ) : null,

    certifications: null,
    skills: null,
    languages: null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <Text style={s.sideName}>{p.fullName || "Your Name"}</Text>
          <Text style={s.sideJob}>{p.jobTitle}</Text>

          {(p.email || p.phone || p.location) && (
            <View style={s.sideSection}>
              <Text style={s.sideLabel}>Contact</Text>
              {p.email ? <Text style={s.sideText}>{p.email}</Text> : null}
              {p.phone ? <Text style={s.sideText}>{p.phone}</Text> : null}
              {p.location ? <Text style={s.sideText}>{p.location}</Text> : null}
              {p.linkedin ? <Text style={s.sideText}>{p.linkedin}</Text> : null}
              {p.website ? <Text style={s.sideText}>{p.website}</Text> : null}
            </View>
          )}

          {skills.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideLabel}>Skills</Text>
              {skills.map((sk) => (
                <View key={sk.id} style={{ marginBottom: 5 }}>
                  <Text style={s.sideText}>{sk.name}</Text>
                  <View style={s.skillBar}><View style={[s.skillFill, { width: `${(sk.level / 5) * 100}%` }]} /></View>
                </View>
              ))}
            </View>
          )}

          {languages.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideLabel}>Languages</Text>
              {languages.map((l) => (
                <Text key={l.id} style={s.sideText}>{l.name}{l.level ? ` · ${l.level}` : ""}</Text>
              ))}
            </View>
          )}

          {certifications.length > 0 && (
            <View style={s.sideSection}>
              <Text style={s.sideLabel}>Certifications</Text>
              {certifications.map((c) => (
                <View key={c.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "rgba(255,255,255,0.9)" }}>{c.name}</Text>
                  <Text style={s.sideText}>{c.issuer}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={s.main}>
          {sectionOrder.map((key) => mainSections[key] ?? renderPDFCustomSection(data, key, color, fonts))}
        </View>
      </Page>
    </Document>
  );
}
