import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, Package, Copy, Map as MapIcon } from "lucide-react";
import type { TrackingResponse } from "@/types/shipment";
import { StatusBanner } from "./StatusBanner";
import { ShipmentSummary } from "./ShipmentSummary";
import { ShipmentTimeline } from "./ShipmentTimeline";
import { TrackingMap } from "./TrackingMap";
import { useShipmentJourney } from "@/hooks/useShipmentJourney";

// Mapbox GL is heavy — load it only when a token is configured.
const MapboxShipmentMap = lazy(() =>
  import("./MapboxShipmentMap").then((m) => ({ default: m.MapboxShipmentMap })),
);
const HAS_MAPBOX = Boolean(import.meta.env.VITE_MAPBOX_TOKEN);

/**
 * Tracking results dashboard — premium white surface with the site's blue
 * accent. Composition:
 *   Live status banner
 *   Header (tracking number · carrier · share)
 *   Left: shipment progress timeline
 *   Right: live map card, then the shipment summary
 */
export function TrackingDashboard({ data }: { data: TrackingResponse }) {
  const { shipment, route } = data;

  // ── THE single source of truth. Resolved once here and passed down; no
  //    child component may compute the current position independently. ──
  const journey = useShipmentJourney(shipment);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* ══ Live status banner ══ */}
      <StatusBanner shipment={shipment} journey={journey} />

      {/* ══ Header ══ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="card flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl px-4 py-4 sm:px-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Package className="h-[22px] w-[22px]" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              Tracking Number
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-[15px] font-extrabold tracking-tight text-ink">
                {shipment.trackingNumber}
              </p>
              <button
                type="button"
                onClick={copyNumber}
                aria-label="Copy tracking number"
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-canvas-tint hover:text-brand-600"
              >
                {copiedNumber ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>

        <span aria-hidden="true" className="hidden h-10 w-px bg-canvas-line sm:block" />

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Carrier</p>
          <p className="text-[15px] font-extrabold text-ink">{shipment.courier}</p>
          {(shipment.serviceLevel ?? shipment.shippingMethod) && (
            <p className="text-[11px] text-ink-soft">
              {shipment.serviceLevel ?? shipment.shippingMethod}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={share}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-[13px] font-bold text-brand-700 transition-all duration-200 hover:bg-brand-100 active:scale-95"
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
      </motion.div>

      {/* ══ Main grid ══ */}
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,34%)_1fr]">
        {/* Left: progress timeline */}
        <div className="order-2 lg:order-1">
          <ShipmentTimeline journey={journey} />
        </div>

        {/* Right: map + summary */}
        <div className="order-1 space-y-4 lg:order-2">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Live shipment map"
            className="card overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-2.5 border-b border-canvas-line px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <MapIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-extrabold text-ink">Live Map</h3>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pin-pulse rounded-full bg-brand-500" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
                </span>
                {journey.progressPercent}% of route complete
              </span>
            </div>
            <div className="h-[290px] p-2 sm:h-[340px] sm:p-3 lg:h-[380px]">
              {HAS_MAPBOX ? (
                <Suspense
                  fallback={
                    <div className="h-full w-full animate-pulse rounded-xl bg-canvas-tint" />
                  }
                >
                  <MapboxShipmentMap shipment={shipment} route={route} journey={journey} />
                </Suspense>
              ) : (
                <TrackingMap shipment={shipment} route={route} journey={journey} />
              )}
            </div>
          </motion.section>

          <ShipmentSummary shipment={shipment} journey={journey} />
        </div>
      </div>
    </motion.div>
  );
}
