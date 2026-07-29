import type { TimelineEvent } from "@/types/shipment";

/**
 * Canonical chronological sequence of a shipment journey.
 * Used to order events whenever explicit Sort Order values and timestamps
 * are unavailable or incomplete.
 */
export const JOURNEY_SEQUENCE: RegExp[] = [
  /accept|order|created|booked/i,          // 1. Shipment Accepted
  /depart|left|dispatched from/i,          // 2. Departed Facility
  /arriv|sort facility|warehouse|hub|processing/i, // 3. Arrived at Sort Facility
  /in transit|en route|transit/i,          // 4. In Transit
  /out for delivery|last mile|with courier/i, // 5. Out for Delivery
  /delivered|completed/i,                  // 6. Delivered
];

/** Position in the canonical sequence, or -1 when unrecognised. */
export function sequenceIndex(status: string): number {
  for (let i = 0; i < JOURNEY_SEQUENCE.length; i++) {
    if (JOURNEY_SEQUENCE[i].test(status)) return i;
  }
  return -1;
}

/** Parses "2026-06-24" + "09:15 AM" (or "14:32") into epoch ms. */
export function parseEventTimestamp(date: string, time: string): number | undefined {
  if (!date) return undefined;
  const base = new Date(date);
  if (Number.isNaN(base.getTime())) return undefined;

  const match = time?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    base.setHours(hours, minutes, 0, 0);
  }
  return base.getTime();
}

/**
 * Deterministically orders journey events, chronologically, every time.
 *
 * Priority:
 *   1. Explicit Sort Order — but ONLY when every event actually has one, so a
 *      partially-numbered table can't interleave numbered and unnumbered rows.
 *   2. Timestamp (Date + Time) — true chronology.
 *   3. Canonical sequence position — Accepted → Departed → Arrived → In Transit
 *      → Out for Delivery → Delivered.
 *   4. Arrival index — stable, so the result never shuffles between renders.
 *
 * Each rule only breaks ties left by the one before it, so partial data still
 * produces a correct, stable order.
 */
export function sortJourneyEvents(events: TimelineEvent[]): TimelineEvent[] {
  const everyHasSortOrder = events.length > 0 && events.every((e) => typeof e.sortOrder === "number");

  return [...events].sort((a, b) => {
    if (everyHasSortOrder) {
      const diff = (a.sortOrder as number) - (b.sortOrder as number);
      if (diff !== 0) return diff;
    }

    if (typeof a.timestamp === "number" && typeof b.timestamp === "number") {
      const diff = a.timestamp - b.timestamp;
      if (diff !== 0) return diff;
    }

    const seqA = sequenceIndex(a.status);
    const seqB = sequenceIndex(b.status);
    if (seqA !== -1 && seqB !== -1 && seqA !== seqB) return seqA - seqB;

    return a.receivedIndex - b.receivedIndex;
  });
}
