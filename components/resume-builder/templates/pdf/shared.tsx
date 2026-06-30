import { StyleSheet, Text, View } from "@react-pdf/renderer";

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
