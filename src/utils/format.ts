/** Formatting helpers shared across the UI. */

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatPlace(city?: string, state?: string, country?: string): string {
  return [city, state, country].filter(Boolean).join(", ");
}

export function normalizeTrackingNumber(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
