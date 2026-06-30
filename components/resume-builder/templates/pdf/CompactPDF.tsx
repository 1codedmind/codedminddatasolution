import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";
import { formatDate, PDFBullets, getPDFFonts } from "./shared";

interface Props { data: ResumeData; color: string; fontFamily?: string; }

function SectionLabel({ label, color, bold }: { label: string; color: string; bold: string }) {
  return (
    <View style={{ marginBottom: 5 }}>
      <Text style={{ fontSize: 7.5, fontFamily: bold, textTransform: "uppercase", letterSpacing: 1.2, color }}>{label}</Text>
      <View style={{ height: 1.5, backgroundColor: color, marginTop: 2 }} />
    </View>
  );
}

export default function CompactPDF({ data, color, fontFamily }: Props) {
  const f = getPDFFonts(fontFamily);
  const { personalInfo: p, summary, experience, education, skills, certifications, projects, languages, sectionOrder } = data;

  const rightSet = new Set(["skills", "certifications", "languages"]);
  const left = sectionOrder.filter(k => !rightSet.has(k));
  const right = sectionOrder.filter(k => rightSet.has(k));

  const s = StyleSheet.create({
    page: { backgroundColor: "#fff", paddingTop: 28, paddingBottom: 28, paddingLeft: 32, paddingRight: 32, fontFamily: f.regular, fontSize: 10 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 10, marginBottom: 12 },
    name: { fontSize: 20, fontFamily: f.bold, color: "#111827" },
    jobTitle: { fontSize: 10, fontFamily: f.bold, color, marginTop: 2 },
    contact: { fontSize: 7.5, color: "#6B7280", marginBottom: 2, textAlign: "right" },
    body: { flexDirection: "row", gap: 18 },
    leftCol: { flex: 1 },
    rightCol: { width: 150 },
    section: { marginBottom: 12 },
    expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
    boldSm: { fontSize: 9.5, fontFamily: f.bold, color: "#111827" },
    muted: { fontSize: 8, color: "#9CA3AF" },
    body9: { fontSize: 8.5, color: "#374151", lineHeight: 1.45 },
    skillRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
    dot: { width: 5, height: 5, borderRadius: 2.5, marginLeft: 2 },
  });

  function renderLeft(key: string) {
    if (key === "summary" && summary) return (
      <View key="summary" style={s.section}>
        <SectionLabel label="Summary" color={color} bold={f.bold} />
        <Text style={s.body9}>{summary}</Text>
      </View>
    );
    if (key === "experience" && experience.length > 0) return (
      <View key="experience" style={s.section}>
        <SectionLabel label="Experience" color={color} bold={f.bold} />
        {experience.map(exp => (
          <View key={exp.id} style={{ marginBottom: 8 }}>
            <View style={s.expRow}>
              <View>
                <Text style={s.boldSm}>{exp.title}</Text>
                <Text style={{ fontSize: 8.5, color: "#6B7280", fontFamily: f.italic }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
              </View>
              <Text style={s.muted}>{formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}</Text>
            </View>
            <PDFBullets bullets={exp.bullets} />
          </View>
        ))}
      </View>
    );
    if (key === "education" && education.length > 0) return (
      <View key="education" style={s.section}>
        <SectionLabel label="Education" color={color} bold={f.bold} />
        {education.map(edu => (
          <View key={edu.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
            <View>
              <Text style={s.boldSm}>{edu.institution}</Text>
              <Text style={{ fontSize: 8.5, color: "#4B5563" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</Text>
            </View>
            <Text style={s.muted}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</Text>
          </View>
        ))}
      </View>
    );
    if (key === "projects" && projects.length > 0) return (
      <View key="projects" style={s.section}>
        <SectionLabel label="Projects" color={color} bold={f.bold} />
        {projects.map(proj => (
          <View key={proj.id} style={{ marginBottom: 6 }}>
            <Text style={s.boldSm}>{proj.name}{proj.url ? `  ${proj.url}` : ""}</Text>
            {proj.description ? <Text style={s.body9}>{proj.description}</Text> : null}
          </View>
        ))}
      </View>
    );
    return null;
  }

  function renderRight(key: string) {
    if (key === "skills" && skills.length > 0) return (
      <View key="skills" style={s.section}>
        <SectionLabel label="Skills" color={color} bold={f.bold} />
        {skills.map(sk => (
          <View key={sk.id} style={s.skillRow}>
            <Text style={{ fontSize: 8.5, color: "#374151" }}>{sk.name}</Text>
            <View style={{ flexDirection: "row" }}>
              {[1,2,3,4,5].map(n => (
                <View key={n} style={[s.dot, { backgroundColor: n <= sk.level ? color : "#E5E7EB" }]} />
              ))}
            </View>
          </View>
        ))}
      </View>
    );
    if (key === "certifications" && certifications.length > 0) return (
      <View key="certifications" style={s.section}>
        <SectionLabel label="Certifications" color={color} bold={f.bold} />
        {certifications.map(c => (
          <View key={c.id} style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 8.5, fontFamily: f.bold, color: "#111827" }}>{c.name}</Text>
            <Text style={{ fontSize: 7.5, color: "#6B7280" }}>{c.issuer}{c.date ? ` · ${formatDate(c.date)}` : ""}</Text>
          </View>
        ))}
      </View>
    );
    if (key === "languages" && languages.length > 0) return (
      <View key="languages" style={s.section}>
        <SectionLabel label="Languages" color={color} bold={f.bold} />
        {languages.map(l => (
          <Text key={l.id} style={{ fontSize: 8.5, color: "#374151", marginBottom: 3 }}>
            <Text style={{ fontFamily: f.bold }}>{l.name}</Text>{l.level ? ` · ${l.level}` : ""}
          </Text>
        ))}
      </View>
    );
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={[s.header, { borderBottomWidth: 2, borderBottomColor: color }]}>
          <View>
            <Text style={s.name}>{p.fullName || "Your Name"}</Text>
            <Text style={s.jobTitle}>{p.jobTitle || ""}</Text>
          </View>
          <View>
            {p.email && <Text style={s.contact}>{p.email}</Text>}
            {p.phone && <Text style={s.contact}>{p.phone}</Text>}
            {p.location && <Text style={s.contact}>{p.location}</Text>}
            {p.linkedin && <Text style={[s.contact, { color }]}>{p.linkedin}</Text>}
          </View>
        </View>
        <View style={s.body}>
          <View style={s.leftCol}>{left.map(renderLeft)}</View>
          <View style={s.rightCol}>{right.map(renderRight)}</View>
        </View>
      </Page>
    </Document>
  );
}
