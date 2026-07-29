import { motion } from "framer-motion";
import { Radio, CalendarClock, Clock3, Building2 } from "lucide-react";
import type { Shipment } from "@/types/shipment";
import type { ShipmentJourney } from "@/hooks/useShipmentJourney";
import { formatDate } from "@/utils/format";
import { formatEtaRelative } from "@/utils/forecast";

/**
 * Live status banner: the at-a-glance state of the shipment, shown above
 * everything else. White surface, blue accents, four labelled facts.
 */
export function StatusBanner({
  shipment,
  journey,
}: {
  shipment: Shipment;
  journey: ShipmentJourney;
}) {
  const delivered = journey.delivered;
  const current = journey.currentStep;
  const alert = shipment.status === "Exception" || shipment.status === "On Hold";

  const accent = delivered
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : alert
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-brand-50 text-brand-700 ring-brand-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card overflow-hidden rounded-2xl"
    >
      <div className="grid gap-px bg-canvas-line sm:grid-cols-2 lg:grid-cols-4">
        {/* Status */}
        <div className="flex items-center gap-3 bg-white px-4 py-3.5">
          <span className={`relative flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${accent}`}>
            <Radio className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            {!delivered && !alert && (
              <span className="absolute inset-0 animate-pin-pulse rounded-xl bg-brand-500/25" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Status</p>
            <p className="truncate text-sm font-extrabold text-ink">
              {current?.event.status ?? shipment.status}
            </p>
          </div>
        </div>

        <BannerCell
          icon={CalendarClock}
          label="Estimated Delivery"
          value={shipment.estimatedDelivery ? formatEtaRelative(shipment.estimatedDelivery) : "—"}
          hint={shipment.deliveryWindow}
          emphasis
        />
        <BannerCell
          icon={Clock3}
          label="Last Scan"
          value={
            current && (current.event.date || current.event.time)
              ? `${current.event.date ? formatDate(current.event.date) : ""}${
                  current.event.date && current.event.time ? " · " : ""
                }${current.event.time}`
              : shipment.lastUpdated
                ? formatDate(shipment.lastUpdated)
                : "—"
          }
        />
        <BannerCell
          icon={Building2}
          label="Current Facility"
          value={
            current?.event.city ||
            shipment.currentFacility ||
            shipment.currentLocation.city ||
            "In transit"
          }
        />
      </div>
    </motion.div>
  );
}

function BannerCell({
  icon: Icon,
  label,
  value,
  hint,
  emphasis = false,
}: {
  icon: typeof Radio;
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
        <p className={`truncate text-sm font-extrabold ${emphasis ? "text-brand-600" : "text-ink"}`}>
          {value}
        </p>
        {hint && <p className="truncate text-[11px] text-ink-soft">{hint}</p>}
      </div>
    </div>
  );
}
