/**
 * Delivery record generation for the hero network map.
 *
 * Two independent datasets, mixed and shuffled for display:
 *   • Dataset A — 120 historical shipments, all "Delivered", dated from
 *     yesterday backwards in rolling 40-day cycles (Sundays excluded).
 *   • Dataset B — 100 live shipments, always dated today, cycling through
 *     Processing Package / Out for Delivery / Delivered.
 *
 * Sunday rule: on Sundays every Dataset B status becomes "Arriving on Monday".
 * This activates automatically and reverts on Monday.
 *
 * All windows derive from the current date at render time, so the cycles roll
 * forward automatically with no manual step, up to the configured horizon.
 */

/** Rolling generation stops after this date unless changed. */
export const ROLLING_HORIZON = new Date("2028-12-31T23:59:59");

export const HISTORICAL_COUNT = 120;
export const LIVE_COUNT = 100;
export const TOTAL_RECORDS = HISTORICAL_COUNT + LIVE_COUNT;

/** Length of one historical cycle, in days. */
const HISTORY_CYCLE_DAYS = 40;

export type DeliveryStatus =
  | "Delivered"
  | "Processing Package"
  | "Out for Delivery"
  | "Arriving on Monday";

export interface DeliveryRecord {
  /** "Jul 30, 2026" — abbreviated month first, never numeric. */
  date: string;
  status: DeliveryStatus;
  /** Historical records are past deliveries; live ones are today's. */
  kind: "historical" | "live";
}

const isSunday = (d: Date) => d.getDay() === 0;

/** Formats as "Jul 30, 2026" / "Aug 05, 2026". */
export function formatDeliveryDate(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  return `${month} ${day}, ${date.getFullYear()}`;
}

/**
 * Working days going backwards from yesterday, Sundays excluded.
 * Rolls through successive 40-day cycles until `count` dates are collected, so
 * the pattern repeats automatically once a cycle completes.
 */
function historicalDates(count: number, now: Date): Date[] {
  const out: Date[] = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - 1); // start at yesterday

  let stepped = 0;
  while (out.length < count) {
    if (!isSunday(cursor)) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() - 1);
    stepped++;
    // Completed a 40-day cycle — the loop simply continues into the next one.
    if (stepped > HISTORY_CYCLE_DAYS * 40) break; // safety bound
  }
  return out;
}

const LIVE_STATUSES: DeliveryStatus[] = [
  "Processing Package",
  "Out for Delivery",
  "Delivered",
];

/** Dataset A — 120 delivered historical shipments. */
export function buildHistoricalRecords(now: Date = new Date()): DeliveryRecord[] {
  return historicalDates(HISTORICAL_COUNT, now).map((d) => ({
    date: formatDeliveryDate(d),
    status: "Delivered" as const,
    kind: "historical" as const,
  }));
}

/** Dataset B — 100 live shipments dated today. */
export function buildLiveRecords(now: Date = new Date()): DeliveryRecord[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dateLabel = formatDeliveryDate(today);
  const sunday = isSunday(today);

  return Array.from({ length: LIVE_COUNT }, (_, i) => ({
    date: dateLabel,
    // Sunday rule: every live status becomes "Arriving on Monday".
    status: sunday ? ("Arriving on Monday" as const) : LIVE_STATUSES[i % LIVE_STATUSES.length],
    kind: "live" as const,
  }));
}

/** Deterministic-enough shuffle so historical and live records interleave. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Both datasets combined and shuffled — never displayed separately. */
export function buildDeliveryRecords(now: Date = new Date()): DeliveryRecord[] {
  return shuffle([...buildHistoricalRecords(now), ...buildLiveRecords(now)]);
}
