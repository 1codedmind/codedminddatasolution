import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, getPDFFonts, renderPDFCustomSection } from "./shared";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function CubicPDF({ data, color, fontFamily }: Props) {
  const f = getPDFFonts(fontFamily);
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const rightSet = new Set(["skills", "certifications", "languages"]);
  const mainOrder = sectionOrder.filter(k => !rightSet.has(k));
  const rightOrder = sectionOrder.filter(k => rightSet.has(k));

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", fontFamily: f.regular, fontSize: 10 },
    header: { backgroundColor: "#111827", padding: "22 30", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    name: { fontSize: 22, fontFamily: f.bold, color: "#fff" },
    jobTitle: { fontSize: 10, color, fontFamily: f.bold, marginTop: 3 },
    contactRight: { alignItems: "flex-end" },
    contactText: { fontSize: 8, color: "#9CA3AF", marginBottom: 2 },
    body: { flexDirection: "row", flex: 1 },
    main: { flex: 1, padding: "20 24" },
    rightSidebar: { width: 160, backgroundColor: "#F9FAFB", padding: "20 14", borderLeftWidth: 1, borderLeftColor: "#E5E7EB" },
    mainLabel: { flexDirection: "row", alignItems: "center", marginBottom: 9, gap: 6 },
    labelDot: { width: 7, height: 7, backgroundColor: color, borderRadius: 1 },
    labelText: { fontSize: 8.5, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.2, color: "#111827" },
    labelLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    rightLabel: { fontSize: 7.5, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.2, color, marginBottom: 8 },
    section: { marginBottom: 14 },
    expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    expTitle: { fontSize: 10, fontFamily: f.bold, color: "#111827" },
    expMeta: { fontSize: 8.5, color: "#6B7280", fontFamily: f.italic },
    expDate: { fontSize: 8, color: "#9CA3AF" },
    bodyText: { fontSize: 9, color: "#4B5563", lineHeight: 1.5 },
    skillBarBg: { height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, marginBottom: 5 },
  });

  function MainSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <View style={s.section}>
        <View style={s.mainLabel}>
          <View style={s.labelDot} />
          <Text style={s.labelText}>{label}</Text>
          <View style={s.labelLine} />
        </View>
        {children}
      </View>
    );
  }

  function RightSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <View style={s.section}>
        <Text style={s.rightLabel}>{label}</Text>
        {children}
      </View>
    );
  }

  const mainMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <MainSection key="summary" label="Summary">
        <Text style={s.bodyText}>{summary}</Text>
      </MainSection>
    ) : null,

    experience: experience.length > 0 ? (
      <MainSection key="experience" label="Experience">
        {experience.map(exp => (
          <View key={exp.id} style={{ marginBottom: 10, paddingLeft: 6, borderLeftWidth: 2, borderLeftColor: `${color}30` }}>
            <View style={s.expRow}>
              <View>
                <Text style={s.expTitle}>{exp.title}</Text>
                <Text style={s.expMeta}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
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
          <View key={edu.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 7, paddingLeft: 6, borderLeftWidth: 2, borderLeftColor: `${color}30` }}>
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
          <View key={proj.id} style={{ marginBottom: 8, paddingLeft: 6, borderLeftWidth: 2, borderLeftColor: `${color}30` }}>
            <Text style={{ fontSize: 10, fontFamily: f.bold, color: "#111827" }}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.bodyText}>{proj.description}</Text> : null}
          </View>
        ))}
      </MainSection>
    ) : null,
  };

  const rightMap: Record<string, React.ReactNode> = {
    skills: skills.length > 0 ? (
      <RightSection key="skills" label="Skills">
        {skills.map(sk => (
          <View key={sk.id} style={{ marginBottom: 7 }}>
            <Text style={{ fontSize: 8.5, color: "#374151", marginBottom: 2 }}>{sk.name}</Text>
            <View style={s.skillBarBg}>
              <View style={{ width: `${(sk.level / 5) * 100}%`, height: 4, backgroundColor: color, borderRadius: 2 }} />
            </View>
          </View>
        ))}
      </RightSection>
    ) : null,

    certifications: certifications.length > 0 ? (
      <RightSection key="certifications" label="Certifications">
        {certifications.map(c => (
          <View key={c.id} style={{ marginBottom: 7 }}>
            <Text style={{ fontSize: 8.5, fontFamily: f.bold, color: "#111827" }}>{c.name}</Text>
            <Text style={{ fontSize: 7.5, color: "#6B7280", marginTop: 1 }}>{c.issuer}{c.date ? ` · ${formatDate(c.date)}` : ""}</Text>
          </View>
        ))}
      </RightSection>
    ) : null,

    languages: languages.length > 0 ? (
      <RightSection key="languages" label="Languages">
        {languages.map(l => (
          <View key={l.id} style={{ marginBottom: 5 }}>
            <Text style={{ fontSize: 8.5, fontFamily: f.bold, color: "#374151" }}>{l.name}</Text>
            {l.level ? <Text style={{ fontSize: 7.5, color: "#9CA3AF" }}>{l.level}</Text> : null}
          </View>
        ))}
      </RightSection>
    ) : null,
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.name}>{p.fullName || "Your Name"}</Text>
            {p.jobTitle ? <Text style={s.jobTitle}>{p.jobTitle}</Text> : null}
          </View>
          <View style={s.contactRight}>
            {p.email ? <Text style={s.contactText}>{p.email}</Text> : null}
            {p.phone ? <Text style={s.contactText}>{p.phone}</Text> : null}
            {p.location ? <Text style={s.contactText}>{p.location}</Text> : null}
            {p.linkedin ? <Text style={[s.contactText, { color }]}>{p.linkedin}</Text> : null}
          </View>
        </View>
        <View style={s.body}>
          <View style={s.main}>{mainOrder.map(k => mainMap[k] ?? renderPDFCustomSection(data, k, color, f))}</View>
          <View style={s.rightSidebar}>{rightOrder.map(k => rightMap[k] ?? null)}</View>
        </View>
      </Page>
    </Document>
  );
}
