import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, Package, Copy, Map as MapIcon } from "lucide-react";
import type { TrackingResponse, ShipmentStatus } from "@/types/shipment";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { ShipmentDetails } from "./ShipmentDetails";
import { DeliveryForecast } from "./DeliveryForecast";
import { TrackingMap } from "./TrackingMap";
import { useShipmentJourney } from "@/hooks/useShipmentJourney";
import { formatEtaRelative } from "@/utils/forecast";
import logoMark from "@/assets/logo-mark.png";

// Mapbox GL is heavy — load it only when a token is configured.
const MapboxShipmentMap = lazy(() =>
  import("./MapboxShipmentMap").then((m) => ({ default: m.MapboxShipmentMap })),
);
const HAS_MAPBOX = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

const STATUS_PILL: Partial<Record<ShipmentStatus, string>> & { default: string } = {
  Delivered: "bg-emerald-50 text-emerald-700",
  Exception: "bg-red-50 text-red-600",
  "On Hold": "bg-amber-50 text-amber-700",
  default: "bg-violet-100 text-violet-700",
};

/**
 * Tracking results dashboard — the approved reference layout.
 *   Header: tracking number + status pill · courier · estimated delivery · share
 *   Left:   Tracking Journey timeline
 *   Right:  live map card, then shipment details beside the delivery forecast
 *
 * The map card container is intentionally unchanged from the previous build.
 * All shipment state comes from a single `journey` object.
 */
export function TrackingDashboard({ data }: { data: TrackingResponse }) {
  const { shipment, route } = data;
  const [tab, setTab] = useState<"map" | "details">("map");
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // ── THE single source of truth for position, order and progress. ──
  const journey = useShipmentJourney(shipment);
  const currentStatus = journey.currentStep?.event.status ?? shipment.status;

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

  const pill = STATUS_PILL[shipment.status] ?? STATUS_PILL.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card overflow-hidden rounded-panel"
    >
      {/* ══ Header ══ */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 border-b border-canvas-line px-3 py-3 sm:gap-x-7 sm:gap-y-3 sm:px-6 sm:py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:h-11 sm:w-11 sm:rounded-2xl">
            <Package className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-ink-faint sm:text-[11px]">Tracking Number</p>
            <div className="flex items-center gap-1.5">
              <p className="text-[12.5px] font-extrabold tracking-tight text-ink sm:text-[15px]">
                {shipment.trackingNumber}
              </p>
              <button
                type="button"
                onClick={copyNumber}
                aria-label="Copy tracking number"
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-canvas-tint hover:text-violet-600"
              >
                {copiedNumber ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </button>
            </div>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${pill}`}>
              {currentStatus}
            </span>
          </div>
        </div>

        <span aria-hidden="true" className="hidden h-12 w-px bg-canvas-line md:block" />

        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-canvas-line bg-white p-1 sm:h-10 sm:w-10 sm:p-1.5">
            <img
              src={logoMark}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
            />
          </span>
          <div>
            <p className="text-[10px] font-semibold text-ink-faint sm:text-[11px]">Courier</p>
            <p className="text-[12.5px] font-extrabold leading-snug text-ink sm:text-[15px]">{shipment.courier}</p>
            {(shipment.serviceLevel ?? shipment.shippingMethod) && (
              <p className="text-xs text-ink-soft">
                {shipment.serviceLevel ?? shipment.shippingMethod}
              </p>
            )}
          </div>
        </div>

        <span aria-hidden="true" className="hidden h-12 w-px bg-canvas-line md:block" />

        <div>
          <p className="text-[10px] font-semibold text-ink-faint sm:text-[11px]">Estimated Delivery</p>
          <p className="text-[12.5px] font-extrabold text-green-600 sm:text-[15px]">
            {shipment.estimatedDelivery ? formatEtaRelative(shipment.estimatedDelivery) : "—"}
          </p>
          {shipment.deliveryWindow && (
            <p className="text-xs text-ink-soft">{shipment.deliveryWindow}</p>
          )}
        </div>

        <button
          type="button"
          onClick={share}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-[11.5px] font-bold text-violet-700 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-[13px] transition-all duration-200 hover:bg-violet-100 active:scale-95"
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

      {/* ══ Body ══ */}
      <div className="grid lg:grid-cols-[minmax(250px,32%)_1fr]">
        {/* Left: Tracking Journey */}
        <div className="order-2 border-t border-canvas-line p-3 sm:p-5 lg:order-1 lg:border-r lg:border-t-0">
          <ShipmentTimeline journey={journey} />
        </div>

        {/* Right: map card (unchanged) + details and forecast */}
        <div className="order-1 space-y-3 p-3 sm:space-y-3.5 sm:p-5 lg:order-2">
          {/* Tabs */}
          <div role="tablist" aria-label="Shipment view" className="flex gap-5 border-b border-canvas-line sm:gap-7">
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
                className={`relative pb-2.5 text-[12px] font-bold transition-colors sm:text-[13.5px] ${
                  tab === id ? "text-violet-700" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
                {tab === id && (
                  <motion.span
                    layoutId="tracking-tab-underline"
                    className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-violet-600"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Map panel — kept mounted so the map never re-initialises on tab switch */}
          <section
            aria-label="Live shipment map"
            className={`card overflow-hidden rounded-2xl ${tab === "map" ? "block" : "hidden"}`}
          >
            <div className="flex items-center gap-2.5 border-b border-canvas-line px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <MapIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-extrabold text-ink">Live Map</h3>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pin-pulse rounded-full bg-violet-500" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
                </span>
                {journey.progressPercent}% of route complete
              </span>
            </div>
            <div className="h-[270px] p-2 sm:h-[320px] sm:p-2.5 lg:h-[360px]">
              {HAS_MAPBOX ? (
                <Suspense
                  fallback={<div className="h-full w-full animate-pulse rounded-xl bg-canvas-tint" />}
                >
                  <MapboxShipmentMap shipment={shipment} route={route} journey={journey} />
                </Suspense>
              ) : (
                <TrackingMap shipment={shipment} route={route} journey={journey} />
              )}
            </div>
          </section>

          {/* Full details panel */}
          {tab === "details" && (
            <section aria-label="Shipment details" className="card rounded-2xl p-4 sm:p-5">
              <ShipmentDetails shipment={shipment} variant="full" />
            </section>
          )}

          {/* Bottom cards — details beside the delivery forecast, as in the reference */}
          <div className="grid gap-3.5 xl:grid-cols-[1fr_minmax(270px,40%)]">
            <div className="card rounded-2xl px-4 py-2 sm:px-5">
              <ShipmentDetails shipment={shipment} variant="compact" />
            </div>
            <DeliveryForecast shipment={shipment} journey={journey} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

