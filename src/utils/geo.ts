import type { GeoPoint, RouteGeometry } from "@/types/shipment";

/** Haversine distance in meters between two [lng, lat] coordinates. */
export function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Cumulative distances (meters) along a route. cum[i] = distance from start to point i. */
export function cumulativeDistances(route: RouteGeometry): number[] {
  const cum: number[] = [0];
  for (let i = 1; i < route.length; i++) {
    cum.push(cum[i - 1] + haversineMeters(route[i - 1], route[i]));
  }
  return cum;
}

/**
 * Point at `fraction` (0–1) of the total route length, linearly interpolated
 * between the two surrounding vertices. This is what places the truck at
 * exactly `progress%` of the journey.
 */
export function pointAtFraction(
  route: RouteGeometry,
  cum: number[],
  fraction: number,
): { point: [number, number]; bearing: number; index: number } {
  const total = cum[cum.length - 1];
  const clamped = Math.min(Math.max(fraction, 0), 1);
  const target = total * clamped;

  // Binary search for the segment containing `target`.
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const segStart = route[i - 1];
  const segEnd = route[i];
  const segLen = cum[i] - cum[i - 1] || 1;
  const t = (target - cum[i - 1]) / segLen;

  const point: [number, number] = [
    segStart[0] + (segEnd[0] - segStart[0]) * t,
    segStart[1] + (segEnd[1] - segStart[1]) * t,
  ];
  return { point, bearing: bearingBetween(segStart, segEnd), index: i };
}

/** Compass bearing (degrees) from a to b, for rotating the truck icon. */
export function bearingBetween(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(b[0] - a[0]);
  const y = Math.sin(dLng) * Math.cos(toRad(b[1]));
  const x =
    Math.cos(toRad(a[1])) * Math.sin(toRad(b[1])) -
    Math.sin(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Route vertices from start up to `fraction`, ending exactly at the interpolated point. */
export function routeUpToFraction(
  route: RouteGeometry,
  cum: number[],
  fraction: number,
): RouteGeometry {
  const { point, index } = pointAtFraction(route, cum, fraction);
  return [...route.slice(0, index), point];
}

export function toGeoPoint([lng, lat]: [number, number]): GeoPoint {
  return { lat, lng };
}
