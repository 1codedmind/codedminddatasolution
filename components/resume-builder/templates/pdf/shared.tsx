import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";

export function formatDate(d: string): string {
  if (!d) return "";
  const [year, month] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const m = parseInt(month, 10) - 1;
  return `${months[m] ?? ""} ${year}`;
}

export const baseStyles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", fontSize: 10 },
  flex: { display: "flex" },
  row: { display: "flex", flexDirection: "row" },
  col: { display: "flex", flexDirection: "column" },
});

export function getPDFFonts(fontFamily?: string) {
  const serif = fontFamily === "georgia" || fontFamily === "merriweather" || fontFamily === "playfair";
  return serif
    ? { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic", boldItalic: "Times-BoldItalic" }
    : { regular: "Helvetica",   bold: "Helvetica-Bold", italic: "Helvetica-Oblique", boldItalic: "Helvetica-BoldOblique" };
}

export function renderPDFCustomSection(data: ResumeData, key: string, color: string, fonts: { regular: string; bold: string; italic: string; boldItalic: string }) {
  const cs = (data.customSections ?? []).find((s) => s.id === key);
  if (!cs) return null;

  return (
    <View key={key} style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 9, fontFamily: fonts.bold, textTransform: "uppercase", letterSpacing: 1, color: "#111827" }}>
          {cs.title || "Custom Section"}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.3 }} />
      </View>
      {cs.items.map((item) => (
        <View key={item.id} style={{ marginBottom: 10 }}>
          {(item.heading || item.subtitle || item.date) ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
              <View style={{ flex: 1 }}>
                {item.heading ? <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: "#111827" }}>{item.heading}</Text> : null}
                {item.subtitle ? <Text style={{ fontSize: 8.5, color: "#6B7280", fontFamily: fonts.italic }}>{item.subtitle}</Text> : null}
              </View>
              {item.date ? <Text style={{ fontSize: 8, color: "#9CA3AF" }}>{formatDate(item.date)}</Text> : null}
            </View>
          ) : null}
          {item.description ? <Text style={{ fontSize: 9, color: "#4B5563", lineHeight: 1.5, marginBottom: 3 }}>{item.description}</Text> : null}
          <PDFBullets bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

export function PDFBullets({ bullets, color = "#374151" }: { bullets: string[]; color?: string }) {
  const filtered = bullets.filter(Boolean);
  if (!filtered.length) return null;
  return (
    <View style={{ marginTop: 4 }}>
      {filtered.map((b, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 2 }}>
          <Text style={{ fontSize: 9, color, marginRight: 4, marginTop: 0.5 }}>•</Text>
          <Text style={{ fontSize: 9, color, lineHeight: 1.5, flex: 1 }}>{b}</Text>
        </View>
      ))}
    </View>
  );
}
