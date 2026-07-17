import { memo, useEffect, useMemo, useRef, useState } from "react";
import { LAND_DOTS, MAP_W, MAP_H, project } from "./worldDots";
import { ALL_LOCATIONS, type NetworkLocation } from "./networkLocations";

/**
 * AnimatedWorldMap — the hero centerpiece.
 *
 * A dot-matrix world (real landmass geometry) with a continuously running
 * delivery network simulation:
 *   1. a route arc DRAWS from origin to destination (glowing light trail)
 *   2. a package particle TRAVELS along it
 *   3. the destination pin PULSES on arrival, its label fades in
 *   4. the route fades out and a new one begins elsewhere
 *
 * Implementation: pure SVG + a single requestAnimationFrame loop driving a
 * small fixed pool of concurrent routes (GPU-cheap, 60fps, no re-render storm —
 * the rAF loop mutates SVG attributes directly via refs).
 */

const CONCURRENT_ROUTES = 4;
const ROUTE_LIFETIME_MS = 6400;
const PIN_COUNT = 9; // persistent ambient pins, rotated periodically

interface LiveRoute {
  from: NetworkLocation;
  to: NetworkLocation;
  path: string;
  length: number;
  startedAt: number;
}

function arcPath(a: [number, number], b: [number, number]): string {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dist = Math.hypot(dx, dy);
  // Perpendicular control point → gentle arc, always bowing upward.
  const lift = Math.min(90, dist * 0.28);
  return `M ${a[0]} ${a[1]} Q ${mx - (dy / dist) * lift * 0.2} ${my - lift} ${b[0]} ${b[1]}`;
}

function randomLocation(exclude?: NetworkLocation): NetworkLocation {
  let pick: NetworkLocation;
  do {
    pick = ALL_LOCATIONS[Math.floor(Math.random() * ALL_LOCATIONS.length)];
  } while (exclude && pick.label === exclude.label);
  return pick;
}

function makeRoute(now: number): LiveRoute {
  const from = randomLocation();
  const to = randomLocation(from);
  const path = arcPath(project(from.lng, from.lat), project(to.lng, to.lat));
  return { from, to, path, length: 0, startedAt: now };
}

