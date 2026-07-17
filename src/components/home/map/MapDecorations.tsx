import { US_MAP_W, US_MAP_H } from "../usMapGeo";

const LINE = "#BFD6F2";

/** Subtle futuristic blueprint accents: corner outlines, plus marks, dot clusters. */
export function MapDecorations() {
  return (
    <g aria-hidden="true" opacity={0.55}>
      {/* corner outlines */}
      <g stroke={LINE} strokeWidth={1.3} fill="none">
        <path d="M 14 44 V 14 H 44" />
        <path d={`M ${US_MAP_W - 44} 14 H ${US_MAP_W - 14} V 44`} />
        <path d={`M 14 ${US_MAP_H - 44} V ${US_MAP_H - 14} H 44`} />
        <path d={`M ${US_MAP_W - 14} ${US_MAP_H - 44} V ${US_MAP_H - 14} H ${US_MAP_W - 44}`} />
      </g>
      {/* thin blueprint lines */}
      <g stroke={LINE} strokeWidth={1} opacity={0.6}>
        <line x1={60} y1={14} x2={150} y2={14} />
        <line x1={US_MAP_W - 150} y1={US_MAP_H - 14} x2={US_MAP_W - 60} y2={US_MAP_H - 14} />
      </g>
      {/* plus marks */}
      <g stroke={LINE} strokeWidth={1.2}>
        {[[70, 70], [US_MAP_W - 70, 90], [90, US_MAP_H - 80], [US_MAP_W - 90, US_MAP_H - 70]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
            <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
          </g>
        ))}
      </g>
      {/* dot cluster */}
      <g fill={LINE}>
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <circle key={`${r}-${c}`} cx={US_MAP_W - 40 + c * 8} cy={US_MAP_H / 2 + r * 8} r={1.4} />
          )),
        )}
      </g>
    </g>
  );
}
