import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { US_STATES, US_MAP_W, US_MAP_H } from "../usMapGeo";
import { STATE_ABBR, SMALL_LABEL_STATES } from "./stateAbbr";
import { buildJourneys, easeInOut, JOURNEYS_PER_LOOP, type Journey } from "./journeyEngine";
import { StatusCard } from "./StatusCard";
import { OriginMarker, CurrentPin, DestinationMarker, DeliveredMarker } from "./MapMarkers";
import { MapDecorations } from "./MapDecorations";
import { ZoomControls } from "./ZoomControls";

/**
 * USDeliveryMap — reference-styled tracking map.
 *
 * The journey simulation (50 randomized shipments per loop, route drawing,
 * traveling pin, delivered state, timings, tab-visibility pause) is the exact
 * engine from the previous version — only the presentation changed:
 *  - soft blue-white canvas, drop-shadowed lower-48 with labeled states
 *  - glowing sky-blue route, teardrop current pin with halo rings
 *  - floating white status cards with pointer tails (real journey data)
 *  - zoom (+/−), locate, and drag-to-pan camera
 *  - internal "Shipment X of 50" counter removed from the interface
 */

const ROUTE_BLUE = "#2E9BFF";
const MIN_SCALE = 1;
const MAX_SCALE = 3;

type Phase = "traveling" | "delivered";

