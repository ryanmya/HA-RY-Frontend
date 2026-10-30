// Local YYYY-MM-DD (toISOString would shift the day by the UTC offset).
export function toDateParam(d?: Date) {
  if (!d) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
