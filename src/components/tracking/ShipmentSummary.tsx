import { motion } from "framer-motion";
import {
  Hash, Activity, MapPin, Navigation, Flag, CalendarClock, Clock3,
  Box, Scale, Building, BadgeCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Shipment } from "@/types/shipment";
import type { ShipmentJourney } from "@/hooks/useShipmentJourney";
import { formatDate, formatPlace } from "@/utils/format";

interface Row {
  icon: LucideIcon;
  label: string;
  value?: string;
}

/** A row confirmed to have a value — what actually gets rendered. */
type FilledRow = Row & { value: string };

/**
 * Premium shipment summary: every key fact in a two-column grid of labelled
 * rows with blue icon chips. Rows with no data are omitted automatically, so
 * partially-filled Airtable records still look intentional.
 */
export function ShipmentSummary({
  shipment,
  journey,
}: {
  shipment: Shipment;
  journey: ShipmentJourney;
}) {
  const current = journey.currentStep;

  const rows: FilledRow[] = [
    { icon: Hash, label: "Tracking Number", value: shipment.trackingNumber },
    { icon: Activity, label: "Shipment Status", value: current?.event.status ?? shipment.status },
    {
      icon: MapPin,
      label: "Current Location",
      value:
        formatPlace(current?.event.city, current?.event.state) ||
        shipment.currentLocation.city ||
        shipment.currentFacility,
    },
    {
      icon: Navigation,
      label: "Origin",
      value: formatPlace(shipment.origin.city, shipment.origin.state, shipment.origin.country),
    },
    {
      icon: Flag,
      label: "Destination",
      value: formatPlace(
        shipment.destination.city,
        shipment.destination.state,
        shipment.destination.country,
      ),
    },
    {
      icon: CalendarClock,
      label: "Estimated Delivery",
      value: shipment.estimatedDelivery ? formatDate(shipment.estimatedDelivery) : undefined,
    },
    {
      icon: Clock3,
      label: "Last Updated",
      value: shipment.lastUpdated ? formatDate(shipment.lastUpdated) : undefined,
    },
    { icon: Box, label: "Shipment Type", value: shipment.shipmentTypeLabel },
    { icon: Scale, label: "Weight", value: shipment.weightLabel },
    { icon: Building, label: "Carrier", value: shipment.courier },
    {
      icon: BadgeCheck,
      label: "Service Level",
      value: shipment.serviceLevel ?? shipment.shippingMethod,
    },
  ].filter((r): r is FilledRow => Boolean(r.value));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Shipment details"
      className="card rounded-2xl p-4 sm:p-5"
    >
      <h3 className="text-sm font-extrabold text-ink">Shipment Details</h3>

      <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 border-b border-canvas-line/70 py-2.5 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <dt className="text-[12.5px] text-ink-soft">{label}</dt>
            <dd className="ml-auto min-w-0 truncate text-right text-[12.5px] font-bold text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}
