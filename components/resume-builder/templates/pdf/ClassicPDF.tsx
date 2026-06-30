import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, renderPDFCustomSection } from "./shared";

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", paddingTop: 36, paddingBottom: 36, paddingLeft: 40, paddingRight: 40, fontFamily: "Times-Roman", fontSize: 10 },
  centerHeader: { alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: "#111827" },
  name: { fontSize: 24, fontFamily: "Times-Bold", color: "#111827", marginBottom: 3 },
  jobTitle: { fontSize: 11, fontFamily: "Times-Roman", marginBottom: 6 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  contactText: { fontSize: 8, color: "#6B7280" },
  section: { marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontFamily: "Times-Bold", textTransform: "uppercase", letterSpacing: 1.5, color: "#111827", borderBottomWidth: 1.5, borderBottomColor: "#111827", paddingBottom: 2, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  boldText: { fontSize: 10, fontFamily: "Times-Bold", color: "#111827" },
  italicText: { fontSize: 9, fontFamily: "Times-Italic", color: "#374151" },
  bodyText: { fontSize: 9, color: "#374151", lineHeight: 1.6 },
  dateText: { fontSize: 8, color: "#6B7280" },
});

interface Props { data: ResumeData; color: string; }

export default function ClassicPDF({ data, color }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;
  const fonts = { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic", boldItalic: "Times-BoldItalic" };

  const sections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={s.section}>
        <Text style={s.sectionLabel}>Summary</Text>
        <Text style={s.bodyText}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <View key="experience" style={s.section}>
        <Text style={s.sectionLabel}>Experience</Text>
        {experience.map((exp) => (
          <View key={exp.id} style={{ marginBottom: 10 }}>
            <View style={s.row}>
              <Text style={s.boldText}>{exp.company}</Text>
              <Text style={s.dateText}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <Text style={s.italicText}>{exp.title}{exp.location ? `, ${exp.location}` : ""}</Text>
            <PDFBullets bullets={exp.bullets} color="#374151" />
          </View>
        ))}
      </View>
    ) : null,

    education: education.length > 0 ? (
      <View key="education" style={s.section}>
        <Text style={s.sectionLabel}>Education</Text>
        {education.map((edu) => (
          <View key={edu.id} style={[s.row, { marginBottom: 6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.boldText}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</Text>
              <Text style={{ fontSize: 9, color: "#374151" }}>{edu.institution}{edu.location ? `, ${edu.location}` : ""}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.dateText}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    skills: skills.length > 0 ? (
      <View key="skills" style={s.section}>
        <Text style={s.sectionLabel}>Skills</Text>
        <Text style={s.bodyText}>{skills.map((sk) => sk.name).filter(Boolean).join(" · ")}</Text>
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={s.section}>
        <Text style={s.sectionLabel}>Certifications</Text>
        {certifications.map((c) => (
          <View key={c.id} style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 9, color: "#111827" }}>
              <Text style={{ fontFamily: "Times-Bold" }}>{c.name}</Text>
              {c.issuer ? ` · ${c.issuer}` : ""}
              {c.date ? ` · ${formatDate(c.date)}` : ""}
            </Text>
          </View>
        ))}
      </View>
    ) : null,

    projects: projects.length > 0 ? (
      <View key="projects" style={s.section}>
        <Text style={s.sectionLabel}>Projects</Text>
        {projects.map((proj) => (
          <View key={proj.id} style={{ marginBottom: 8 }}>
            <Text style={s.boldText}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
          </View>
        ))}
      </View>
    ) : null,

    languages: languages.length > 0 ? (
      <View key="languages" style={s.section}>
        <Text style={s.sectionLabel}>Languages</Text>
        <Text style={s.bodyText}>{languages.map((l) => `${l.name}${l.level ? ` (${l.level})` : ""}`).join(" · ")}</Text>
      </View>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.centerHeader}>
          <Text style={s.name}>{p.fullName || "Your Name"}</Text>
          {p.jobTitle ? <Text style={[s.jobTitle, { color }]}>{p.jobTitle}</Text> : null}
          <View style={s.contactRow}>
            {p.email ? <Text style={s.contactText}>{p.email}</Text> : null}
            {p.phone ? <Text style={s.contactText}>{p.phone}</Text> : null}
            {p.location ? <Text style={s.contactText}>{p.location}</Text> : null}
            {p.linkedin ? <Text style={[s.contactText, { color }]}>{p.linkedin}</Text> : null}
            {p.website ? <Text style={[s.contactText, { color }]}>{p.website}</Text> : null}
          </View>
        </View>
        {sectionOrder.map((key) => sections[key] ?? renderPDFCustomSection(data, key, color, fonts))}
      </Page>
    </Document>
  );
}
