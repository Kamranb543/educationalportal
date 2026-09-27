// Pure filtering helpers shared across directory tables.
// They accept already-materialized arrays so store-derived data flows through
// unchanged; components pass filtered results directly to their tables.

function includes(haystack: string | undefined | null, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle);
}

/** Case-insensitive text match against any of the candidate fields. */
export function matchesQuery(
  q: string,
  ...candidates: (string | undefined | null)[]
): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return candidates.some((c) => includes(c, needle));
}

/** Generic predicate helpers for filter dropdowns. */
export function matchesStatus<T extends { status?: string }>(
  row: T,
  status: string,
): boolean {
  if (!status || status === "all") return true;
  return row.status === status;
}

export function matchesClass(row: { classId?: string }, classId: string): boolean {
  if (!classId || classId === "all") return true;
  return row.classId === classId;
}

/** Filter by an ISO date prefix ("YYYY-MM") or exact date string. */
export function matchesDate(value: string, filter: string): boolean {
  if (!filter) return true;
  return value.startsWith(filter);
}
