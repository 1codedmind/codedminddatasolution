import type { ResumeData } from "./types";

function fmt(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m,10)-1] + " " + y;
}

export function renderCustomSection(
  data: ResumeData,
  key: string,
  color: string,
  fontFamily?: string
): React.ReactNode {
  const cs = (data.customSections ?? []).find((s) => s.id === key);
  if (!cs) return null;

  return (
    <div key={key} style={{ marginBottom: 20, fontFamily }}>
      {/* Section heading */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#111827" }}>
          {cs.title || "Custom Section"}
        </span>
        <div style={{ flex: 1, height: 1, background: color, opacity: 0.3 }} />
      </div>

      {cs.items.length === 0 && (
        <p style={{ fontSize: 9.5, color: "#9CA3AF", fontStyle: "italic", margin: 0 }}>No entries yet — add items in the editor.</p>
      )}

      {cs.items.map((item) => (
        <div key={item.id} style={{ marginBottom: 12 }}>
          {(item.heading || item.subtitle || item.date) && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
              <div>
                {item.heading && <span style={{ fontSize: 11, fontWeight: 700, color: "#111827" }}>{item.heading}</span>}
                {item.subtitle && <span style={{ fontSize: 9.5, color: "#6B7280", marginLeft: 6 }}>{item.subtitle}</span>}
              </div>
              {item.date && <span style={{ fontSize: 8.5, color: "#9CA3AF", whiteSpace: "nowrap" as const, marginLeft: 8 }}>{fmt(item.date)}</span>}
            </div>
          )}
          {item.description && (
            <p style={{ fontSize: 9.5, color: "#4B5563", margin: "2px 0 4px", lineHeight: 1.6 }}>{item.description}</p>
          )}
          {item.bullets.filter(Boolean).map((b, i) => (
            <div key={i} style={{ display: "flex", marginBottom: 2 }}>
              <span style={{ color, marginRight: 6, fontSize: 10, lineHeight: "16px", flexShrink: 0 }}>•</span>
              <span style={{ fontSize: 9.5, color: "#4B5563", lineHeight: 1.55 }}>{b}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
