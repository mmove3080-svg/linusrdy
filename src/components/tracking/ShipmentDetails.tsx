import {
  Box, Scale, Ruler, Hash, CalendarDays, MapPin, Navigation, User, UserCheck,
  Truck, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Shipment } from "@/types/shipment";
import { formatDate, formatPlace } from "@/utils/format";

interface DetailRow {
  icon: LucideIcon;
  label: string;
  value?: string;
}

function buildRows(shipment: Shipment, variant: "compact" | "full"): DetailRow[] {
  const from = formatPlace(shipment.origin.city, shipment.origin.state, shipment.origin.country);
  const to = formatPlace(
    shipment.destination.city,
    shipment.destination.state,
    shipment.destination.country,
  );
  const compact: DetailRow[] = [
    { icon: Box, label: "Service", value: shipment.shippingMethod },
    { icon: Scale, label: "Weight", value: shipment.weightLabel },
    { icon: Ruler, label: "Dimensions", value: shipment.dimensionsLabel },
    { icon: Hash, label: "Reference", value: shipment.reference },
    { icon: CalendarDays, label: "Shipped On", value: shipment.shipmentDate ? formatDate(shipment.shipmentDate) : undefined },
    { icon: MapPin, label: "From", value: from },
    { icon: Navigation, label: "To", value: to },
  ];
  if (variant === "compact") return compact.filter((r) => r.value);

  const full: DetailRow[] = [
    { icon: Hash, label: "Tracking Number", value: shipment.trackingNumber },
    { icon: User, label: "Sender", value: shipment.senderName },
    { icon: UserCheck, label: "Receiver", value: shipment.receiverName ?? shipment.customerName },
    { icon: Truck, label: "Status", value: shipment.status },
    { icon: Clock, label: "Current Location", value: shipment.currentLocation.city },
    ...compact,
    { icon: CalendarDays, label: "Estimated Delivery", value: shipment.estimatedDelivery ? formatDate(shipment.estimatedDelivery) : undefined },
    { icon: Box, label: "Package", value: shipment.packageDetails },
  ];
  return full.filter((r) => r.value);
}

/**
 * Shipment details list, reference style: violet icon chip, gray label left,
 * bold value right. "compact" = the seven-row card under the map;
 * "full" = the Shipment Details tab (adds parties, status, photo).
 */
export function ShipmentDetails({
  shipment,
  variant,
}: {
  shipment: Shipment;
  variant: "compact" | "full";
}) {
  const rows = buildRows(shipment, variant);

  return (
    <div>
      <ul className={variant === "full" ? "grid gap-x-8 sm:grid-cols-2" : undefined}>
        {rows.map(({ icon: Icon, label, value }) => (
          <li
            key={label}
            className="flex items-center gap-3 border-b border-canvas-line/70 py-2.5 last:border-b-0"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span className="text-[13px] text-ink-soft">{label}</span>
            <span className="ml-auto text-right text-[13px] font-bold text-ink">{value}</span>
          </li>
        ))}
      </ul>

      {variant === "full" && shipment.packagePhotoUrl && (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Package Photo
          </p>
          <img
            src={shipment.packagePhotoUrl}
            alt="Package"
            loading="lazy"
            className="mt-2 max-h-56 rounded-xl border border-canvas-line object-cover shadow-soft"
          />
        </div>
      )}
    </div>
  );
}
