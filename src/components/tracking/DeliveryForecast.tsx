import { motion } from "framer-motion";
import { Package, PlaneTakeoff, Truck, Check } from "lucide-react";
import type { Shipment } from "@/types/shipment";
import { calculateForecast } from "@/utils/forecast";
import type { ShipmentJourney } from "@/hooks/useShipmentJourney";

/**
 * Delivery Forecast, Transit Progress and alerts card — the reference design.
 * Every value derives from the shared journey object, so the transit nodes and
 * "N of M completed" always agree with the timeline and the map marker.
 */
export function DeliveryForecast({
  shipment,
  journey,
}: {
  shipment: Shipment;
  journey: ShipmentJourney;
}) {
  const forecast = calculateForecast(shipment);
  const fraction = journey.progressPercent / 100;
  const completed = journey.currentIndex + 1;
  const total = journey.steps.length;

  const nodes = [
    { icon: Package, at: 0 },
    { icon: PlaneTakeoff, at: 0.34 },
    { icon: Truck, at: 0.67 },
    { icon: Check, at: 1 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
    >
      <div className="card rounded-2xl p-4 sm:p-5">
        {/* Mobile: the percentage leads, then the title — with generous spacing.
            Desktop keeps the original title-first arrangement. */}
        <div className="flex items-center gap-3.5 sm:hidden">
          <span className="text-[32px] font-extrabold leading-none tracking-tight text-green-600">
            {forecast}
            <span className="text-xl">%</span>
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-ink">Delivery Forecast</p>
            <p className="mt-1 text-[11.5px] font-semibold text-ink-soft">On-time delivery</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
              based on current progress
            </p>
          </div>
        </div>

        <div className="hidden sm:block">
          <h3 className="text-sm font-extrabold text-ink">Delivery Forecast</h3>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-[40px] font-extrabold leading-none tracking-tight text-green-600">
              {forecast}
              <span className="text-2xl">%</span>
            </span>
            <div>
              <p className="text-[13px] font-bold text-ink">On-time delivery</p>
              <p className="text-xs text-ink-faint">based on current progress</p>
            </div>
          </div>
        </div>

        <h3 className="mt-6 text-[13px] font-extrabold text-ink sm:mt-5 sm:text-sm">Transit Progress</h3>
        <div className="relative mt-5 h-7 sm:mt-4 sm:h-8">
          <div className="absolute inset-x-1 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-canvas-line" />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fraction * 100}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="absolute left-1 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-violet-600"
            style={{ maxWidth: "calc(100% - 8px)" }}
          />
          {nodes.map(({ icon: Icon, at }, i) => {
            const done = fraction >= at - 0.001;
            const isLast = i === nodes.length - 1;
            return (
              <span
                key={i}
                className={`absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white sm:h-7 sm:w-7 ${
                  done
                    ? isLast
                      ? "border-emerald-400 text-emerald-500"
                      : "border-violet-600 text-violet-600"
                    : "border-canvas-line text-ink-faint"
                }`}
                style={{ left: `calc(${at * 100}% - ${at * 26}px)` }}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.2} aria-hidden="true" />
              </span>
            );
          })}
        </div>
        <p className="mt-3.5 text-[11px] text-ink-faint sm:mt-2.5 sm:text-xs">
          {completed} of {total} completed
        </p>
      </div>

    </motion.div>
  );
}
