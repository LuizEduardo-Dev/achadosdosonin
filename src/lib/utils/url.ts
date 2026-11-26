/**
 * Defense-in-depth URL sanitizer for external href attributes.
 * Accepts only `http:` and `https:` URLs to prevent `javascript:` or `data:` injection.
 */
export function toSafeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}
