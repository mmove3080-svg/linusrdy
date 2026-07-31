import { memo, useEffect, useMemo, useRef, useState } from "react";
import { US_STATES, US_MAP_W, US_MAP_H } from "@/components/home/usMapGeo";
import { STATE_ABBR, SMALL_LABEL_STATES } from "@/components/home/map/stateAbbr";
import { easeInOut } from "@/components/home/map/journeyEngine";
import { StatusCard } from "@/components/home/map/StatusCard";
import { OriginMarker, TruckMarker, DeliveredMarker } from "@/components/home/map/MapMarkers";
import { ZoomControls } from "@/components/home/map/ZoomControls";
import { useMapCamera } from "@/components/home/map/useMapCamera";
import { useMapScale } from "@/components/home/map/useMapScale";
import { projectLatLng } from "@/utils/projection";
import { formatDate, formatPlace } from "@/utils/format";
import type { Shipment, RouteData } from "@/types/shipment";
import type { ShipmentJourney } from "@/hooks/useShipmentJourney";

const ROUTE_VIOLET = "#7C3AED";

interface TrackingMapProps {
  shipment: Shipment;
  route: RouteData | null;
  /** The single source of truth — supplied by the dashboard, never recomputed. */
  journey: ShipmentJourney;
  /** Fires once the truck settles at the current location. */
  onTruckArrived?: () => void;
  /** Opens the CCTV overlay. */
  onOpenCctv?: () => void;
}

/**
 * TrackingMap — plots the shipment's TRAVELED journey.
 *
 * Position logic lives entirely in `useShipmentJourney`; this component only
 * renders what that hook resolved:
 *   - polyline = journey.traveledRoute (completed steps only)
 *   - marker   = the final coordinate of traveledRoute (= currentStep.point)
 *   - popup    = journey.currentStep
 * No remaining route is drawn, and nothing here recalculates progress.
 */
