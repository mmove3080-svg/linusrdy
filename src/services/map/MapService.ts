import type { PlaceInfo, RouteData } from "@/types/shipment";

/**
 * Map provider abstraction.
 *
 * Components depend on this interface only. `MapboxMapService` is the V1
 * implementation; swapping providers (or mocking in tests) means writing
 * one new class — no component changes.
 */
export interface ShipmentMapOptions {
  container: HTMLElement;
  route: RouteData;
  origin: PlaceInfo;
  destination: PlaceInfo;
  /** 0–100 — the truck animates from 0 to exactly this point */
  progress: number;
}

export interface MapService {
  /** Initialize the map, draw route + markers, and animate the truck to `progress`. */
  mount(options: ShipmentMapOptions): Promise<void>;
  /** Re-animate the truck to a new progress value (e.g. after data refresh). */
  setProgress(progress: number): void;
  /** Tear down the map instance and cancel animations. */
  destroy(): void;
}
