import { forwardRef } from "react";

const BLUE = "#2E9BFF";
const GREEN = "#22C55E";
const VIOLET = "#7C3AED";

/** Origin: solid blue dot in a white ring with a soft pulsing halo. */
export function OriginMarker({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={13} fill={BLUE} opacity={0.12}>
        <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.18;0.04;0.18" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={8} fill="#FFFFFF" style={{ filter: "drop-shadow(0 2px 5px rgba(11,27,63,0.22))" }} />
      <circle cx={x} cy={y} r={4.5} fill={BLUE} />
    </g>
  );
}

/**
 * Realistic delivery truck marker — represents the package's live position.
 *
 * Side-view box truck (cab, windscreen, cargo body, wheels with hubs, subtle
 * ground shadow) seated on a soft pulsing halo so it stays visible against
 * satellite imagery. Positioned via transform by the animation loop, so it
 * moves without triggering React re-renders.
 */
export const TruckMarker = forwardRef<SVGGElement>(function TruckMarker(_, ref) {
  return (
    <g ref={ref} style={{ opacity: 0 }} aria-hidden="true">
      {/* pulsing halo */}
      <circle r={26} fill={VIOLET} opacity={0.1}>
        <animate attributeName="r" values="20;32;20" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle r={17} fill={VIOLET} opacity={0.16}>
        <animate attributeName="r" values="15;21;15" dur="2.4s" repeatCount="indefinite" />
      </circle>

      <g transform="translate(-19 -12)" style={{ filter: "drop-shadow(0 3px 5px rgba(15,23,42,0.35))" }}>
        {/* ground shadow */}
        <ellipse cx={19} cy={23.5} rx={17} ry={2.2} fill="#0F172A" opacity={0.22} />

        {/* cargo body */}
        <rect x={0.5} y={3} width={22} height={15.5} rx={2} fill="#FFFFFF" stroke={VIOLET} strokeWidth={1.6} />
        <rect x={3.5} y={6.5} width={16} height={4.6} rx={1} fill={VIOLET} opacity={0.16} />

        {/* cab */}
        <path
          d="M22.5 8.2h6.4c.55 0 1.06.28 1.35.75l3.1 4.95c.16.26.25.56.25.86v3.74a1 1 0 0 1-1 1h-10.1V8.2Z"
          fill="#FFFFFF"
          stroke={VIOLET}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        {/* windscreen */}
        <path d="M23.9 9.7h4.6l2.5 4h-7.1V9.7Z" fill={VIOLET} opacity={0.28} />

        {/* wheels */}
        <circle cx={7.6} cy={19.4} r={3.5} fill="#1E293B" />
        <circle cx={7.6} cy={19.4} r={1.4} fill="#FFFFFF" opacity={0.9} />
        <circle cx={27.4} cy={19.4} r={3.5} fill="#1E293B" />
        <circle cx={27.4} cy={19.4} r={1.4} fill="#FFFFFF" opacity={0.9} />

        {/* motion lines */}
        <g stroke={VIOLET} strokeWidth={1.4} strokeLinecap="round" opacity={0.55}>
          <line x1={-6} y1={7.5} x2={-1.5} y2={7.5} />
          <line x1={-4.5} y1={11.5} x2={-1.5} y2={11.5} />
          <line x1={-6.5} y1={15.5} x2={-1.5} y2={15.5} />
        </g>
      </g>
    </g>
  );
});

/**
 * Traveling shipment pin: large glowing teardrop with concentric pulse halos.
 * Retained for the hero network map.
 */
export const CurrentPin = forwardRef<SVGGElement>(function CurrentPin(_, ref) {
  return (
    <g ref={ref} style={{ opacity: 0 }} aria-hidden="true">
      <circle r={22} fill={BLUE} opacity={0.1}>
        <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle r={13} fill={BLUE} opacity={0.16}>
        <animate attributeName="r" values="11;17;11" dur="2s" repeatCount="indefinite" />
      </circle>
      <g style={{ filter: "drop-shadow(0 4px 8px rgba(33,110,230,0.45))" }}>
        <path
          d="M0 0 C -8.5 -13 -13 -18 -13 -25.5 A 13 13 0 1 1 13 -25.5 C 13 -18 8.5 -13 0 0 Z"
          fill={BLUE}
          stroke="#FFFFFF"
          strokeWidth={2.5}
        />
        <circle cy={-25.5} r={5} fill="#FFFFFF" />
        <circle cy={-25.5} r={2.4} fill={BLUE} />
      </g>
    </g>
  );
});

/** Destination while traveling: small hollow blue target ring. */
export function DestinationMarker({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={6} fill="#FFFFFF" stroke={BLUE} strokeWidth={2.4}
        style={{ filter: "drop-shadow(0 2px 4px rgba(11,27,63,0.18))" }} />
      <circle cx={x} cy={y} r={2} fill={BLUE} />
    </g>
  );
}

/** Delivered: green circle with white check + expanding green pulse. */
export function DeliveredMarker({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={11} fill={GREEN} stroke="#FFFFFF" strokeWidth={2.5}
        style={{ filter: "drop-shadow(0 3px 7px rgba(22,163,74,0.4))" }} />
      <path
        d={`M ${x - 4.5} ${y} l 3 3.2 l 6 -6.4`}
        fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx={x} cy={y} r={14} fill="none" stroke={GREEN} strokeWidth={1.6} opacity={0.55}>
        <animate attributeName="r" values="12;26" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.55;0" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}
