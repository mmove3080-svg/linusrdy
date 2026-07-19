import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { Shipment, TimelineEvent } from "@/types/shipment";
import { formatDate, formatPlace } from "@/utils/format";

const COLLAPSED_COUNT = 4;

type EventState = "completed" | "current" | "future";

/**
 * Vertical shipment timeline.
 * Completed events: green checks. Current event: highlighted blue with pulse.
 * Future events: gray. Collapses to the most recent events with a
 * "View Full History" toggle.
 */
export function ShipmentTimeline({ shipment }: { shipment: Shipment }) {
  const [expanded, setExpanded] = useState(false);

  // Newest first for display; event state derived from the shipment status.
  const annotated = useMemo(() => {
    const asc = [...shipment.timeline].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIdx = shipment.status === "Delivered"
      ? -1 // everything completed
      : (() => {
          for (let i = asc.length - 1; i >= 0; i--) {
            if (asc[i].status === shipment.status) return i;
          }
          return asc.length - 1;
        })();
    return asc
      .map((event, i): { event: TimelineEvent; state: EventState } => ({
        event,
        state:
          shipment.status === "Delivered" || i < currentIdx
            ? "completed"
            : i === currentIdx
              ? "current"
              : "future",
      }))
      .reverse();
  }, [shipment]);

  const visible = expanded ? annotated : annotated.slice(0, COLLAPSED_COUNT);
  const hiddenCount = annotated.length - COLLAPSED_COUNT;

  return (
    <div>
      <h3 className="text-[15px] font-extrabold text-ink">Tracking Journey</h3>

      <ol className="mt-4">
        {visible.map(({ event, state }, i) => (
          <li
            key={event.id}
            className={`relative flex gap-3 pb-5 last:pb-0 ${
              state === "current"
                ? "-mx-2.5 rounded-xl bg-violet-50/80 px-2.5 pt-2.5 ring-1 ring-violet-100"
                : ""
            }`}
          >
            {/* Connector line */}
            {i < visible.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-7 h-[calc(100%-14px)] w-0.5 rounded-full ${
                  state === "future" ? "bg-canvas-line" : "bg-emerald-200"
                }`}
              />
            )}

            {/* Node */}
            <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
              {state === "completed" && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              {state === "current" && (
                <>
                  <span className="absolute h-6 w-6 animate-pin-pulse rounded-full bg-violet-600/30" />
                  <span className="relative h-3.5 w-3.5 rounded-full border-[3px] border-violet-600 bg-violet-600" />
                </>
              )}
              {state === "future" && (
                <span className="h-3 w-3 rounded-full border-2 border-canvas-line bg-white" />
              )}
            </span>

            {/* Content */}
            <div className={`min-w-0 ${state === "future" ? "opacity-55" : ""}`}>
              <p
                className={`text-[13px] font-bold leading-snug ${
                  state === "current" ? "text-violet-700" : "text-ink"
                }`}
              >
                {event.status}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink-soft">
                {formatPlace(event.city, event.state, event.country)}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-ink-faint">
                {formatDate(event.date)}
                {event.time ? ` · ${event.time}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-violet-100 bg-white px-3.5 py-2 text-xs font-bold text-violet-600 shadow-soft transition-all duration-200 hover:border-violet-200 hover:bg-violet-50"
        >
          {expanded ? "Show Less" : `View Full History (${hiddenCount} more)`}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            strokeWidth={2.5}
          />
        </button>
      )}
    </div>
  );
}
