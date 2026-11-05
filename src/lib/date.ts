// Local YYYY-MM-DD (toISOString would shift the day by the UTC offset).
export function toDateParam(d?: Date) {
  if (!d) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "2026-10-04T16:00:00Z" → "04/10/2026" (local time). Pass `sep` for another separator, e.g. "-" or " ".
export function formatDMY(value: string | Date, sep = "/") {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return [String(d.getDate()).padStart(2, "0"), String(d.getMonth() + 1).padStart(2, "0"), d.getFullYear()].join(sep);
}
