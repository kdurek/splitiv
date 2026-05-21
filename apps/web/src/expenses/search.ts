export function parseSearchQuery(q?: string): string[] {
  return q && q.length >= 3 ? q.trim().split(/\s+/).filter(Boolean) : [];
}
