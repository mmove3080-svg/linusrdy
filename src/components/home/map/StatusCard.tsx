import { US_MAP_W } from "../usMapGeo";

interface StatusCardProps {
  /** anchor point (marker position) — card floats above with a pointer tail */
  x: number;
  y: number;
  label: string;
  value: string;
  accent: "blue" | "green";
  fadeIn?: boolean;
  /** scale factor — >1 on small screens so cards stay readable when the SVG shrinks */
  k?: number;
}

const ACCENTS = {
  blue: "#2E7CF6",
  green: "#16A34A",
} as const;

/**
 * Floating map status card, styled after the reference:
 * white rounded rectangle, soft shadow, small pointer beneath,
 * tiny uppercase accent label above a bold dark value.
 */
export function StatusCard({ x, y, label, value, accent, fadeIn = false, k = 1 }: StatusCardProps) {
  const width = (Math.max(label.length * 6.4, value.length * 7.6) + 30) * k;
  const height = 46 * k;
  // Clamp horizontally so the card never leaves the map.
  const cx = Math.min(Math.max(x, width / 2 + 10), US_MAP_W - width / 2 - 10);
  // Prefer above the anchor; flip below if too close to the top edge.
  const above = y - 18 * k - height > 8;
  const top = above ? y - 18 * k - height : y + 26 * k;

  return (
    <g
      className={fadeIn ? "animate-fade-up" : undefined}
      style={{ filter: "drop-shadow(0 6px 14px rgba(11,27,63,0.14))" }}
      aria-hidden="true"
    >
      <rect x={cx - width / 2} y={top} width={width} height={height} rx={12 * k} fill="#FFFFFF" />
      {above ? (
        <path d={`M ${x - 6 * k} ${top + height} l ${6 * k} ${8 * k} l ${6 * k} ${-8 * k} Z`} fill="#FFFFFF" />
      ) : (
        <path d={`M ${x - 6 * k} ${top} l ${6 * k} ${-8 * k} l ${6 * k} ${8 * k} Z`} fill="#FFFFFF" />
      )}
      <text
        x={cx - width / 2 + 15 * k}
        y={top + 18 * k}
        fontSize={8.5 * k}
        fontWeight={800}
        letterSpacing="0.12em"
        fill={ACCENTS[accent]}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: "uppercase" }}
      >
        {label.toUpperCase()}
      </text>
      <text
        x={cx - width / 2 + 15 * k}
        y={top + 35 * k}
        fontSize={13 * k}
        fontWeight={700}
        fill="#0B1B3F"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {value}
      </text>
    </g>
  );
}
