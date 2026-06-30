import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, getPDFFonts } from "./shared";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function ElegantPDF({ data, color, fontFamily }: Props) {
  const f = getPDFFonts(fontFamily);
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", paddingTop: 44, paddingBottom: 44, paddingLeft: 52, paddingRight: 52, fontFamily: f.regular, fontSize: 10 },
    headerCenter: { alignItems: "center", marginBottom: 22 },
    name: { fontSize: 28, fontFamily: f.bold, color: "#111827", letterSpacing: 1, marginBottom: 4 },
    jobTitle: { fontSize: 11, color, fontFamily: f.italic, letterSpacing: 0.5, marginBottom: 8 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
    contactText: { fontSize: 8, color: "#6B7280" },
    topDivider: { height: 1, backgroundColor: "#E5E7EB", marginTop: 14 },
    sectionHead: { alignItems: "center", marginBottom: 12 },
    sectionLabel: { fontSize: 8.5, fontFamily: f.bold, letterSpacing: 2.5, textTransform: "uppercase", color },
    sectionDecor: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    decorLine: { height: 1, backgroundColor: "#E5E7EB", width: 50 },
    decorDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: color },
    section: { marginBottom: 20 },
    expRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", borderBottomWidth: 1, borderBottomColor: "#F3F4F6", paddingBottom: 4, marginBottom: 6 },
    boldItalic: { fontSize: 10.5, fontFamily: f.bold, fontStyle: "italic", color: "#111827" },
    muted: { fontSize: 8.5, color: "#9CA3AF" },
    bodyText: { fontSize: 9.5, color: "#4B5563", lineHeight: 1.65 },
    skillsCenter: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
    skillText: { fontSize: 9.5, color: "#374151" },
    langRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14 },
  });

  function SectionHead({ label }: { label: string }) {
    return (
      <View style={s.sectionHead}>
        <Text style={s.sectionLabel}>{label}</Text>
        <View style={s.sectionDecor}>
          <View style={s.decorLine} />
          <View style={s.decorDot} />
          <View style={s.decorLine} />
        </View>
      </View>
    );
  }

  const sections: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={s.section}>
        <SectionHead label="Profile" />
        <Text style={[s.bodyText, { textAlign: "center" }]}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <View key="experience" style={s.section}>
        <SectionHead label="Experience" />
        {experience.map(exp => (
          <View key={exp.id} style={{ marginBottom: 14 }}>
            <View style={s.expRow}>
              <View>
                <Text style={s.boldItalic}>{exp.title}</Text>
                <Text style={{ fontSize: 9, color: "#6B7280" }}>at {exp.company}{exp.location ? `, ${exp.location}` : ""}</Text>
              </View>
              <Text style={s.muted}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <PDFBullets bullets={exp.bullets} />
          </View>
        ))}
      </View>
    ) : null,

    education: education.length > 0 ? (
      <View key="education" style={s.section}>
        <SectionHead label="Education" />
        {education.map(edu => (
          <View key={edu.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <View>
              <Text style={s.boldItalic}>{edu.institution}</Text>
              <Text style={{ fontSize: 9, color: "#6B7280" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · ${edu.gpa} GPA` : ""}</Text>
            </View>
            <Text style={s.muted}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    ) : null,

    skills: skills.length > 0 ? (
      <View key="skills" style={s.section}>
        <SectionHead label="Expertise" />
        <View style={s.skillsCenter}>
          {skills.map((sk, i) => (
            <View key={sk.id} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={s.skillText}>{sk.name}</Text>
              {i < skills.length - 1 && <Text style={{ color: "#D1D5DB", fontSize: 10 }}>·</Text>}
            </View>
          ))}
        </View>
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={s.section}>
        <SectionHead label="Certifications" />
        {certifications.map(c => (
          <Text key={c.id} style={[s.bodyText, { textAlign: "center", marginBottom: 5 }]}>
            <Text style={{ fontFamily: f.italic }}>{c.name}</Text>
            {c.issuer ? <Text style={{ color: "#6B7280" }}>{` · ${c.issuer}`}</Text> : null}
            {c.date ? <Text style={{ color: "#9CA3AF" }}>{` · ${formatDate(c.date)}`}</Text> : null}
          </Text>
        ))}
      </View>
    ) : null,

    projects: projects.length > 0 ? (
      <View key="projects" style={s.section}>
        <SectionHead label="Projects" />
        {projects.map(proj => (
          <View key={proj.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={s.boldItalic}>{proj.name}</Text>
              {proj.url && <Text style={{ fontSize: 8, color }}>{proj.url}</Text>}
            </View>
            {proj.description && <Text style={s.bodyText}>{proj.description}</Text>}
          </View>
        ))}
      </View>
    ) : null,

    languages: languages.length > 0 ? (
      <View key="languages" style={s.section}>
        <SectionHead label="Languages" />
        <View style={s.langRow}>
          {languages.map(l => (
            <Text key={l.id} style={s.skillText}>
              <Text style={{ fontFamily: f.italic }}>{l.name}</Text>
              {l.level ? <Text style={{ color: "#9CA3AF" }}>{` (${l.level})`}</Text> : null}
            </Text>
          ))}
        </View>
      </View>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerCenter}>
          <Text style={s.name}>{p.fullName || "Your Name"}</Text>
          {p.jobTitle && <Text style={s.jobTitle}>{p.jobTitle}</Text>}
          <View style={s.contactRow}>
            {p.email && <Text style={s.contactText}>{p.email}</Text>}
            {p.phone && <Text style={s.contactText}>{p.phone}</Text>}
            {p.location && <Text style={s.contactText}>{p.location}</Text>}
            {p.linkedin && <Text style={[s.contactText, { color }]}>{p.linkedin}</Text>}
          </View>
          <View style={s.topDivider} />
        </View>
        {sectionOrder.map(k => sections[k] ?? null)}
      </Page>
    </Document>
  );
}
