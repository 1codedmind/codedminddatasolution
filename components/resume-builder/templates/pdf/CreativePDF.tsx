import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets } from "./shared";

interface Props { data: ResumeData; color: string; }

export default function CreativePDF({ data, color }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", fontFamily: "Helvetica", fontSize: 10 },
    header: { backgroundColor: color, paddingTop: 26, paddingBottom: 22, paddingLeft: 36, paddingRight: 36 },
    name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#fff", marginBottom: 2 },
    jobTitle: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 12 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    contactText: { fontSize: 8, color: "rgba(255,255,255,0.75)" },
    body: { paddingTop: 22, paddingBottom: 30, paddingLeft: 36, paddingRight: 36 },
    section: { marginBottom: 16 },
    sectionLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
    accent: { width: 4, height: 14, borderRadius: 2, marginRight: 7 },
    sectionLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, color: "#111827" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    boldText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
    bodyText: { fontSize: 9, color: "#374151", lineHeight: 1.6 },
    dateTag: { fontSize: 8, color: "#6B7280", backgroundColor: "#F3F4F6", borderRadius: 10, paddingTop: 2, paddingBottom: 2, paddingLeft: 7, paddingRight: 7 },
    pill: { fontSize: 8, fontFamily: "Helvetica-Bold", paddingTop: 3, paddingBottom: 3, paddingLeft: 9, paddingRight: 9, borderRadius: 10, marginRight: 4, marginBottom: 4 },
  });

  const sectionIcon = (label: string, color: string) => (
    <View style={s.sectionLabelRow}>
      <View style={[s.accent, { backgroundColor: color }]} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );

  const sections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={s.section}>
        {sectionIcon("About", color)}
        <Text style={s.bodyText}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <View key="experience" style={s.section}>
        {sectionIcon("Experience", color)}
        {experience.map((exp) => (
          <View key={exp.id} style={{ marginBottom: 10, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: "#F3F4F6" }}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.boldText}>{exp.title}</Text>
                <Text style={{ fontSize: 9, color, fontFamily: "Helvetica-Bold" }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
              </View>
              <Text style={s.dateTag}>{formatDate(exp.startDate)} – {exp.current ? "Now" : formatDate(exp.endDate)}</Text>
            </View>
            <PDFBullets bullets={exp.bullets} color="#374151" />
          </View>
        ))}
      </View>
    ) : null,

    education: education.length > 0 ? (
      <View key="education" style={s.section}>
        {sectionIcon("Education", color)}
        {education.map((edu) => (
          <View key={edu.id} style={[s.row, { marginBottom: 6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.boldText}>{edu.institution}</Text>
              <Text style={{ fontSize: 9, color: "#374151" }}>{edu.degree}{edu.field ? ` · ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={{ fontSize: 8, color: "#9CA3AF" }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    skills: skills.length > 0 ? (
      <View key="skills" style={s.section}>
        {sectionIcon("Skills", color)}
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {skills.map((sk) => (
            <Text key={sk.id} style={[s.pill, { color, backgroundColor: color + "20", borderWidth: 1, borderColor: color + "40" }]}>{sk.name}</Text>
          ))}
        </View>
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={s.section}>
        {sectionIcon("Certifications", color)}
        {certifications.map((c) => (
          <View key={c.id} style={[s.row, { marginBottom: 4 }]}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" }}>{c.name}<Text style={{ fontFamily: "Helvetica", color: "#6B7280" }}>{c.issuer ? ` · ${c.issuer}` : ""}</Text></Text>
            <Text style={{ fontSize: 8, color: "#9CA3AF" }}>{formatDate(c.date)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    projects: projects.length > 0 ? (
      <View key="projects" style={s.section}>
        {sectionIcon("Projects", color)}
        {projects.map((proj) => (
          <View key={proj.id} style={{ marginBottom: 8, padding: 8, backgroundColor: "#F9FAFB", borderRadius: 4 }}>
            <Text style={s.boldText}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
          </View>
        ))}
      </View>
    ) : null,

    languages: languages.length > 0 ? (
      <View key="languages" style={s.section}>
        {sectionIcon("Languages", color)}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {languages.map((l) => (
            <View key={l.id} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" }}>{l.name}</Text>
              <Text style={{ fontSize: 7, color: "#9CA3AF" }}>{l.level}</Text>
            </View>
          ))}
        </View>
      </View>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{p.fullName || "Your Name"}</Text>
          <Text style={s.jobTitle}>{p.jobTitle || "Job Title"}</Text>
          <View style={s.contactRow}>
            {p.email ? <Text style={s.contactText}>{p.email}</Text> : null}
            {p.phone ? <Text style={s.contactText}>{p.phone}</Text> : null}
            {p.location ? <Text style={s.contactText}>{p.location}</Text> : null}
            {p.linkedin ? <Text style={s.contactText}>{p.linkedin}</Text> : null}
            {p.website ? <Text style={s.contactText}>{p.website}</Text> : null}
          </View>
        </View>
        <View style={s.body}>
          {sectionOrder.map((key) => sections[key] ?? null)}
        </View>
      </Page>
    </Document>
  );
}
