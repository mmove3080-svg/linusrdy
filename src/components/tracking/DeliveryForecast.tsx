import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, Warehouse, Check, Bell } from "lucide-react";
import type { Shipment } from "@/types/shipment";
import { calculateForecast } from "@/utils/forecast";

/**
 * Right column of the lower dashboard, reference style:
 * Delivery Forecast (large green %, animated bar), Transit Progress
 * (icon nodes along a violet track, "N of M completed"), and the
 * "Get real-time updates" alerts card.
 */
export function DeliveryForecast({ shipment }: { shipment: Shipment }) {
  const forecast = calculateForecast(shipment);
  const fraction = Math.min(Math.max(shipment.progress, 0), 100) / 100;

  const total = shipment.timeline.length;
  const completed =
    shipment.status === "Delivered"
      ? total
      : Math.max(
          0,
          (() => {
            const asc = [...shipment.timeline].sort((a, b) => a.sortOrder - b.sortOrder);
            for (let i = asc.length - 1; i >= 0; i--) {
              if (asc[i].status === shipment.status) return i;
            }
            return Math.max(asc.length - 1, 0);
          })(),
        );

  const stages = [
    { icon: Package, at: 0 },
    { icon: Warehouse, at: 0.34 },
    { icon: Truck, at: 0.67 },
    { icon: Check, at: 1 },
  ];

  const [alertsRequested, setAlertsRequested] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Forecast card ── */}
      <div className="card rounded-2xl p-5">
        <h3 className="text-sm font-extrabold text-ink">Delivery Forecast</h3>

        <div className="mt-2 flex items-center gap-4">
          <span className="text-4xl font-extrabold tracking-tight text-green-600">
            {forecast}%
          </span>
          <div>
            <p className="text-[13px] font-bold text-ink">On-time delivery</p>
            <p className="text-xs text-ink-faint">based on current progress</p>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-canvas-line">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${forecast}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full rounded-full bg-green-500"
          />
        </div>

        {/* ── Transit progress ── */}
        <h3 className="mt-5 text-sm font-extrabold text-ink">Transit Progress</h3>
        <div className="relative mt-3 h-8">
          {/* track */}
          <div className="absolute inset-x-1 top-1/2 h-1 -translate-y-1/2 rounded-full bg-canvas-line" />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fraction * 100}%` }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute left-1 top-1/2 h-1 -translate-y-1/2 rounded-full bg-violet-600"
            style={{ maxWidth: "calc(100% - 8px)" }}
          />
          {/* stage nodes */}
          {stages.map(({ icon: Icon, at }, i) => {
            const done = fraction >= at - 0.001;
            const isLast = i === stages.length - 1;
            return (
              <span
                key={i}
                className={`absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border-2 ${
                  done
                    ? isLast
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-violet-600 bg-white text-violet-600"
                    : "border-canvas-line bg-white text-ink-faint"
                }`}
                style={{ left: `calc(${at * 100}% - ${at * 28}px)` }}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
              </span>
            );
          })}
        </div>
        {total > 0 && (
          <p className="mt-2 text-xs text-ink-faint">
            {completed} of {total} completed
          </p>
        )}
      </div>

      {/* ── Alerts card ── */}
      <div className="rounded-2xl bg-violet-50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-soft">
            <Bell className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-extrabold text-ink">Get real-time updates</p>
            <p className="text-xs text-ink-soft">
              {alertsRequested
                ? "Notifications are coming soon — we've noted your interest."
                : "Turn on notifications and never miss an update."}
            </p>
          </div>
          {!alertsRequested && (
            <button
              type="button"
              onClick={() => setAlertsRequested(true)}
              className="rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-soft transition-all duration-200 hover:bg-violet-700 active:scale-95"
            >
              Enable Alerts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
