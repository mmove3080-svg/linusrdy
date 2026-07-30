import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { formatDate, formatPlace } from "@/utils/format";
import type { ShipmentJourney } from "@/hooks/useShipmentJourney";
import { AlertsCard } from "./AlertsCard";

const COLLAPSED_COUNT = 4;

/**
 * Tracking Journey — the reference design.
 * Completed steps: green check discs joined by a green rail.
 * Current step: violet disc on a tinted violet card.
 * Pending steps: small hollow gray discs.
 *
 * Ordering is decided upstream in useShipmentJourney (via sortJourneyEvents),
 * so this component renders the sequence exactly as resolved — it never sorts.
 */
export function ShipmentTimeline({ journey }: { journey: ShipmentJourney }) {
  // Every stage is visible by default — future stages simply render faded.
  const [expanded, setExpanded] = useState(true);

  const visible = expanded ? journey.steps : journey.steps.slice(0, COLLAPSED_COUNT);
  const hidden = journey.steps.length - COLLAPSED_COUNT;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Tracking journey"
      className="h-full"
    >
      <h3 className="text-[14px] font-extrabold text-ink sm:text-[15px]">Tracking Journey</h3>

      <ol className="mt-4">
        {visible.map(({ event, state }, i) => {
          const isLast = i === visible.length - 1;
          const place = formatPlace(event.city, event.state, event.country);

          return (
            <li
              key={event.id}
              className={`relative flex gap-3 pb-4 last:pb-0 ${
                state === "current" ? "-mx-3 rounded-xl bg-violet-50/80 px-3 pt-3" : ""
              }`}
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[11px] top-7 h-[calc(100%-14px)] w-[2px] rounded-full ${
                    state === "completed" ? "bg-emerald-300" : "bg-canvas-line"
                  }`}
                />
              )}

              <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                {state === "completed" && (
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3 w-3" strokeWidth={3.2} aria-hidden="true" />
                  </span>
                )}
                {state === "current" && (
                  <>
                    <span className="absolute h-6 w-6 animate-pin-pulse rounded-full bg-violet-500/30" />
                    <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full bg-violet-600">
                      <span className="h-[7px] w-[7px] rounded-[2px] bg-white" />
                    </span>
                  </>
                )}
                {state === "pending" && (
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-canvas-line bg-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-canvas-line" />
                  </span>
                )}
              </span>

              <div className={`min-w-0 flex-1 ${state === "pending" ? "opacity-60" : ""}`}>
                <p
                  className={`text-[12.5px] font-bold leading-snug sm:text-[13.5px] ${
                    state === "current" ? "text-violet-700" : "text-ink"
                  }`}
                >
                  {event.status}
                </p>
                {place && <p className="mt-0.5 truncate text-[11px] text-ink-soft sm:text-[12px]">{place}</p>}
                {(event.date || event.time) && (
                  <p className="mt-0.5 text-[10.5px] text-ink-faint sm:text-[11.5px]">
                    {event.date ? formatDate(event.date) : ""}
                    {event.date && event.time ? " • " : ""}
                    {event.time}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {(hidden > 0 || journey.steps.length > 0) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          disabled={hidden <= 0}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-violet-100 bg-white px-4 py-2.5 text-xs font-bold text-violet-700 shadow-soft transition-all duration-200 enabled:hover:border-violet-200 enabled:hover:bg-violet-50 disabled:cursor-default disabled:opacity-70"
        >
          {expanded ? "Show Less History" : "View Full History"}
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            strokeWidth={2.5}
          />
        </button>
      )}

      <AlertsCard />
    </motion.section>
  );
}
