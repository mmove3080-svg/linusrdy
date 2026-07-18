import { useEffect, useRef, useState } from "react";
import type { Shipment, RouteData, RouteGeometry } from "@/types/shipment";
import { MapboxMapService } from "@/services/map/MapboxMapService";
import { TrackingMap } from "./TrackingMap";

interface MapboxShipmentMapProps {
  shipment: Shipment;
  route: RouteData | null;
}

/**
 * 3D Mapbox shipment map.
 * Mounts the MapboxMapService (3D terrain, violet completed route, gray road
 * ahead, origin/destination pins, truck stopped at exact Progress %).
 * If Mapbox fails at runtime (bad/missing token, network), it silently falls
 * back to the branded SVG tracking map so the customer always sees a map.
 */
export function MapboxShipmentMap({ shipment, route }: MapboxShipmentMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (failed) return;
    const container = containerRef.current;
    if (!container) return;

    const service = new MapboxMapService();
    let cancelled = false;

    service
      .mount({
        container,
        route: route ?? fallbackRoute(shipment),
        origin: shipment.origin,
        destination: shipment.destination,
        progress: shipment.progress,
      })
      .catch((err) => {
        console.warn("Mapbox unavailable, falling back to SVG map:", err);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      service.destroy();
    };
  }, [shipment, route, failed]);

  if (failed) return <TrackingMap shipment={shipment} route={route} />;

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-2xl"
      role="region"
      aria-label={`3D map of shipment ${shipment.trackingNumber}`}
    />
  );
}

/** Straight-line route (interpolated) when no driving route is available. */
function fallbackRoute(shipment: Shipment): RouteData {
  const steps = 48;
  const geometry: RouteGeometry = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    geometry.push([
      shipment.origin.lng + (shipment.destination.lng - shipment.origin.lng) * t,
      shipment.origin.lat + (shipment.destination.lat - shipment.origin.lat) * t,
    ]);
  }
  return { geometry, distance: 0, duration: 0 };
}
