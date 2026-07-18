import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, PackageSearch } from "lucide-react";
import type { TrackingResponse, ShipmentStatus } from "@/types/shipment";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { TrackingMap } from "./TrackingMap";

// Mapbox GL is heavy — load it only when a token is configured.
const MapboxShipmentMap = lazy(() =>
  import("./MapboxShipmentMap").then((m) => ({ default: m.MapboxShipmentMap })),
);
const HAS_MAPBOX = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);
import { formatDate } from "@/utils/format";

const STATUS_STYLES: Partial<Record<ShipmentStatus, string>> & { default: string } = {
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Exception: "bg-red-50 text-red-600 ring-red-200",
  "On Hold": "bg-amber-50 text-amber-700 ring-amber-200",
  default: "bg-brand-50 text-brand-700 ring-brand-200",
};

/**
 * Tracking result dashboard: white rounded container with a summary bar
 * (tracking number, courier, status, ETA, share) above the timeline (left)
 * and the shipment map (right). Mobile: map first, then timeline.
 */
export function TrackingDashboard({ data }: { data: TrackingResponse }) {
  const { shipment, route } = data;
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?track=${shipment.trackingNumber}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Linus Delivery — ${shipment.trackingNumber}`,
          text: `Track shipment ${shipment.trackingNumber}`,
          url,
        });
        return;
      }
    } catch {
      /* user dismissed the share sheet — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable — nothing further to do */
    }
  };

  const badge = STATUS_STYLES[shipment.status] ?? STATUS_STYLES.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="card overflow-hidden"
    >
      {/* ── Summary bar ── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-canvas-line px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <PackageSearch className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              Tracking Number
            </p>
            <p className="text-sm font-extrabold text-ink">{shipment.trackingNumber}</p>
          </div>
        </div>

        <SummaryCell label="Courier" value={shipment.courier} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Status</p>
          <span
            className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${badge}`}
          >
            {shipment.status}
          </span>
        </div>
        <SummaryCell
          label="Estimated Delivery"
          value={shipment.estimatedDelivery ? formatDate(shipment.estimatedDelivery) : "—"}
        />

        <button
          type="button"
          onClick={share}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-canvas-line bg-white px-3.5 py-2 text-xs font-bold text-brand-600 shadow-soft transition-all duration-200 hover:border-brand-200 hover:bg-brand-50"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Link Copied
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" strokeWidth={2.2} /> Share Tracking
            </>
          )}
        </button>
      </div>

      {/* ── Timeline + map ── */}
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(240px,30%)_1fr] lg:gap-8">
        <div className="order-2 lg:order-1">
          <ShipmentTimeline shipment={shipment} />
        </div>
        <div className="order-1 h-[280px] sm:h-[360px] lg:order-2 lg:h-[440px]">
          {HAS_MAPBOX ? (
            <Suspense
              fallback={<div className="h-full w-full animate-pulse rounded-2xl bg-canvas-tint" />}
            >
              <MapboxShipmentMap shipment={shipment} route={route} />
            </Suspense>
          ) : (
            <TrackingMap shipment={shipment} route={route} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
