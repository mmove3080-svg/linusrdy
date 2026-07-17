import { memo, useEffect, useMemo, useRef, useState } from "react";
import { US_STATES, US_CITIES, US_MAP_W, US_MAP_H, type UsCity } from "./usMapGeo";

/**
 * USDeliveryMap — elegant white-themed futuristic logistics animation.
 *
 * A real (us-atlas) map of the United States with a continuous shipment
 * simulation: 50 randomly generated journeys per loop. Each journey:
 *   1. origin appears — glowing light-blue marker + state name
 *   2. destination appears — "City, State" label
 *   3. a glowing route DRAWS progressively along a natural curve
 *   4. a pulsing beacon travels the route with easing
 *   5. on arrival the destination turns GREEN with a pulse + "Delivered"
 *   6. holds ~2.5s, fades, next journey begins
 * After journey #50, the loop restarts with freshly generated routes.
 *
 * Implementation notes:
 * - One requestAnimationFrame loop mutates SVG attrs via refs (no re-render
 *   storm); React state changes only at journey boundaries.
 * - Pauses when the tab is hidden (visibilitychange) and resumes cleanly.
 * - Labels are clamped inside the viewBox so they never overflow the map.
 * - GPU-friendly: stroke-dashoffset + transform animations only.
 */

const JOURNEYS_PER_LOOP = 50;
const ROUTE_BLUE = "#4DA3FF";
const DELIVERED_GREEN = "#22C55E";
const BOUNDARY_GRAY = "#E3E8F0";

interface Journey {
  originState: string;
  origin: { x: number; y: number };
  dest: UsCity;
  path: string;
  /** ms — scaled with distance */
  travelMs: number;
}

type Phase = "traveling" | "delivered";

function buildJourneys(): Journey[] {
  const journeys: Journey[] = [];
  // Prefer a different origin state each time; reshuffle when exhausted.
  let originPool = shuffle(US_STATES.filter((s) => s.name !== "Hawaii"));

  for (let i = 0; i < JOURNEYS_PER_LOOP; i++) {
    if (originPool.length === 0) originPool = shuffle([...US_STATES]);
    const originState = originPool.pop()!;
    const destChoices = US_CITIES.filter((c) => c.state !== originState.name);
    const dest = destChoices[Math.floor(Math.random() * destChoices.length)];

    const from = { x: originState.cx, y: originState.cy };
    const dist = Math.hypot(dest.x - from.x, dest.y - from.y);
    journeys.push({
      originState: originState.name,
      origin: from,
      dest,
      path: curvedPath(from, dest, i),
      travelMs: 1400 + Math.min(2200, dist * 4.5),
    });
  }
  return journeys;
}

