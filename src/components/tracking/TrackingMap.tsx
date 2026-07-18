import { memo, useEffect, useMemo, useRef, useState } from "react";
import { US_STATES, US_MAP_W, US_MAP_H } from "@/components/home/usMapGeo";
import { STATE_ABBR, SMALL_LABEL_STATES } from "@/components/home/map/stateAbbr";
import { curvedPath, easeInOut } from "@/components/home/map/journeyEngine";
import { StatusCard } from "@/components/home/map/StatusCard";
import {
  OriginMarker,
  CurrentPin,
  DestinationMarker,
  DeliveredMarker,
} from "@/components/home/map/MapMarkers";
import { ZoomControls } from "@/components/home/map/ZoomControls";
import { useMapCamera } from "@/components/home/map/useMapCamera";
import { useMapScale } from "@/components/home/map/useMapScale";
import { projectLatLng } from "@/utils/projection";
import { formatPlace } from "@/utils/format";
import type { Shipment, RouteData } from "@/types/shipment";

const ROUTE_BLUE = "#2E9BFF";

interface TrackingMapProps {
  shipment: Shipment;
  route: RouteData | null;
}

/**
 * TrackingMap — the customer's real shipment on the branded US map.
 *
 * Identical visual language to the homepage network map (same landmass,
 * labels, markers, cards, camera). Differences in behavior:
 *  - Origin/destination come from the shipment's actual Airtable coordinates.
 *  - If the API supplied a real driving route (Mapbox), it is projected and
 *    drawn; otherwise an elegant curved arc is used.
 *  - On mount, the route draws and the pin travels ONCE to exactly the
 *    shipment's Progress percentage, then rests there.
 */
