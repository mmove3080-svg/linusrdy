import type { TrackingError, TrackingResponse } from "@/types/shipment";
import { normalizeTrackingNumber } from "@/utils/format";

/**
 * Client-side tracking service.
 * Talks ONLY to our own /api/track endpoint — never to Airtable directly.
 */
export class TrackingApiError extends Error {
  constructor(
    message: string,
    public readonly code: TrackingError["code"],
  ) {
    super(message);
    this.name = "TrackingApiError";
  }
}

export async function fetchTracking(
  rawNumber: string,
  signal?: AbortSignal,
): Promise<TrackingResponse> {
  const number = normalizeTrackingNumber(rawNumber);
  const response = await fetch(`/api/track?number=${encodeURIComponent(number)}`, { signal });

  const body = (await response.json().catch(() => null)) as
    | TrackingResponse
    | TrackingError
    | null;

  if (!response.ok || body === null || "error" in body) {
    const err = body as TrackingError | null;
    throw new TrackingApiError(
      err?.error ?? "Unable to look up this shipment right now.",
      err?.code ?? "SERVER_ERROR",
    );
  }
  return body;
}
