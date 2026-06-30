import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, getPDFFonts, renderPDFCustomSection } from "./shared";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

export default function EnfoldPDF({ data, color, fontFamily }: Props) {
  const f = getPDFFonts(fontFamily);
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const sideSet = new Set(["skills", "certifications", "languages"]);
  const mainOrder = sectionOrder.filter(k => !sideSet.has(k));
  const sideOrder = sectionOrder.filter(k => sideSet.has(k));
  const orderedMain = [
    ...mainOrder.filter(k => k === "summary"),
    ...mainOrder.filter(k => k !== "summary"),
  ];

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", fontFamily: f.regular, fontSize: 10 },
    headerBar: { backgroundColor: color, padding: "20 26" },
    headerName: { fontSize: 22, fontFamily: f.bold, color: "#fff" },
    headerTitle: { fontSize: 9.5, color: "rgba(255,255,255,0.75)", marginTop: 3 },
    body: { flexDirection: "row", flex: 1 },
    sidebar: { width: 165, padding: "18 15", flexDirection: "column" },
    main: { flex: 1, padding: "18 22" },
    sideLabel: { fontSize: 7, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.4, color: "rgba(255,255,255,0.6)", marginBottom: 3 },
    sideDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 8 },
    sideContact: { fontSize: 8, color: "rgba(255,255,255,0.85)", marginBottom: 3 },
    sideSection: { marginBottom: 16 },
    mainSection: { marginBottom: 16 },
    mainLabel: { fontSize: 9, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.2, color: "#111827", marginBottom: 2 },
    mainDivider: { height: 1.5, backgroundColor: color, opacity: 0.2, marginBottom: 9 },
    summaryBox: { backgroundColor: "#F9FAFB", padding: "9 11", borderLeftWidth: 3, borderLeftColor: color, marginBottom: 14 },
    summaryLabel: { fontSize: 8, fontFamily: f.bold, textTransform: "uppercase", letterSpacing: 1.2, color, marginBottom: 5 },
    expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    expTitle: { fontSize: 10, fontFamily: f.bold, color: "#111827" },
    expMeta: { fontSize: 8.5, color: "#6B7280", fontFamily: f.italic },
    expDate: { fontSize: 8, color: "#9CA3AF" },
    bodyText: { fontSize: 9, color: "#4B5563", lineHeight: 1.5 },
  });

  function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <View style={[s.sideSection, { backgroundColor: `${color}e6`, padding: "0 0 0 0" }]}>
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

  const sideMap: Record<string, React.ReactNode> = {
    skills: skills.length > 0 ? (
      <View key="skills" style={s.sideSection}>
        <Text style={s.sideLabel}>Skills</Text>
        <View style={s.sideDivider} />
        {skills.map(sk => (
          <View key={sk.id} style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 8.5, color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>{sk.name}</Text>
            <View style={{ height: 3, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 2 }}>
              <View style={{ width: `${(sk.level / 5) * 100}%`, height: 3, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
            </View>
          </View>
        ))}
      </View>
    ) : null,

    certifications: certifications.length > 0 ? (
      <View key="certifications" style={s.sideSection}>
        <Text style={s.sideLabel}>Certifications</Text>
        <View style={s.sideDivider} />
        {certifications.map(c => (
          <View key={c.id} style={{ marginBottom: 7 }}>
            <Text style={{ fontSize: 8.5, fontFamily: f.bold, color: "rgba(255,255,255,0.95)" }}>{c.name}</Text>
            <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>{c.issuer}{c.date ? ` · ${formatDate(c.date)}` : ""}</Text>
          </View>
        ))}
      </View>
    ) : null,

    languages: languages.length > 0 ? (
      <View key="languages" style={s.sideSection}>
        <Text style={s.sideLabel}>Languages</Text>
        <View style={s.sideDivider} />
        {languages.map(l => (
          <View key={l.id} style={{ marginBottom: 5 }}>
            <Text style={{ fontSize: 8.5, fontFamily: f.bold, color: "rgba(255,255,255,0.95)" }}>{l.name}</Text>
            {l.level ? <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)" }}>{l.level}</Text> : null}
          </View>
        ))}
      </View>
    ) : null,
  };

  const mainMap: Record<string, React.ReactNode> = {
    summary: summary ? (
      <View key="summary" style={s.summaryBox}>
        <Text style={s.summaryLabel}>Profile</Text>
        <Text style={s.bodyText}>{summary}</Text>
      </View>
    ) : null,

    experience: experience.length > 0 ? (
      <MainSection key="experience" label="Experience">
        {experience.map(exp => (
          <View key={exp.id} style={{ marginBottom: 10 }}>
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
        <View style={s.headerBar}>
          <Text style={s.headerName}>{p.fullName || "Your Name"}</Text>
          {p.jobTitle ? <Text style={s.headerTitle}>{p.jobTitle}</Text> : null}
        </View>
        <View style={s.body}>
          {/* Left sidebar */}
          <View style={[s.sidebar, { backgroundColor: `${color}e6` }]}>
            {/* Contact */}
            <View style={s.sideSection}>
              <Text style={s.sideLabel}>Contact</Text>
              <View style={s.sideDivider} />
              {p.email ? <Text style={s.sideContact}>{p.email}</Text> : null}
              {p.phone ? <Text style={s.sideContact}>{p.phone}</Text> : null}
              {p.location ? <Text style={s.sideContact}>{p.location}</Text> : null}
              {p.linkedin ? <Text style={[s.sideContact, { color: "rgba(255,255,255,0.7)" }]}>{p.linkedin}</Text> : null}
            </View>
            {sideOrder.map(k => sideMap[k] ?? null)}
          </View>
          {/* Main */}
          <View style={s.main}>
            {orderedMain.map(k => mainMap[k] ?? renderPDFCustomSection(data, k, color, f))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