function AnimatedWorldMapInner() {
  const svgRef = useRef<SVGSVGElement>(null);
  const routeRefs = useRef<(SVGPathElement | null)[]>([]);
  const particleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const arriveRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [routes, setRoutes] = useState<LiveRoute[]>([]);
  const [pins, setPins] = useState<NetworkLocation[]>([]);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Ambient pins: a rotating sample of the network, refreshed slowly.
  useEffect(() => {
    const sample = () =>
      [...ALL_LOCATIONS].sort(() => Math.random() - 0.5).slice(0, PIN_COUNT);
    setPins(sample());
    if (reduced) return;
    const id = window.setInterval(() => setPins(sample()), 9000);
    return () => window.clearInterval(id);
  }, [reduced]);

  // Live routes pool.
  useEffect(() => {
    const now = performance.now();
    setRoutes(
      Array.from({ length: CONCURRENT_ROUTES }, (_, i) => ({
        ...makeRoute(now),
        startedAt: now + i * (ROUTE_LIFETIME_MS / CONCURRENT_ROUTES),
      })),
    );
  }, []);

  // Single rAF loop: draws arcs, moves particles, pulses arrivals, recycles routes.
  useEffect(() => {
    if (reduced || routes.length === 0) return;
    let raf = 0;
    let respawn: LiveRoute[] | null = null;

    const tick = (now: number) => {
      routes.forEach((route, i) => {
        const pathEl = routeRefs.current[i];
        const particle = particleRefs.current[i];
        const arrive = arriveRefs.current[i];
        if (!pathEl || !particle || !arrive) return;

        const t = (now - route.startedAt) / ROUTE_LIFETIME_MS;
        if (t < 0) {
          pathEl.style.opacity = "0";
          particle.style.opacity = "0";
          arrive.style.opacity = "0";
          return;
        }
        if (t >= 1) {
          (respawn ??= [...routes])[i] = makeRoute(now + Math.random() * 800);
          return;
        }

        const length = pathEl.getTotalLength();

        // Phase 1 (0–0.35): route draws in with a glow.
        // Phase 2 (0.25–0.8): particle travels the arc.
        // Phase 3 (0.8–1): destination pulse, route fades.
        const draw = Math.min(t / 0.35, 1);
        pathEl.style.opacity = t > 0.82 ? String(1 - (t - 0.82) / 0.18) : "1";
        pathEl.setAttribute("stroke-dasharray", `${length}`);
        pathEl.setAttribute("stroke-dashoffset", `${length * (1 - easeOut(draw))}`);

        const travel = clamp01((t - 0.25) / 0.55);
        if (travel > 0 && travel < 1) {
          const pt = pathEl.getPointAtLength(length * easeInOut(travel));
          particle.setAttribute("cx", String(pt.x));
          particle.setAttribute("cy", String(pt.y));
          particle.style.opacity = "1";
        } else {
          particle.style.opacity = "0";
        }

        if (t > 0.8) {
          const pulse = (t - 0.8) / 0.2;
          const end = pathEl.getPointAtLength(length);
          arrive.setAttribute("cx", String(end.x));
          arrive.setAttribute("cy", String(end.y));
          arrive.setAttribute("r", String(4 + pulse * 14));
          arrive.style.opacity = String(0.5 * (1 - pulse));
        } else {
          arrive.style.opacity = "0";
        }
      });

      if (respawn) {
        setRoutes(respawn);
        respawn = null;
        return; // effect re-runs with new routes
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [routes, reduced]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="h-full w-full"
      role="img"
      aria-label="Animated map of the Linus Delivery global network"
    >
      <defs>
        <linearGradient id="route-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2145E6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2145E6" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="map-fade" cx="50%" cy="42%" r="62%">
          <stop offset="70%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* Dot-matrix landmass — very faint, futuristic */}
      <g fill="#2145E6" opacity="0.28">
        {LAND_DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.5} />
        ))}
      </g>

      {/* Live delivery routes */}
      {routes.map((route, i) => (
        <g key={`${route.from.label}-${route.to.label}-${route.startedAt}`}>
          <path
            ref={(el) => (routeRefs.current[i] = el)}
            d={route.path}
            fill="none"
            stroke="url(#route-glow)"
            strokeWidth={1.8}
            strokeLinecap="round"
            style={{ opacity: 0 }}
          />
          <circle
            ref={(el) => (particleRefs.current[i] = el)}
            r={3.2}
            fill="#2145E6"
            style={{ opacity: 0, filter: "drop-shadow(0 0 4px rgba(33,69,230,0.8))" }}
          />
          <circle
            ref={(el) => (arriveRefs.current[i] = el)}
            fill="none"
            stroke="#2145E6"
            strokeWidth={1.5}
            style={{ opacity: 0 }}
          />
        </g>
      ))}

      {/* Ambient pulsing pins with labels */}
      {pins.map((pin) => {
        const [x, y] = project(pin.lng, pin.lat);
        return (
          <g key={pin.label} className="animate-fade-up">
            <circle cx={x} cy={y} r={7} fill="#2145E6" opacity={0.12}>
              <animate attributeName="r" values="5;11;5" dur="2.6s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.25;0.05;0.25"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Map pin shape */}
            <path
              d={`M ${x} ${y - 11} c -3.6 0 -6 2.6 -6 5.7 0 3.9 6 9.3 6 9.3 s 6 -5.4 6 -9.3 c 0 -3.1 -2.4 -5.7 -6 -5.7 z`}
              fill="#2145E6"
              stroke="white"
              strokeWidth={1.2}
            />
            <circle cx={x} cy={y - 5} r={2} fill="white" />
            <text
              x={x + 9}
              y={y + 3}
              fontSize={10.5}
              fontWeight={600}
              fill="#2145E6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {pin.label}
            </text>
          </g>
        );
      })}

      {/* Soft fade into white around the edges */}
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#map-fade)" pointerEvents="none" />
    </svg>
  );
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function clamp01(t: number) {
  return Math.min(Math.max(t, 0), 1);
}

export const AnimatedWorldMap = memo(AnimatedWorldMapInner);
