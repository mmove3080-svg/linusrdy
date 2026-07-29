import { useState } from "react";
import { motion } from "framer-motion";
import { Package, PlaneTakeoff, Truck, Check, Bell } from "lucide-react";
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
  const [alertsRequested, setAlertsRequested] = useState(false);

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
      <div className="card rounded-2xl p-5">
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

        <h3 className="mt-6 text-sm font-extrabold text-ink">Transit Progress</h3>
        <div className="relative mt-4 h-8">
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
                className={`absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white ${
                  done
                    ? isLast
                      ? "border-emerald-400 text-emerald-500"
                      : "border-violet-600 text-violet-600"
                    : "border-canvas-line text-ink-faint"
                }`}
                style={{ left: `calc(${at * 100}% - ${at * 28}px)` }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              </span>
            );
          })}
        </div>
        <p className="mt-2.5 text-xs text-ink-faint">
          {completed} of {total} completed
        </p>
      </div>

      <div className="rounded-2xl bg-violet-50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-soft">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-extrabold text-ink">Get real-time updates</p>
            <p className="text-xs leading-relaxed text-ink-soft">
              {alertsRequested
                ? "Noted — notifications are coming soon."
                : "Turn on notifications and never miss an update."}
            </p>
          </div>
          {!alertsRequested && (
            <button
              type="button"
              onClick={() => setAlertsRequested(true)}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-soft transition-all duration-200 hover:bg-violet-700 active:scale-95"
            >
              Enable Alerts
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
