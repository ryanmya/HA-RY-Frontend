// Cursor pagination shared by every list endpoint.
// The backend sends { message, data: { items, nextCursor } }; api.ts unwraps `data`.
export type Paginated<T> = {
  items: T[];
  /** Id of the last item, to pass as `cursor` for the next page. null when there are no more pages. */
  nextCursor: string | null;
};

export type PageParams = {
  limit?: number;
  cursor?: string | null;
};

// Builds "?limit=12&cursor=abc", skipping empty values.
export function toQuery(params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const s = query.toString();
  return s ? `?${s}` : "";
}
