import {
  ClipboardList, PackageSearch, PackageCheck, Truck, Building2, Bike, CheckCircle2,
  AlertTriangle, PauseCircle, Circle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Canonical shipment journey. Airtable statuses are matched to these stages so
 * every event gets the right icon and the timeline can render a complete
 * journey even when the events table is sparse.
 */
export const CANONICAL_STAGES = [
  "Ordered",
  "Processing",
  "Picked Up",
  "In Transit",
  "Arrived at Facility",
  "Out for Delivery",
  "Delivered",
] as const;

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/order|created/i, ClipboardList],
  [/process|prepar/i, PackageSearch],
  [/pick(ed)?\s*up|collect/i, PackageCheck],
  [/transit|depart|en route/i, Truck],
  [/facility|warehouse|sort|hub|distribution|arriv/i, Building2],
  [/out for delivery|last mile|dispatch/i, Bike],
  [/delivered|complete/i, CheckCircle2],
  [/exception|fail|delay|issue/i, AlertTriangle],
  [/hold|pause/i, PauseCircle],
];

/** Best-matching icon for any status string. */
export function iconForStatus(status: string): LucideIcon {
  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(status)) return icon;
  }
  return Circle;
}

/** Position of a status within the canonical journey (-1 when unknown). */
export function stageIndex(status: string): number {
  const normalized = status.toLowerCase();
  const order = [
    /order|created/,
    /process|prepar/,
    /pick(ed)?\s*up|collect/,
    /transit|depart|en route/,
    /facility|warehouse|sort|hub|distribution|arriv/,
    /out for delivery|last mile|dispatch/,
    /delivered|complete/,
  ];
  for (let i = order.length - 1; i >= 0; i--) {
    if (order[i].test(normalized)) return i;
  }
  return -1;
}
