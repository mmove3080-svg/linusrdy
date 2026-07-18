/**
 * Core domain types for Linus Delivery.
 *
 * Fields marked "future" are intentionally present but optional so that
 * upcoming modules (customer portal, admin/driver dashboards, fleet
 * management, proof of delivery) never require a breaking schema change.
 */

export type ShipmentStatus =
  | "Shipment Created"
  | "Picked Up"
  | "Warehouse"
  | "In Transit"
  | "Distribution Center"
  | "Out For Delivery"
  | "Delivered"
  | "Exception"
  | "On Hold";

export type ShipmentPriority = "Standard" | "Express" | "Priority" | "Same Day";
export type ShipmentType = "Domestic" | "International" | "Freight" | "Last Mile";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PlaceInfo extends GeoPoint {
  city: string;
  state?: string;
  country: string;
}

export interface TimelineEvent {
  id: string;
  status: string;
  city: string;
  state?: string;
  country: string;
  /** ISO date, e.g. "2026-07-14" */
  date: string;
  /** Display time, e.g. "14:32" */
  time: string;
  sortOrder: number;
}

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: "cm" | "in";
}

export interface Shipment {
  trackingNumber: string;
  customerName: string;
  status: ShipmentStatus;
  courier: string;
  /** ISO date */
  estimatedDelivery: string;
  /** 0–100 — single source of truth for truck position AND timeline state */
  progress: number;

  origin: PlaceInfo;
  destination: PlaceInfo;
  currentLocation: GeoPoint & { city?: string };

  packageDetails?: string;
  timeline: TimelineEvent[];

  // ── Detail-panel fields (reference design) — all optional ──
  senderName?: string;
  receiverName?: string;
  shippingMethod?: string;
  reference?: string;
  shipmentDate?: string;
  /** e.g. "Before 8:00 PM" — shown under the estimated delivery date */
  deliveryWindow?: string;
  packagePhotoUrl?: string;
  weightLabel?: string;
  dimensionsLabel?: string;

  // ── Future fields (unused in V1, reserved for platform growth) ──
  vehicleId?: string;
  driverId?: string;
  warehouseId?: string;
  deliveryPhoto?: string;
  signature?: string;
  proofOfDelivery?: string;
  deliveryAttempts?: number;
  packageWeightKg?: number;
  packageDimensions?: PackageDimensions;
  shipmentPriority?: ShipmentPriority;
  shipmentType?: ShipmentType;
  liveTrackingEnabled?: boolean;
}

/** GeoJSON LineString coordinates as returned by Mapbox Directions: [lng, lat][] */
export type RouteGeometry = [number, number][];

export interface RouteData {
  geometry: RouteGeometry;
  /** meters */
  distance: number;
  /** seconds */
  duration: number;
}

/** Payload returned by GET /api/track */
export interface TrackingResponse {
  shipment: Shipment;
  /** null when Mapbox isn't configured — the UI draws a curved route instead */
  route: RouteData | null;
}

export interface TrackingError {
  error: string;
  code: "NOT_FOUND" | "INVALID_NUMBER" | "SERVER_ERROR" | "RATE_LIMITED";
}
