import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets } from "./shared";

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", paddingTop: 32, paddingBottom: 32, paddingLeft: 36, paddingRight: 36, fontFamily: "Helvetica", fontSize: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, paddingBottom: 12 },
  headerLeft: { flex: 1 },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 2 },
  jobTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 0 },
  headerRight: { alignItems: "flex-end" },
  contactText: { fontSize: 8, color: "#6B7280", marginBottom: 2 },
  divider: { height: 2, marginBottom: 14, borderRadius: 1 },
  sectionLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  sectionDivider: { height: 1.5, marginBottom: 8, borderRadius: 1 },
  section: { marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  expTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" },
  expCompany: { fontSize: 9, color: "#4B5563", fontFamily: "Helvetica-Oblique" },
  dateText: { fontSize: 8, color: "#6B7280" },
  bodyText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  skillPill: { fontSize: 8, color: "#374151", backgroundColor: "#F3F4F6", borderRadius: 3, paddingTop: 2, paddingBottom: 2, paddingLeft: 6, paddingRight: 6, marginRight: 4, marginBottom: 4 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap" },
});

interface Props { data: ResumeData; color: string; }

function SectionHead({ label, color }: { label: string; color: string }) {
  return (
    <View style={s.section}>
      <Text style={[s.sectionLabel, { color }]}>{label}</Text>
      <View style={[s.sectionDivider, { backgroundColor: color }]} />
    </View>
  );
}

export default function ModernPDF({ data, color }: Props) {
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const sections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={{ marginBottom: 14 }}>
        <SectionHead label="Professional Summary" color={color} />
        <Text style={s.bodyText}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <View key="experience" style={{ marginBottom: 14 }}>
        <SectionHead label="Work Experience" color={color} />
        {experience.map((exp) => (
          <View key={exp.id} style={{ marginBottom: 10 }}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.expTitle}>{exp.title}</Text>
                <Text style={s.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
              </View>
              <Text style={s.dateText}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <PDFBullets bullets={exp.bullets} color="#374151" />
          </View>
        ))}
      </View>
    ) : null,

    education: education.length > 0 ? (
      <View key="education" style={{ marginBottom: 14 }}>
        <SectionHead label="Education" color={color} />
        {education.map((edu) => (
          <View key={edu.id} style={[s.row, { marginBottom: 6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" }}>{edu.institution}</Text>
              <Text style={{ fontSize: 9, color: "#4B5563" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.dateText}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    skills: skills.length > 0 ? (
      <View key="skills" style={{ marginBottom: 14 }}>
        <SectionHead label="Skills" color={color} />
        <View style={s.skillsRow}>
          {skills.map((sk) => <Text key={sk.id} style={s.skillPill}>{sk.name}</Text>)}
        </View>
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={{ marginBottom: 14 }}>
        <SectionHead label="Certifications" color={color} />
        {certifications.map((c) => (
          <View key={c.id} style={[s.row, { marginBottom: 4 }]}>
            <View><Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" }}>{c.name}</Text><Text style={{ fontSize: 8, color: "#6B7280" }}>{c.issuer}</Text></View>
            <Text style={s.dateText}>{formatDate(c.date)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    projects: projects.length > 0 ? (
      <View key="projects" style={{ marginBottom: 14 }}>
        <SectionHead label="Projects" color={color} />
        {projects.map((proj) => (
          <View key={proj.id} style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111827" }}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
            <PDFBullets bullets={proj.bullets} />
          </View>
        ))}
      </View>
    ) : null,

    languages: languages.length > 0 ? (
      <View key="languages" style={{ marginBottom: 14 }}>
        <SectionHead label="Languages" color={color} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {languages.map((l) => (
            <Text key={l.id} style={{ fontSize: 9, color: "#374151" }}>{l.name}{l.level ? ` · ${l.level}` : ""}</Text>
          ))}
        </View>
      </View>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={[s.header, { borderBottomWidth: 2.5, borderBottomColor: color }]}>
          <View style={s.headerLeft}>
            <Text style={s.name}>{p.fullName || "Your Name"}</Text>
            <Text style={[s.jobTitle, { color }]}>{p.jobTitle}</Text>
          </View>
          <View style={s.headerRight}>
            {p.email ? <Text style={s.contactText}>{p.email}</Text> : null}
            {p.phone ? <Text style={s.contactText}>{p.phone}</Text> : null}
            {p.location ? <Text style={s.contactText}>{p.location}</Text> : null}
            {p.linkedin ? <Text style={[s.contactText, { color }]}>{p.linkedin}</Text> : null}
            {p.website ? <Text style={[s.contactText, { color }]}>{p.website}</Text> : null}
          </View>
        </View>
        {sectionOrder.map((key) => sections[key] ?? null)}
      </Page>
    </Document>
  );
}
