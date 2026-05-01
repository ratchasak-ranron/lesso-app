/**
 * Lexicographic ISO-8601 range check. Both bounds optional.
 * `iso < fromIso` and `iso > toIso` use string compare — works because
 * ISO-8601 is sortable as plain string.
 */
export function inRange(iso: string, fromIso?: string, toIso?: string): boolean {
  if (fromIso && iso < fromIso) return false;
  if (toIso && iso > toIso) return false;
  return true;
}
