import { forwardRef } from "react";

const BLUE = "#2E9BFF";
const GREEN = "#22C55E";

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
 * Traveling shipment pin: large glowing teardrop with concentric pulse halos,
 * matching the reference's current-position marker. Positioned via transform
 * by the animation loop (ref-driven, no re-renders).
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
