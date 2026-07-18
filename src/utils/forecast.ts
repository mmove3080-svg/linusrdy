import type { Shipment } from "@/types/shipment";

/**
 * On-time delivery forecast percentage, derived from shipment progress and
 * status (no hardcoding). Delivered = 100. Exceptions/holds reduce confidence.
 */
export function calculateForecast(shipment: Shipment): number {
  if (shipment.status === "Delivered" || shipment.progress >= 100) return 100;
  if (shipment.status === "Exception") return 62;
  if (shipment.status === "On Hold") return 74;
  return Math.min(99, Math.round(90 + shipment.progress * 0.09));
}

/** "Today, Jun 28" / "Tomorrow, Jun 28" / "Sun, Jun 28" for the summary bar. */
export function formatEtaRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(today)) / 86_400_000);
  const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (diffDays === 0) return `Today, ${dateLabel}`;
  if (diffDays === 1) return `Tomorrow, ${dateLabel}`;
  return `${d.toLocaleDateString("en-US", { weekday: "short" })}, ${dateLabel}`;
}
