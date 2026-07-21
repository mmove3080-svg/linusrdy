import { useCallback, useRef, useState } from "react";
import type { TrackingResponse } from "@/types/shipment";
import { fetchTracking, TrackingApiError } from "@/services/trackingApi";
import { TRACKING_NUMBER_PATTERN } from "@/lib/constants";
import { normalizeTrackingNumber } from "@/utils/format";

export type TrackingState =
  | { status: "idle" }
  | { status: "loading"; number: string }
  | { status: "success"; number: string; data: TrackingResponse }
  | { status: "error"; number: string; message: string };

/** Owns the full lifecycle of a tracking lookup, including request cancellation. */
export function useTracking() {
  const [state, setState] = useState<TrackingState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const track = useCallback(async (rawNumber: string) => {
    const number = normalizeTrackingNumber(rawNumber);
    if (!TRACKING_NUMBER_PATTERN.test(number)) {
      setState({
        status: "error",
        number,
        message: "Please enter a valid tracking number (e.g. LIN123456789).",
      });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "loading", number });
    try {
      const data = await fetchTracking(number, controller.signal);
      setState({ status: "success", number, data });
    } catch (err) {
      if (controller.signal.aborted) return;
      const message =
        err instanceof TrackingApiError
          ? err.code === "NOT_FOUND"
            ? "Tracking number not found"
            : err.message
          : "Unable to look up this shipment right now. Please try again.";
      setState({ status: "error", number, message });
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, track, reset };
}
