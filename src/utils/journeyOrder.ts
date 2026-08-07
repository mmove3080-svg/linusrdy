import type { TimelineEvent } from "@/types/shipment";

/**
 * Canonical chronological sequence of a shipment journey.
 * Used to order events whenever explicit Sort Order values and timestamps
 * are unavailable or incomplete.
 */
export const JOURNEY_SEQUENCE: RegExp[] = [
  // 1. Shipment Accepted / Picked Up — the first scan, whatever it's called
  /accept|order(ed)?\b|created|booked|pick(ed)?[\s-]*up|pickup|collected|received/i,
  /depart|left|dispatched from/i,                   // 2. Departed Facility
  /arriv|sort facility|warehouse|hub|processing/i,  // 3. Arrived at Sort Facility
  /in transit|en route|transit/i,                   // 4. In Transit
  /out for delivery|last mile|with courier/i,       // 5. Out for Delivery
  /delivered|completed/i,                           // 6. Delivered
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
 * Deterministically orders journey events, honouring the Airtable arrangement.
 *
 * Priority:
 *   1. Sort Order — AUTHORITATIVE. Whenever any event carries one, it decides
 *      the order. Rows still awaiting a number are slotted in by their nearest
 *      numbered neighbour rather than discarding everyone else's ordering.
 *   2. Timestamp (Date + Time) — used only when Sort Order is absent entirely.
 *   3. Canonical journey sequence — a last resort for unnumbered, undated data.
 *   4. Airtable's own record order — stable final tiebreak.
 *
 * The key guarantee: if you arrange the timeline in Airtable using Sort Order,
 * the site renders that arrangement exactly, even when some rows are blank and
 * even when dates or status names disagree with it.
 */
export function sortJourneyEvents(events: TimelineEvent[]): TimelineEvent[] {
  if (events.length === 0) return [];

  // Derive any missing timestamps so ordering never depends on whether the API
  // happened to parse them.
  const timeOf = new Map<TimelineEvent, number | undefined>(
    events.map((e) => [
      e,
      typeof e.timestamp === "number" ? e.timestamp : parseEventTimestamp(e.date, e.time),
    ]),
  );

  // Does the operator use Sort Order at all? A single numbered row is enough:
  // partially-numbered tables are normal while a shipment is being updated.
  const usesSortOrder = events.some((e) => typeof e.sortOrder === "number");

  if (usesSortOrder) {
    // Give unnumbered rows an effective position derived from the numbered row
    // they follow in Airtable, so they stay put instead of jumping to the end
    // and without disturbing the explicit arrangement around them.
    const byRecord = [...events].sort((a, b) => a.receivedIndex - b.receivedIndex);

    const effective = new Map<TimelineEvent, number>();
    let lastSeen = Number.NEGATIVE_INFINITY;
    let gapCounter = 0;

    for (const event of byRecord) {
      if (typeof event.sortOrder === "number") {
        lastSeen = event.sortOrder;
        gapCounter = 0;
        effective.set(event, event.sortOrder);
      } else {
        gapCounter += 1;
        // Slot just after the preceding numbered row. Before the first numbered
        // row, sit just ahead of it instead.
        const base = lastSeen === Number.NEGATIVE_INFINITY ? 0 : lastSeen;
        effective.set(event, base + gapCounter * 0.001);
      }
    }

    return [...events].sort((a, b) => {
      const diff = (effective.get(a) as number) - (effective.get(b) as number);
      if (diff !== 0) return diff;
      return a.receivedIndex - b.receivedIndex;
    });
  }

  // No Sort Order anywhere — fall back to chronology, then the canonical
  // journey sequence, then Airtable's record order.
  return [...events].sort((a, b) => {
    const ta = timeOf.get(a);
    const tb = timeOf.get(b);
    if (typeof ta === "number" && typeof tb === "number") {
      const diff = ta - tb;
      if (diff !== 0) return diff;
    }

    const seqA = sequenceIndex(a.status);
    const seqB = sequenceIndex(b.status);
    if (seqA !== -1 && seqB !== -1 && seqA !== seqB) return seqA - seqB;

    return a.receivedIndex - b.receivedIndex;
  });
}