function TrackingMapInner({ shipment, route, journey, onTruckArrived, onOpenCctv }: TrackingMapProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGGElement>(null);
  const [settled, setSettled] = useState(false);

  const { k, kRef } = useMapScale();
  const cam = useMapCamera();

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // ── Project the traveled journey onto the map ──
  const geometry = useMemo(() => {
    const projected = journey.traveledRoute
      .map(([lng, lat]) => projectLatLng(lat, lng))
      .filter((p): p is [number, number] => p !== null);
    if (projected.length === 0) return null;

    // With real driving geometry available, follow the road for the traveled
    // portion; otherwise connect the scan points directly.
    let path: string;
    if (route && route.geometry.length > 1 && journey.steps.length > 1) {
      const fraction = journey.currentIndex / (journey.steps.length - 1);
      const cut = Math.max(2, Math.round(route.geometry.length * fraction));
      const roadPoints = route.geometry
        .slice(0, cut)
        .map(([lng, lat]) => projectLatLng(lat, lng))
        .filter((p): p is [number, number] => p !== null);
      path =
        roadPoints.length > 1
          ? `M ${roadPoints.map(([x, y]) => `${x} ${y}`).join(" L ")}`
          : polyline(projected);
    } else {
      path = polyline(projected);
    }

    return { path, points: projected, end: projected[projected.length - 1] };
  }, [journey, route]);

  // ── Draw the traveled route, then rest the marker at its final point ──
  useEffect(() => {
    const pathEl = pathRef.current;
    const pin = pinRef.current;
    if (!pathEl || !pin || !geometry) return;

    setSettled(false);
    const length = pathEl.getTotalLength();
    pathEl.setAttribute("stroke-dasharray", String(length));
    pathEl.setAttribute("stroke-dashoffset", String(length));
    pin.style.opacity = "0";

    let raf = 0;
    // Slow, deliberate travel — the route draws progressively behind the truck.
    // Slow, watchable journey — the route draws steadily behind the truck.
    const duration = reduced ? 1 : 6500;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = easeInOut(t);
      pathEl.setAttribute("stroke-dashoffset", String(length * (1 - eased)));
      const pt = pathEl.getPointAtLength(length * eased);
      pin.setAttribute("transform", `translate(${pt.x}, ${pt.y}) scale(${kRef.current})`);
      if (!journey.delivered) pin.style.opacity = "1";
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setSettled(true);
        onTruckArrived?.();
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [geometry, journey.delivered, reduced, kRef, onTruckArrived]);

  if (!geometry) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl bg-canvas-tint p-6 text-center text-sm text-ink-soft">
        Map preview isn't available for this route, but your shipment details and
        timeline are fully up to date.
      </div>
    );
  }

  const originPoint = geometry.points[0];
  const currentPoint = geometry.end;
  const current = journey.currentStep;

  return (
    <div className="relative h-full w-full">
      <ZoomControls
        onZoomIn={() => cam.zoomAt(1.5)}
        onZoomOut={() => cam.zoomAt(1 / 1.5)}
        onLocate={() => cam.centerOn(currentPoint[0], currentPoint[1])}
        canZoomIn={cam.canZoomIn}
        canZoomOut={cam.canZoomOut}
      />

      <svg
        ref={cam.svgRef}
        viewBox={`0 0 ${US_MAP_W} ${US_MAP_H}`}
        className="h-full w-full"
        role="img"
        aria-label={`Map of shipment ${shipment.trackingNumber}, currently ${current?.event.status ?? shipment.status}`}
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
            <stop offset="0%" stopColor={ROUTE_VIOLET} stopOpacity="0.45" />
            <stop offset="100%" stopColor={ROUTE_VIOLET} stopOpacity="1" />
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

          {/* TRAVELED ROUTE ONLY — no remaining route is drawn */}
          <path
            ref={pathRef}
            d={geometry.path}
            fill="none"
            stroke="url(#track-route-stroke)"
            strokeWidth={3.6 * k}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={k > 1 ? undefined : "url(#track-route-glow)"}
          />

          {/* Completed scan points along the traveled route */}
          {geometry.points.slice(1, -1).map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3 * k}
              fill="#FFFFFF"
              stroke={ROUTE_VIOLET}
              strokeWidth={1.8 * k}
            />
          ))}

          {/* Origin */}
          <g transform={`translate(${originPoint[0]} ${originPoint[1]}) scale(${k})`}>
            <OriginMarker x={0} y={0} />
          </g>
          <StatusCard
            x={originPoint[0]}
            y={originPoint[1]}
            label="From"
            value={formatPlace(shipment.origin.city, shipment.origin.state) || shipment.origin.city}
            accent="blue"
            k={k}
          />

          {/* Current position — the end of the traveled route */}
          {journey.delivered ? (
            <g transform={`translate(${currentPoint[0]} ${currentPoint[1]}) scale(${k})`}>
              <DeliveredMarker x={0} y={0} />
            </g>
          ) : (
            <g
              onClick={onOpenCctv}
              style={{ cursor: onOpenCctv ? "pointer" : "default" }}
              role={onOpenCctv ? "button" : undefined}
              aria-label={onOpenCctv ? "Watch live delivery truck CCTV footage" : undefined}
            >
              <TruckMarker ref={pinRef} />
            </g>
          )}

          {/* Popup reads the SAME currentStep the timeline highlights */}
          {settled && current && (
            <StatusCard
              x={currentPoint[0]}
              y={currentPoint[1] - (journey.delivered ? 0 : 34 * k)}
              label={journey.delivered ? "Delivered" : current.event.status}
              value={
                formatPlace(current.event.city, current.event.state, current.event.country) ||
                shipment.currentLocation.city ||
                shipment.destination.city
              }
              detail={
                current.event.date
                  ? `${formatDate(current.event.date)}${current.event.time ? ` • ${current.event.time}` : ""}`
                  : undefined
              }
              accent={journey.delivered ? "green" : "violet"}
              fadeIn
              k={k}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

function polyline(points: [number, number][]): string {
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M ${x} ${y} L ${x + 0.01} ${y}`;
  }
  return `M ${points.map(([x, y]) => `${x} ${y}`).join(" L ")}`;
}

export const TrackingMap = memo(TrackingMapInner);
