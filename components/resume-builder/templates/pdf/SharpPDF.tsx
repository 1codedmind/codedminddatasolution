import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, getPDFFonts } from "./shared";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function SharpPDF({ data, color, fontFamily }: Props) {
  const f = getPDFFonts(fontFamily);
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", paddingTop: 36, paddingBottom: 36, paddingLeft: 40, paddingRight: 40, fontFamily: f.regular, fontSize: 10 },
    name: { fontSize: 26, fontFamily: f.bold, color: "#111827", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
    jobTitle: { fontSize: 11, color, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    contactText: { fontSize: 8, color: "#6B7280" },
    divider: { height: 3, backgroundColor: color, marginBottom: 22, marginTop: 10 },
    sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
    accentBar: { width: 4, height: 18, backgroundColor: color, borderRadius: 2 },
    sectionLabel: { fontSize: 9.5, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.5, color: "#111827" },
    sectionLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    section: { marginBottom: 18 },
    expHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    expItem: { marginBottom: 11, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "#F3F4F6" },
    boldTitle: { fontSize: 10.5, fontFamily: f.bold, color: "#111827", textTransform: "uppercase", letterSpacing: 0.3 },
    company: { fontSize: 9, color: "#6B7280", fontFamily: f.italic },
    dateText: { fontSize: 8.5, color: "#9CA3AF" },
    bodyText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
    skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    skillItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    skillName: { fontSize: 9.5, fontFamily: f.bold, color: "#111827" },
    dot: { width: 6, height: 6, borderRadius: 1, marginLeft: 1.5 },
  });

  const sections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={s.section}>
        <View style={s.sectionHead}>
          <View style={s.accentBar} />
          <Text style={s.sectionLabel}>Summary</Text>
          <View style={s.sectionLine} />
        </View>
        <Text style={s.bodyText}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <View key="experience" style={s.section}>
        <View style={s.sectionHead}>
          <View style={s.accentBar} />
          <Text style={s.sectionLabel}>Experience</Text>
          <View style={s.sectionLine} />
        </View>
        {experience.map(exp => (
          <View key={exp.id} style={s.expItem}>
            <View style={s.expHeader}>
              <View>
                <Text style={s.boldTitle}>{exp.title}</Text>
                <Text style={s.company}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
              </View>
              <Text style={s.dateText}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <PDFBullets bullets={exp.bullets} />
          </View>
        ))}
      </View>
    ) : null,

    education: education.length > 0 ? (
      <View key="education" style={s.section}>
        <View style={s.sectionHead}>
          <View style={s.accentBar} />
          <Text style={s.sectionLabel}>Education</Text>
          <View style={s.sectionLine} />
        </View>
        {education.map(edu => (
          <View key={edu.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "#F3F4F6" }}>
            <View>
              <Text style={s.boldTitle}>{edu.institution}</Text>
              <Text style={{ fontSize: 9, color: "#6B7280" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.dateText}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    skills: skills.length > 0 ? (
      <View key="skills" style={s.section}>
        <View style={s.sectionHead}>
          <View style={s.accentBar} />
          <Text style={s.sectionLabel}>Skills</Text>
          <View style={s.sectionLine} />
        </View>
        <View style={s.skillsRow}>
          {skills.map(sk => (
            <View key={sk.id} style={s.skillItem}>
              <Text style={s.skillName}>{sk.name}</Text>
              <View style={{ flexDirection: "row" }}>
                {[1,2,3,4,5].map(n => (
                  <View key={n} style={[s.dot, { backgroundColor: n <= sk.level ? color : "#E5E7EB" }]} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={s.section}>
        <View style={s.sectionHead}>
          <View style={s.accentBar} />
          <Text style={s.sectionLabel}>Certifications</Text>
          <View style={s.sectionLine} />
        </View>
        {certifications.map(c => (
          <View key={c.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
            <View>
              <Text style={{ fontSize: 10, fontFamily: f.bold, color: "#111827" }}>{c.name}</Text>
              <Text style={{ fontSize: 8.5, color: "#6B7280" }}>{c.issuer}</Text>
            </View>
            <Text style={s.dateText}>{formatDate(c.date)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    projects: projects.length > 0 ? (
      <View key="projects" style={s.section}>
        <View style={s.sectionHead}>
          <View style={s.accentBar} />
          <Text style={s.sectionLabel}>Projects</Text>
          <View style={s.sectionLine} />
        </View>
        {projects.map(proj => (
          <View key={proj.id} style={{ marginBottom: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "#F3F4F6" }}>
            <Text style={{ fontSize: 10.5, fontFamily: f.bold, color: "#111827" }}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
            <PDFBullets bullets={proj.bullets} />
          </View>
        ))}
      </View>
    ) : null,

    languages: languages.length > 0 ? (
      <View key="languages" style={s.section}>
        <View style={s.sectionHead}>
          <View style={s.accentBar} />
          <Text style={s.sectionLabel}>Languages</Text>
          <View style={s.sectionLine} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {languages.map(l => (
            <Text key={l.id} style={{ fontSize: 9.5, color: "#374151" }}>
              <Text style={{ fontFamily: f.bold }}>{l.name}</Text>{l.level ? ` · ${l.level}` : ""}
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
        <Text style={s.jobTitle}>{p.jobTitle || ""}</Text>
        <View style={s.contactRow}>
          {p.email && <Text style={s.contactText}>{p.email}</Text>}
          {p.phone && <Text style={s.contactText}>{p.phone}</Text>}
          {p.location && <Text style={s.contactText}>{p.location}</Text>}
          {p.linkedin && <Text style={[s.contactText, { color }]}>{p.linkedin}</Text>}
        </View>
        <View style={s.divider} />
        {sectionOrder.map(k => sections[k] ?? null)}
      </Page>
    </Document>
  );
}
