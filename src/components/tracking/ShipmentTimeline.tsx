import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { formatDate, formatPlace } from "@/utils/format";
import { iconForStatus } from "./stages";
import type { ShipmentJourney } from "@/hooks/useShipmentJourney";

const COLLAPSED_COUNT = 5;

/**
 * Vertical shipment journey.
 * Pure rendering — every step and its state comes from the shared journey
 * object, so the highlighted step is always the one the map marker sits on.
 */
export function ShipmentTimeline({ journey }: { journey: ShipmentJourney }) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? journey.steps : journey.steps.slice(0, COLLAPSED_COUNT);
  const hidden = journey.steps.length - COLLAPSED_COUNT;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Shipment progress"
      className="card rounded-2xl p-4 sm:p-5"
    >
      <h3 className="text-sm font-extrabold text-ink">Shipment Progress</h3>

      <ol className="mt-4">
        {visible.map(({ event, state }, i) => {
          const Icon = iconForStatus(event.status);
          const isLast = i === visible.length - 1;
          const place = formatPlace(event.city, event.state, event.country);

          return (
            <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-9 h-[calc(100%-24px)] w-0.5 rounded-full ${
                    state === "pending" ? "bg-canvas-line" : "bg-brand-200"
                  }`}
                />
              )}

              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                {state === "current" && (
                  <span className="absolute inset-0 animate-pin-pulse rounded-full bg-brand-500/30" />
                )}
                <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    state === "completed"
                      ? "border-brand-600 bg-brand-600 text-white"
                      : state === "current"
                        ? "border-brand-600 bg-white text-brand-600"
                        : "border-canvas-line bg-white text-ink-faint"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                </span>
              </span>

              <div
                className={`min-w-0 flex-1 rounded-xl px-3 py-2 transition-colors ${
                  state === "current" ? "bg-brand-50/70 ring-1 ring-brand-100" : ""
                } ${state === "pending" ? "opacity-55" : ""}`}
              >
                <p
                  className={`text-[13px] font-bold leading-snug ${
                    state === "current" ? "text-brand-700" : "text-ink"
                  }`}
                >
                  {event.status}
                </p>
                {place && <p className="mt-0.5 truncate text-[11.5px] text-ink-soft">{place}</p>}
                {(event.date || event.time) && (
                  <p className="mt-0.5 text-[11px] font-medium text-ink-faint">
                    {event.date ? formatDate(event.date) : ""}
                    {event.date && event.time ? " · " : ""}
                    {event.time}
                  </p>
                )}
                {state === "current" && (
                  <p className="mt-1 text-[11px] font-semibold text-brand-600">
                    Your shipment is here now
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-canvas-line bg-white px-3.5 py-2 text-xs font-bold text-brand-600 shadow-soft transition-all duration-200 hover:border-brand-200 hover:bg-brand-50"
        >
          {expanded ? "Show Less" : `View Full History (${hidden} more)`}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            strokeWidth={2.5}
          />
        </button>
      )}
    </motion.section>
  );
}
