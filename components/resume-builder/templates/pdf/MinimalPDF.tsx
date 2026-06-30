import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets } from "./shared";

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", paddingTop: 40, paddingBottom: 40, paddingLeft: 44, paddingRight: 44, fontFamily: "Helvetica", fontSize: 10 },
  name: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 2, letterSpacing: -0.5 },
  jobTitle: { fontSize: 12, marginBottom: 8 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 2 },
  contactText: { fontSize: 8, color: "#9CA3AF" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginTop: 14, marginBottom: 20 },
  sectionLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 2, color: "#9CA3AF", marginBottom: 8 },
  section: { marginBottom: 18 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  boldText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
  mutedText: { fontSize: 9, color: "#6B7280" },
  bodyText: { fontSize: 9.5, color: "#374151", lineHeight: 1.65 },
  dateText: { fontSize: 8, color: "#9CA3AF" },
  pill: { fontSize: 9, color: "#374151", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 3, paddingTop: 2, paddingBottom: 2, paddingLeft: 7, paddingRight: 7, marginRight: 5, marginBottom: 4 },
});

interface Props { data: ResumeData; color: string; }

export default function MinimalPDF({ data, color }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

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
          <View key={exp.id} style={{ marginBottom: 12 }}>
            <View style={s.row}>
              <Text style={s.boldText}>{exp.title}</Text>
              <Text style={s.dateText}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <Text style={s.mutedText}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</Text>
            <PDFBullets bullets={exp.bullets} color="#4B5563" />
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
              <Text style={s.boldText}>{edu.institution}</Text>
              <Text style={s.mutedText}>{edu.degree}{edu.field ? ` · ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.dateText}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    skills: skills.length > 0 ? (
      <View key="skills" style={s.section}>
        <Text style={s.sectionLabel}>Skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {skills.map((sk) => <Text key={sk.id} style={s.pill}>{sk.name}</Text>)}
        </View>
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={s.section}>
        <Text style={s.sectionLabel}>Certifications</Text>
        {certifications.map((c) => (
          <View key={c.id} style={[s.row, { marginBottom: 4 }]}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" }}>{c.name}<Text style={{ fontFamily: "Helvetica", color: "#6B7280" }}>{c.issuer ? ` · ${c.issuer}` : ""}</Text></Text>
            <Text style={s.dateText}>{formatDate(c.date)}</Text>
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
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {languages.map((l) => (
            <Text key={l.id} style={{ fontSize: 9, color: "#374151" }}><Text style={{ fontFamily: "Helvetica-Bold" }}>{l.name}</Text>{l.level ? ` · ${l.level}` : ""}</Text>
          ))}
        </View>
      </View>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.name}>{p.fullName || "Your Name"}</Text>
          {p.jobTitle ? <Text style={[s.jobTitle, { color }]}>{p.jobTitle}</Text> : null}
          <View style={s.contactRow}>
            {p.email ? <Text style={s.contactText}>{p.email}</Text> : null}
            {p.phone ? <Text style={s.contactText}>{p.phone}</Text> : null}
            {p.location ? <Text style={s.contactText}>{p.location}</Text> : null}
            {p.linkedin ? <Text style={[s.contactText, { color }]}>{p.linkedin}</Text> : null}
            {p.website ? <Text style={[s.contactText, { color }]}>{p.website}</Text> : null}
          </View>
          <View style={s.divider} />
        </View>
        {sectionOrder.map((key) => sections[key] ?? null)}
      </Page>
    </Document>
  );
}
