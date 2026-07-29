import { useMemo } from "react";
import type { Shipment, TimelineEvent } from "@/types/shipment";
import { CANONICAL_STAGES, stageIndex } from "@/components/tracking/stages";

export interface JourneyStep {
  event: TimelineEvent;
  index: number;
  state: "completed" | "current" | "pending";
  /** Map position for this step, in [lng, lat] order. */
  point: [number, number];
}

export interface ShipmentJourney {
  /** Every step, sorted by Sort Order. */
  steps: JourneyStep[];
  /** Index of the current step — resolved exactly ONCE, here. */
  currentIndex: number;
  /** The one record every part of the UI reads from. */
  currentStep: JourneyStep | null;
  /** Completed portion only: steps[0..currentIndex]. The map polyline. */
  traveledRoute: [number, number][];
  /** Journey completion 0–100, derived from currentIndex — never a second field. */
  progressPercent: number;
  delivered: boolean;
}

/**
 * THE single source of truth for "where is this shipment".
 *
 * Everything — timeline, polyline, marker, popup, banner, ETA, progress
 * readout — derives from this hook. Nothing else may compute a current
 * position, so nothing can disagree.
 *
 * Resolution order for the current step:
 *   1. exact match on the shipment's Status (latest occurrence wins)
 *   2. keyword match against the canonical journey stages
 *   3. the Progress field, mapped onto the number of steps
 * Delivered shipments always resolve to the final step.
 */
export function useShipmentJourney(shipment: Shipment): ShipmentJourney {
  return useMemo(() => {
    const delivered = shipment.status === "Delivered" || shipment.progress >= 100;

    // ── Build the ordered step list ──
    const sorted: TimelineEvent[] =
      shipment.timeline.length > 0
        ? [...shipment.timeline].sort((a, b) => a.sortOrder - b.sortOrder)
        : CANONICAL_STAGES.map((stage, i) => ({
            id: `stage-${i}`,
            status: stage,
            city: i === 0 ? shipment.origin.city : i === CANONICAL_STAGES.length - 1 ? shipment.destination.city : "",
            country: "",
            date: "",
            time: "",
            sortOrder: i,
          }));

    // ── Resolve the current index ONCE ──
    const currentIndex = resolveCurrentIndex(sorted, shipment, delivered);

    // ── Give every step a map coordinate ──
    const origin: [number, number] = [shipment.origin.lng, shipment.origin.lat];
    const destination: [number, number] = [shipment.destination.lng, shipment.destination.lat];
    const points = sorted.map((event, i): [number, number] => {
      if (typeof event.lat === "number" && typeof event.lng === "number") {
        return [event.lng, event.lat]; // real scan location
      }
      // No scan coordinates: place the step proportionally between origin and
      // destination by its position in the journey — still derived from the
      // journey itself, never from a separate progress field.
      const t = sorted.length > 1 ? i / (sorted.length - 1) : 0;
      return [
        origin[0] + (destination[0] - origin[0]) * t,
        origin[1] + (destination[1] - origin[1]) * t,
      ];
    });

    const steps: JourneyStep[] = sorted.map((event, i) => ({
      event,
      index: i,
      state: i < currentIndex ? "completed" : i === currentIndex ? "current" : "pending",
      point: points[i],
    }));

    return {
      steps,
      currentIndex,
      currentStep: steps[currentIndex] ?? null,
      // Completed journey only — the polyline stops at the current location.
      traveledRoute: points.slice(0, currentIndex + 1),
      progressPercent:
        steps.length > 1 ? Math.round((currentIndex / (steps.length - 1)) * 100) : 0,
      delivered,
    };
  }, [shipment]);
}

function resolveCurrentIndex(
  sorted: TimelineEvent[],
  shipment: Shipment,
  delivered: boolean,
): number {
  if (sorted.length === 0) return 0;
  if (delivered) return sorted.length - 1;

  // 1 ── exact status match, latest occurrence
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].status.trim().toLowerCase() === shipment.status.trim().toLowerCase()) return i;
  }

  // 2 ── canonical stage match
  const target = stageIndex(shipment.status);
  if (target >= 0) {
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (stageIndex(sorted[i].status) === target) return i;
    }
  }

  // 3 ── progress fallback
  const clamped = Math.min(Math.max(shipment.progress, 0), 100);
  return Math.min(sorted.length - 1, Math.max(0, Math.round((clamped / 100) * (sorted.length - 1))));
}
