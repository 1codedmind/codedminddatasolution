const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** Parse and display any common date string as "MMM YYYY" or "YYYY". Never returns "undefined ...". */
export function formatDate(d: string): string {
  if (!d) return "";
  const v = d.trim();
  if (!v) return "";

  // YYYY-MM (legacy input[type=month] format)
  let m = v.match(/^(\d{4})-(\d{1,2})$/);
  if (m) return `${MN[parseInt(m[2], 10) - 1] ?? ""} ${m[1]}`.trim();

  // MM/YYYY (common AI output)
  m = v.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return `${MN[parseInt(m[1], 10) - 1] ?? ""} ${m[2]}`.trim();

  // YYYY/MM
  m = v.match(/^(\d{4})\/(\d{2})$/);
  if (m) return `${MN[parseInt(m[2], 10) - 1] ?? ""} ${m[1]}`.trim();

  // "Jan 2022" or "January 2022" — already formatted, normalize to short name
  m = v.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const prefix = m[1].toLowerCase().slice(0, 3);
    const idx = MN.findIndex((n) => n.toLowerCase() === prefix);
    if (idx >= 0) return `${MN[idx]} ${m[2]}`;
  }

  // "2022 Jan" or "2022 January"
  m = v.match(/^(\d{4})\s+([A-Za-z]+)$/);
  if (m) {
    const prefix = m[2].toLowerCase().slice(0, 3);
    const idx = MN.findIndex((n) => n.toLowerCase() === prefix);
    if (idx >= 0) return `${MN[idx]} ${m[1]}`;
  }

  // Year only
  if (/^\d{4}$/.test(v)) return v;

  // Unknown format — return as-is rather than producing "undefined ..."
  return v;
}
