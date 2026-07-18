import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, Package, Copy } from "lucide-react";
import type { TrackingResponse, ShipmentStatus } from "@/types/shipment";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { TrackingMap } from "./TrackingMap";
import { ShipmentDetails } from "./ShipmentDetails";
import { DeliveryForecast } from "./DeliveryForecast";
import { formatEtaRelative } from "@/utils/forecast";

// Mapbox GL is heavy — load it only when a token is configured.
const MapboxShipmentMap = lazy(() =>
  import("./MapboxShipmentMap").then((m) => ({ default: m.MapboxShipmentMap })),
);
const HAS_MAPBOX = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

const STATUS_STYLES: Partial<Record<ShipmentStatus, string>> & { default: string } = {
  Delivered: "bg-emerald-50 text-emerald-700",
  Exception: "bg-red-50 text-red-600",
  "On Hold": "bg-amber-50 text-amber-700",
  default: "bg-violet-100 text-violet-700",
};

type Tab = "map" | "details";

/**
 * Tracking dashboard, reference layout on a white surface:
 *  - summary bar: tracking number + copy + status pill · courier · green ETA · share
 *  - left: Tracking Journey timeline
 *  - right: Live Map / Shipment Details tabs, then details card + forecast column
 */
export function TrackingDashboard({ data }: { data: TrackingResponse }) {
  const { shipment, route } = data;
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [tab, setTab] = useState<Tab>("map");

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
      /* dismissed — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2200);
    } catch {
      /* clipboard unavailable */
    }
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(shipment.trackingNumber);
      setCopiedNumber(true);
      window.setTimeout(() => setCopiedNumber(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const badge = STATUS_STYLES[shipment.status] ?? STATUS_STYLES.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="card overflow-hidden rounded-panel"
    >
      {/* ══ Summary bar ══ */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-canvas-line px-4 py-4 sm:px-7 sm:py-5">
        {/* Tracking number */}
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Package className="h-[22px] w-[22px]" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-ink-faint">Tracking Number</p>
            <div className="flex items-center gap-1.5">
              <p className="text-[15px] font-extrabold tracking-tight text-ink">
                {shipment.trackingNumber}
              </p>
              <button
                type="button"
                onClick={copyNumber}
                aria-label="Copy tracking number"
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-canvas-tint hover:text-ink"
              >
                {copiedNumber ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </button>
            </div>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge}`}
            >
              {shipment.status}
            </span>
          </div>
        </div>

        <Divider />

        {/* Courier */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[13px] font-extrabold text-white">
            {initials(shipment.courier)}
          </span>
          <div>
            <p className="text-[11px] font-semibold text-ink-faint">Courier</p>
            <p className="text-[15px] font-extrabold text-ink">{shipment.courier}</p>
            {shipment.shippingMethod && (
              <p className="text-xs text-ink-soft">{shipment.shippingMethod}</p>
            )}
          </div>
        </div>

        <Divider />

        {/* ETA */}
        <div>
          <p className="text-[11px] font-semibold text-ink-faint">Estimated Delivery</p>
          <p className="text-[15px] font-extrabold text-green-600">
            {shipment.estimatedDelivery ? formatEtaRelative(shipment.estimatedDelivery) : "—"}
          </p>
          {shipment.deliveryWindow && (
            <p className="text-xs text-ink-soft">{shipment.deliveryWindow}</p>
          )}
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={share}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-[13px] font-bold text-violet-700 transition-all duration-200 hover:bg-violet-100 active:scale-95"
        >
          {copiedShare ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.5} /> Link Copied
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" strokeWidth={2.1} /> Share
            </>
          )}
        </button>
      </div>

      {/* ══ Main layout ══ */}
      <div className="grid lg:grid-cols-[minmax(250px,30%)_1fr]">
        {/* Left: timeline */}
        <div className="order-2 border-t border-canvas-line p-4 sm:p-6 lg:order-1 lg:border-r lg:border-t-0">
          <ShipmentTimeline shipment={shipment} />
        </div>

        {/* Right: tabs → map/details, then details + forecast */}
        <div className="order-1 p-4 sm:p-6 lg:order-2">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Shipment view"
            className="flex gap-6 border-b border-canvas-line"
          >
            {(
              [
                { id: "map", label: "Live Map" },
                { id: "details", label: "Shipment Details" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`relative pb-2.5 text-[13px] font-bold transition-colors ${
                  tab === id ? "text-violet-600" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
                {tab === id && (
                  <motion.span
                    layoutId="tracking-tab"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet-600"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div className="mt-4">
            {tab === "map" ? (
              <div className="h-[280px] sm:h-[340px] lg:h-[380px]">
                {HAS_MAPBOX ? (
                  <Suspense
                    fallback={
                      <div className="h-full w-full animate-pulse rounded-2xl bg-canvas-tint" />
                    }
                  >
                    <MapboxShipmentMap shipment={shipment} route={route} />
                  </Suspense>
                ) : (
                  <TrackingMap shipment={shipment} route={route} />
                )}
              </div>
            ) : (
              <ShipmentDetails shipment={shipment} variant="full" />
            )}
          </div>

          {/* Details + forecast row, per reference (map tab only) */}
          {tab === "map" && (
            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_minmax(280px,42%)]">
              <div className="card rounded-2xl px-4 py-2 sm:px-5">
                <ShipmentDetails shipment={shipment} variant="compact" />
              </div>
              <DeliveryForecast shipment={shipment} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Divider() {
  return <span aria-hidden="true" className="hidden h-12 w-px bg-canvas-line md:block" />;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
