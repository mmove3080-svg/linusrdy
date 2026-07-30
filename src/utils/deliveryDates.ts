/**
 * Rolling delivery-date generator for the hero delivery network.
 *
 * Of the 50 simulated journeys per loop:
 *   • 15 carry a FUTURE date  — today through the next 10 days
 *   • 15 carry a PAST date    — today through the previous 10 days
 *   • the remaining 20 carry no date and behave exactly as before
 *
 * Sundays are excluded (no deliveries). Because every window is computed from
 * the current date at render time, the cycle rolls forward automatically —
 * each new day produces a fresh ±10-day range with no manual intervention,
 * up to the configured horizon.
 */

/** Rolling stops after this date unless changed. */
export const ROLLING_HORIZON = new Date("2028-12-31T23:59:59");

export const FUTURE_DELIVERY_COUNT = 15;
export const PAST_DELIVERY_COUNT = 15;
const WINDOW_DAYS = 10;

const isSunday = (d: Date) => d.getDay() === 0;

/** Formats as "Jul 30, 2026" — never numeric. */
export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Working days (Sundays excluded) within `days` of `from`, forward or backward. */
function windowDates(from: Date, days: number, direction: 1 | -1): Date[] {
  const out: Date[] = [];
  for (let i = 0; i <= days; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i * direction);
    d.setHours(0, 0, 0, 0);
    if (isSunday(d)) continue;
    if (direction === 1 && d > ROLLING_HORIZON) break;
    out.push(d);
  }
  return out;
}

/**
 * Builds the date pool for one 50-journey loop.
 * Index 0–14 → future dates, 15–29 → past dates, 30–49 → undefined.
 */
export function buildDeliveryDatePool(now: Date = new Date()): (Date | undefined)[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const future = windowDates(today, WINDOW_DAYS, 1);
  const past = windowDates(today, WINDOW_DAYS, -1);

  const pool: (Date | undefined)[] = [];
  for (let i = 0; i < FUTURE_DELIVERY_COUNT; i++) {
    pool.push(future.length ? future[i % future.length] : undefined);
  }
  for (let i = 0; i < PAST_DELIVERY_COUNT; i++) {
    pool.push(past.length ? past[i % past.length] : undefined);
  }
  while (pool.length < 50) pool.push(undefined);
  return pool;
}