function TrackingMapInner({ shipment, route }: TrackingMapProps) {
  const routeRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGGElement>(null);
  const [settled, setSettled] = useState(false);
  const [pinPoint, setPinPoint] = useState<{ x: number; y: number } | null>(null);

  const { k, kRef } = useMapScale();
  const cam = useMapCamera();

  const delivered = shipment.progress >= 100 || shipment.status === "Delivered";
  const fraction = Math.min(Math.max(shipment.progress, 0), 100) / 100;

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // ── Project shipment geography onto the map ──
  const geometry = useMemo(() => {
    const origin = projectLatLng(shipment.origin.lat, shipment.origin.lng);
    const dest = projectLatLng(shipment.destination.lat, shipment.destination.lng);
    if (!origin || !dest) return null; // outside the US projection

    let path: string;
    if (route && route.geometry.length > 1) {
      const pts = route.geometry
        .map(([lng, lat]) => projectLatLng(lat, lng))
        .filter((p): p is [number, number] => p !== null);
      path =
        pts.length > 1
          ? `M ${pts.map(([x, y]) => `${x} ${y}`).join(" L ")}`
          : curvedPath({ x: origin[0], y: origin[1] }, { x: dest[0], y: dest[1] }, 0);
    } else {
      path = curvedPath({ x: origin[0], y: origin[1] }, { x: dest[0], y: dest[1] }, 0);
    }
    return { origin, dest, path };
  }, [shipment, route]);

  // ── One-shot animation to the shipment's exact progress ──
  useEffect(() => {
    const pathEl = routeRef.current;
    const pin = pinRef.current;
    if (!pathEl || !pin || !geometry) return;

    setSettled(false);
    const length = pathEl.getTotalLength();
    const target = length * fraction;
    pathEl.setAttribute("stroke-dasharray", String(length));
    pathEl.setAttribute("stroke-dashoffset", String(length));
    pin.style.opacity = "0";

    let raf = 0;
    const duration = reduced ? 1 : 1900;
    const start = performance.now();

    const finish = () => {
      const pt = pathEl.getPointAtLength(target);
      setPinPoint({ x: pt.x, y: pt.y });
      setSettled(true);
    };

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = easeInOut(t) * fraction;
      pathEl.setAttribute("stroke-dashoffset", String(length * (1 - eased)));
      const pt = pathEl.getPointAtLength(length * eased);
      pin.setAttribute("transform", `translate(${pt.x}, ${pt.y}) scale(${kRef.current})`);
      if (!delivered) pin.style.opacity = fraction > 0 ? "1" : "0";
      if (t < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [geometry, fraction, delivered, reduced, kRef]);

  if (!geometry) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl bg-canvas-tint p-6 text-center text-sm text-ink-soft">
        Map preview isn't available for this route, but your shipment details and
        timeline are fully up to date.
      </div>
    );
  }

  const [ox, oy] = geometry.origin;
  const [dx, dy] = geometry.dest;

  return (
    <div className="relative h-full w-full">
      <ZoomControls
        onZoomIn={() => cam.zoomAt(1.5)}
        onZoomOut={() => cam.zoomAt(1 / 1.5)}
        onLocate={() => pinPoint && cam.centerOn(pinPoint.x, pinPoint.y)}
        canZoomIn={cam.canZoomIn}
        canZoomOut={cam.canZoomOut}
      />

      <svg
        ref={cam.svgRef}
        viewBox={`0 0 ${US_MAP_W} ${US_MAP_H}`}
        className="h-full w-full"
        role="img"
        aria-label={`Map of shipment ${shipment.trackingNumber} from ${shipment.origin.city} to ${shipment.destination.city}`}
        {...cam.pointerHandlers}
        style={{
          cursor: cam.camera.scale > 1 ? "grab" : "default",
          touchAction: cam.camera.scale > 1 ? "none" : "auto",
        }}
      >
        <defs>
          <filter id="track-route-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="track-route-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ROUTE_BLUE} stopOpacity="0.45" />
            <stop offset="100%" stopColor={ROUTE_BLUE} stopOpacity="1" />
          </linearGradient>
        </defs>

        <g
          style={{
            transform: `translate(${cam.camera.tx}px, ${cam.camera.ty}px) scale(${cam.camera.scale})`,
            transition: cam.isDragging() ? "none" : "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <g
            fill="#FFFFFF"
            stroke="#DCE6F2"
            strokeWidth="1"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 10px 22px rgba(33,90,180,0.13))" }}
          >
            {US_STATES.map((s) => (
              <path key={s.name} d={s.d} />
            ))}
          </g>

          <g style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} aria-hidden="true">
            {US_STATES.map((s) => {
              const abbr = STATE_ABBR[s.name];
              if (!abbr) return null;
              const small = SMALL_LABEL_STATES.has(abbr);
              return (
                <text
                  key={abbr}
                  x={s.cx}
                  y={s.cy}
                  textAnchor="middle"
                  fontSize={(small ? 7.5 : 12) * (k > 1 ? 1.3 : 1)}
                  fontWeight={600}
                  fill="#9AA7BD"
                  letterSpacing="0.06em"
                >
                  {abbr}
                </text>
              );
            })}
          </g>

          {/* Faint full route (road ahead) + animated completed portion */}
          <path d={geometry.path} fill="none" stroke={ROUTE_BLUE} strokeWidth={2 * k} strokeLinecap="round" opacity={0.18} />
          <path
            ref={routeRef}
            d={geometry.path}
            fill="none"
            stroke="url(#track-route-stroke)"
            strokeWidth={3.6 * k}
            strokeLinecap="round"
            filter={k > 1 ? undefined : "url(#track-route-glow)"}
          />

          {/* Origin */}
          <g transform={`translate(${ox} ${oy}) scale(${k})`}>
            <OriginMarker x={0} y={0} />
          </g>
          <StatusCard
            x={ox}
            y={oy}
            label="From"
            value={formatPlace(shipment.origin.city, shipment.origin.state) || shipment.origin.city}
            accent="blue"
            k={k}
          />

          {/* Destination */}
          {delivered ? (
            <>
              <g transform={`translate(${dx} ${dy}) scale(${k})`}>
                <DeliveredMarker x={0} y={0} />
              </g>
              {settled && (
                <StatusCard
                  x={dx}
                  y={dy}
                  label="Delivered"
                  value={
                    formatPlace(shipment.destination.city, shipment.destination.state) ||
                    shipment.destination.city
                  }
                  accent="green"
                  fadeIn
                  k={k}
                />
              )}
            </>
          ) : (
            <g transform={`translate(${dx} ${dy}) scale(${k})`}>
              <DestinationMarker x={0} y={0} />
            </g>
          )}

          {/* Traveling pin + in-transit card once it has settled */}
          {!delivered && <CurrentPin ref={pinRef} />}
          {!delivered && settled && pinPoint && (
            <StatusCard
              x={pinPoint.x}
              y={pinPoint.y - 34 * k}
              label={shipment.status}
              value={shipment.currentLocation.city || `${Math.round(shipment.progress)}% of route complete`}
              accent="blue"
              fadeIn
              k={k}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

export const TrackingMap = memo(TrackingMapInner);