/** Natural-feeling curve: quadratic arc with alternating, distance-scaled bow. */
function curvedPath(a: { x: number; y: number }, b: { x: number; y: number }, seed: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const side = seed % 2 === 0 ? 1 : -1;
  const bow = Math.min(64, dist * 0.22) * side;
  return `M ${a.x} ${a.y} Q ${mx - (dy / dist) * bow} ${my + (dx / dist) * bow} ${b.x} ${b.y}`;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const clampX = (x: number) => Math.min(Math.max(x, 60), US_MAP_W - 110);
const clampY = (y: number) => Math.min(Math.max(y, 26), US_MAP_H - 16);

function USDeliveryMapInner() {
  const [journeys, setJourneys] = useState<Journey[]>(() => buildJourneys());
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("traveling");

  const routeRef = useRef<SVGPathElement>(null);
  const beaconRef = useRef<SVGGElement>(null);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const journey = journeys[index];

  // Drives one journey: draw + travel via rAF, then Delivered hold, then advance.
  useEffect(() => {
    const pathEl = routeRef.current;
    const beacon = beaconRef.current;
    if (!pathEl || !beacon) return;

    const length = pathEl.getTotalLength();
    pathEl.setAttribute("stroke-dasharray", String(length));
    pathEl.setAttribute("stroke-dashoffset", String(length));
    beacon.style.opacity = "0";

    let raf = 0;
    let holdTimer = 0;
    let elapsed = 0;
    let last = performance.now();
    let running = true;
    const duration = reduced ? 1 : journey.travelMs;
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const advance = () => {
      setPhase("traveling");
      setIndex((i) => {
        if (i + 1 < JOURNEYS_PER_LOOP) return i + 1;
        setJourneys(buildJourneys()); // restart loop with fresh routes
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
      beacon.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      beacon.style.opacity = t > 0.02 && t < 0.99 ? "1" : "0";

      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setPhase("delivered");
        holdTimer = window.setTimeout(advance, reduced ? 400 : 2500);
      }
    };

    // Pause/resume with tab visibility — no jumps: we accumulate elapsed time.
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

  const originLabel = { x: clampX(journey.origin.x + 10), y: clampY(journey.origin.y - 10) };
  const destLabel = { x: clampX(journey.dest.x + 10), y: clampY(journey.dest.y - 12) };

  return (
    <svg
      viewBox={`0 0 ${US_MAP_W} ${US_MAP_H}`}
      className="h-full w-full"
      role="img"
      aria-label="Animated map of live Linus Delivery shipments across the United States"
    >
      <defs>
        <pattern id="us-grid" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d="M 46 0 L 0 0 0 46" fill="none" stroke="#EDF1F7" strokeWidth="1" />
        </pattern>
        <filter id="beacon-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="route-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ROUTE_BLUE} stopOpacity="0.35" />
          <stop offset="100%" stopColor={ROUTE_BLUE} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Futuristic grid backdrop */}
      <rect width={US_MAP_W} height={US_MAP_H} fill="url(#us-grid)" opacity="0.55" />

      {/* Thin geometric UI accents */}
      <g stroke={ROUTE_BLUE} strokeWidth="1.4" opacity="0.4" fill="none" aria-hidden="true">
        <path d="M 16 40 V 16 H 40" />
        <path d={`M ${US_MAP_W - 16} ${US_MAP_H - 40} V ${US_MAP_H - 16} H ${US_MAP_W - 40}`} />
      </g>

      {/* State boundaries — white fill, very light gray borders */}
      <g fill="#FFFFFF" stroke={BOUNDARY_GRAY} strokeWidth="1" strokeLinejoin="round">
        {US_STATES.map((s) => (
          <path key={s.name} d={s.d} />
        ))}
      </g>

      {/* Active route */}
      <path
        ref={routeRef}
        d={journey.path}
        fill="none"
        stroke="url(#route-stroke)"
        strokeWidth="2.4"
        strokeLinecap="round"
        filter="url(#beacon-glow)"
      />

      {/* Origin: glowing light-blue marker + state name */}
      <g aria-hidden="true">
        <circle cx={journey.origin.x} cy={journey.origin.y} r="5" fill={ROUTE_BLUE} filter="url(#beacon-glow)" />
        <circle cx={journey.origin.x} cy={journey.origin.y} r="9" fill="none" stroke={ROUTE_BLUE} strokeWidth="1.4" opacity="0.5">
          <animate attributeName="r" values="7;13;7" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0.1;0.55" dur="2.2s" repeatCount="indefinite" />
        </circle>
        <MapLabel x={originLabel.x} y={originLabel.y} text={journey.originState} color="#3D4A6B" />
      </g>

      {/* Destination: blue while traveling → green Delivered on arrival */}
      <g aria-hidden="true">
        {phase === "traveling" ? (
          <>
            <circle cx={journey.dest.x} cy={journey.dest.y} r="4.5" fill="#FFFFFF" stroke={ROUTE_BLUE} strokeWidth="2" />
            <MapLabel x={destLabel.x} y={destLabel.y} text={`${journey.dest.city}, ${journey.dest.state}`} color="#3D4A6B" />
          </>
        ) : (
          <>
            <circle cx={journey.dest.x} cy={journey.dest.y} r="9" fill={DELIVERED_GREEN} />
            {/* check mark */}
            <path
              d={`M ${journey.dest.x - 4} ${journey.dest.y} l 2.8 2.9 l 5.4 -5.6`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={journey.dest.x} cy={journey.dest.y} r="12" fill="none" stroke={DELIVERED_GREEN} strokeWidth="1.6" opacity="0.6">
              <animate attributeName="r" values="10;22" dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <MapLabel
              x={destLabel.x}
              y={destLabel.y}
              text={`Delivered — ${journey.dest.city}, ${journey.dest.state}`}
              color="#15803D"
              fadeIn
            />
          </>
        )}
      </g>

      {/* Traveling beacon */}
      <g ref={beaconRef} style={{ opacity: 0 }} aria-hidden="true">
        <circle r="4" fill={ROUTE_BLUE} filter="url(#beacon-glow)" />
        <circle r="7.5" fill="none" stroke={ROUTE_BLUE} strokeWidth="1.2" opacity="0.45" />
      </g>

      {/* Shipment counter — glassmorphism info chip */}
      <g aria-hidden="true">
        <rect x={US_MAP_W - 190} y="14" width="176" height="30" rx="15" fill="#FFFFFF" fillOpacity="0.75" stroke={BOUNDARY_GRAY} />
        <circle cx={US_MAP_W - 172} cy="29" r="3.5" fill={phase === "delivered" ? DELIVERED_GREEN : ROUTE_BLUE} />
        <text
          x={US_MAP_W - 160}
          y="33"
          fontSize="12"
          fontWeight={600}
          fill="#3D4A6B"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Shipment {index + 1} of {JOURNEYS_PER_LOOP}
        </text>
      </g>
    </svg>
  );
}

/** Label pill with a soft white halo so text stays readable over boundaries. */
function MapLabel({
  x,
  y,
  text,
  color,
  fadeIn = false,
}: {
  x: number;
  y: number;
  text: string;
  color: string;
  fadeIn?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize="12.5"
      fontWeight={700}
      fill={color}
      stroke="#FFFFFF"
      strokeWidth="3.5"
      paintOrder="stroke"
      className={fadeIn ? "animate-fade-up" : undefined}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {text}
    </text>
  );
}

export const USDeliveryMap = memo(USDeliveryMapInner);
