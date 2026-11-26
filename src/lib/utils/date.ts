/**
 * Formats an ISO timestamp into a local `YYYY-MM-DDTHH:mm` value for `<input type="datetime-local">`.
 */
export function toDateTimeLocalValue(
  isoDate: string | null | undefined,
): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Converts a `<input type="datetime-local">` value using Brasília (-03:00) default offset into ISO UTC.
 * Returns `"INVALID_DATE"` on malformed values so Zod datetime validation reports an explicit field error.
 */
export function parseDateTimeLocalToIso(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withTimezone = /(Z|[+-]\d{2}:\d{2})$/i.test(trimmed)
    ? trimmed
    : `${trimmed}-03:00`;
  const parsedDate = new Date(withTimezone);
  return Number.isNaN(parsedDate.getTime())
    ? "INVALID_DATE"
    : parsedDate.toISOString();
}
