import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, getPDFFonts } from "./shared";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function NanicaPDF({ data, color, fontFamily }: Props) {
  const f = getPDFFonts(fontFamily);
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", padding: "36 44", fontFamily: f.regular, fontSize: 10 },
    name: { fontSize: 24, fontFamily: f.bold, color: "#111827", marginBottom: 2 },
    jobTitle: { fontSize: 11, color, fontFamily: f.bold, marginBottom: 6 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
    contactText: { fontSize: 8, color: "#6B7280" },
    topRule: { height: 3, backgroundColor: color, borderRadius: 1, marginBottom: 18 },
    section: { marginBottom: 18 },
    sectionHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    sectionLabel: { fontSize: 10, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1, color: "#111827" },
    sectionLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    expTitle: { fontSize: 11, fontFamily: f.bold, color: "#111827" },
    expCompany: { fontSize: 9.5, color, fontFamily: f.bold },
    expDate: { fontSize: 8.5, color: "#9CA3AF" },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 },
    bodyText: { fontSize: 9.5, color: "#4B5563", lineHeight: 1.6 },
  });

  const sections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Profile</Text>
          <View style={s.sectionLine} />
        </View>
        <Text style={s.bodyText}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <View key="experience" style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Experience</Text>
          <View style={s.sectionLine} />
        </View>
        {experience.map(exp => (
          <View key={exp.id} style={{ marginBottom: 13 }}>
            <View style={s.expRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.expTitle}>{exp.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={s.expCompany}>{exp.company}</Text>
                  {exp.location ? <Text style={{ fontSize: 8.5, color: "#9CA3AF" }}>· {exp.location}</Text> : null}
                </View>
              </View>
              <Text style={s.expDate}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <PDFBullets bullets={exp.bullets} />
          </View>
        ))}
      </View>
    ) : null,

    education: education.length > 0 ? (
      <View key="education" style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Education</Text>
          <View style={s.sectionLine} />
        </View>
        {education.map(edu => (
          <View key={edu.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.expTitle}>{edu.institution}</Text>
              <Text style={{ fontSize: 9.5, color: "#6B7280" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.expDate}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    skills: skills.length > 0 ? (
      <View key="skills" style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Skills</Text>
          <View style={s.sectionLine} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {skills.map((sk, i) => (
            <View key={sk.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 9.5, color: "#374151" }}>{sk.name}</Text>
              {i < skills.length - 1 ? <Text style={{ color: "#D1D5DB", fontSize: 12 }}>·</Text> : null}
            </View>
          ))}
        </View>
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Certifications</Text>
          <View style={s.sectionLine} />
        </View>
        {certifications.map(c => (
          <View key={c.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <View>
              <Text style={{ fontSize: 10, fontFamily: f.bold, color: "#111827" }}>{c.name}</Text>
              {c.issuer ? <Text style={{ fontSize: 8.5, color: "#6B7280" }}>{c.issuer}</Text> : null}
            </View>
            {c.date ? <Text style={s.expDate}>{formatDate(c.date)}</Text> : null}
          </View>
        ))}
      </View>
    ) : null,

    projects: projects.length > 0 ? (
      <View key="projects" style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Projects</Text>
          <View style={s.sectionLine} />
        </View>
        {projects.map(proj => (
          <View key={proj.id} style={{ marginBottom: 9 }}>
            <Text style={{ fontSize: 11, fontFamily: f.bold, color: "#111827" }}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
          </View>
        ))}
      </View>
    ) : null,

    languages: languages.length > 0 ? (
      <View key="languages" style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Languages</Text>
          <View style={s.sectionLine} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {languages.map(l => (
            <Text key={l.id} style={{ fontSize: 9.5, color: "#374151" }}>
              <Text style={{ fontFamily: f.bold }}>{l.name}</Text>
              {l.level ? <Text style={{ color: "#9CA3AF" }}> · {l.level}</Text> : null}
            </Text>
          ))}
        </View>
      </View>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{p.fullName || "Your Name"}</Text>
        {p.jobTitle ? <Text style={s.jobTitle}>{p.jobTitle}</Text> : null}
        <View style={s.contactRow}>
          {p.email ? <Text style={s.contactText}>{p.email}</Text> : null}
          {p.phone ? <Text style={s.contactText}>| {p.phone}</Text> : null}
          {p.location ? <Text style={s.contactText}>| {p.location}</Text> : null}
          {p.linkedin ? <Text style={[s.contactText, { color }]}>| {p.linkedin}</Text> : null}
        </View>
        <View style={s.topRule} />
        {sectionOrder.map(k => sections[k] ?? null)}
      </Page>
    </Document>
  );
}