function USDeliveryMapInner() {
  const [journeys, setJourneys] = useState<Journey[]>(() => buildJourneys());
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("traveling");

  const routeRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGGElement>(null);
  const beaconPos = useRef({ x: US_MAP_W / 2, y: US_MAP_H / 2 });

  // ── Camera (zoom + pan) ──
  const [camera, setCamera] = useState({ scale: 1, tx: 0, ty: 0 });
  const dragState = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const journey = journeys[index];

  // ── Animation loop: identical behavior to previous implementation ──
  useEffect(() => {
    const pathEl = routeRef.current;
    const pin = pinRef.current;
    if (!pathEl || !pin) return;

    const length = pathEl.getTotalLength();
    pathEl.setAttribute("stroke-dasharray", String(length));
    pathEl.setAttribute("stroke-dashoffset", String(length));
    pin.style.opacity = "0";

    let raf = 0;
    let holdTimer = 0;
    let elapsed = 0;
    let last = performance.now();
    let running = true;
    const duration = reduced ? 1 : journey.travelMs;

    const advance = () => {
      setPhase("traveling");
      setIndex((i) => {
        if (i + 1 < JOURNEYS_PER_LOOP) return i + 1;
        setJourneys(buildJourneys());
        return 0;
      });
    };

    const step = (now: number) => {
      if (!running) return;
      elapsed += now - last;
      last = now;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOut(t);

      pathEl.setAttribute("stroke-dashoffset", String(length * (1 - eased)));
      const pt = pathEl.getPointAtLength(length * eased);
      beaconPos.current = { x: pt.x, y: pt.y };
      pin.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      pin.style.opacity = t > 0.02 && t < 0.99 ? "1" : "0";

      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setPhase("delivered");
        holdTimer = window.setTimeout(advance, reduced ? 400 : 2500);
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(step);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(holdTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [journey, reduced]);

  // ── Camera helpers ──
  const clampCamera = useCallback((scale: number, tx: number, ty: number) => {
    const minTx = US_MAP_W - scale * US_MAP_W;
    const minTy = US_MAP_H - scale * US_MAP_H;
    return {
      scale,
      tx: Math.min(0, Math.max(minTx, tx)),
      ty: Math.min(0, Math.max(minTy, ty)),
    };
  }, []);

  const zoomAt = useCallback(
    (factor: number) => {
      setCamera((c) => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, c.scale * factor));
        if (scale === MIN_SCALE) return { scale: 1, tx: 0, ty: 0 };
        // Keep the viewport center stable while zooming.
        const cx = (US_MAP_W / 2 - c.tx) / c.scale;
        const cy = (US_MAP_H / 2 - c.ty) / c.scale;
        return clampCamera(scale, US_MAP_W / 2 - scale * cx, US_MAP_H / 2 - scale * cy);
      });
    },
    [clampCamera],
  );

  const locate = useCallback(() => {
    const { x, y } = beaconPos.current;
    const scale = Math.max(1.8, camera.scale);
    setCamera(clampCamera(scale, US_MAP_W / 2 - scale * x, US_MAP_H / 2 - scale * y));
  }, [camera.scale, clampCamera]);

  // ── Drag to pan (only when zoomed in) ──
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (camera.scale === 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, tx: camera.tx, ty: camera.ty };
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragState.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const unit = US_MAP_W / svg.clientWidth; // css px → viewBox units
    setCamera((c) =>
      clampCamera(c.scale, d.tx + (e.clientX - d.startX) * unit, d.ty + (e.clientY - d.startY) * unit),
    );
  };
  const onPointerUp = () => (dragState.current = null);

  const originLabelY = journey.origin.y;
  const destX = journey.dest.x;
  const destY = journey.dest.y;

  return (
    <div className="relative h-full w-full">
      <ZoomControls
        onZoomIn={() => zoomAt(1.5)}
        onZoomOut={() => zoomAt(1 / 1.5)}
        onLocate={locate}
        canZoomIn={camera.scale < MAX_SCALE}
        canZoomOut={camera.scale > MIN_SCALE}
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${US_MAP_W} ${US_MAP_H}`}
        className="h-full w-full"
        role="img"
        aria-label="Animated map of live Linus Delivery shipments across the United States"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          cursor: camera.scale > 1 ? "grab" : "default",
          touchAction: camera.scale > 1 ? "none" : "auto",
        }}
      >
        <defs>
          <pattern id="us-grid" width="46" height="46" patternUnits="userSpaceOnUse">
            <path d="M 46 0 L 0 0 0 46" fill="none" stroke="#E4EEFA" strokeWidth="1" />
          </pattern>
          <filter id="route-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="route-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ROUTE_BLUE} stopOpacity="0.45" />
            <stop offset="100%" stopColor={ROUTE_BLUE} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Soft blue-white canvas + faint grid */}
        <rect width={US_MAP_W} height={US_MAP_H} fill="#F5F9FE" />
        <rect width={US_MAP_W} height={US_MAP_H} fill="url(#us-grid)" opacity="0.5" />
        <MapDecorations />

        {/* Camera group — CSS transition gives smooth zoom/locate movement */}
        <g
          style={{
            transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`,
            transition: dragState.current ? "none" : "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Drop-shadowed landmass with thin light borders */}
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

          {/* State abbreviation labels */}
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
                  fontSize={small ? 7.5 : 12}
                  fontWeight={600}
                  fill="#9AA7BD"
                  letterSpacing="0.06em"
                >
                  {abbr}
                </text>
              );
            })}
          </g>

          {/* Active route — glowing blue, same drawing animation */}
          <path
            ref={routeRef}
            d={journey.path}
            fill="none"
            stroke="url(#route-stroke)"
            strokeWidth="3.6"
            strokeLinecap="round"
            filter="url(#route-glow)"
          />

          <OriginMarker x={journey.origin.x} y={journey.origin.y} />
          <StatusCard
            x={journey.origin.x}
            y={originLabelY}
            label="Starting Point"
            value={journey.originState}
            accent="blue"
          />

          {phase === "traveling" ? (
            <DestinationMarker x={destX} y={destY} />
          ) : (
            <>
              <DeliveredMarker x={destX} y={destY} />
              <StatusCard
                x={destX}
                y={destY}
                label="Delivered"
                value={`${journey.dest.city}, ${journey.dest.state}`}
                accent="green"
                fadeIn
              />
            </>
          )}

          <CurrentPin ref={pinRef} />
        </g>
      </svg>
    </div>
  );
}

export const USDeliveryMap = memo(USDeliveryMapInner);
