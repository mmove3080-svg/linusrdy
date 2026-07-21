interface SciFiBackdropProps {
  /** "full" for showcase sections, "soft" for content-dense areas */
  intensity?: "soft" | "full";
  /** mirrors the composition so adjacent sections don't repeat identically */
  flip?: boolean;
  /** show the rotating radar HUD (a section may replace it with its own art) */
  radar?: boolean;
}

const LINE = "#C6D1E9";
const LINE_SOFT = "#D6DEF0";
const NODE = "#8FA0CB";
const GLOW = "#2D8CFF";

/**
 * White futuristic HUD backdrop (reference-inspired):
 * angular circuit traces with node dots, dotted data columns, a faint
 * concentric radar element, thin geometric edge frames, and two delicate
 * glowing blue accents. All pinned to the edges — the center stays clean.
 * Pure SVG/CSS, zero animation cost. Parent must be `relative overflow-hidden`.
 */
export function SciFiBackdrop({ intensity = "full", flip = false, radar = true }: SciFiBackdropProps) {
  const dim = intensity === "soft" ? "opacity-60" : "";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${dim} ${flip ? "-scale-x-100" : ""}`}
    >
      {/* ── Top-left: angular circuit trace with nodes ── */}
      <svg className="absolute left-0 top-0 h-[110px] w-[300px]" viewBox="0 0 300 110" fill="none">
        <path d="M-4 76h44l30-30h88" stroke={LINE} strokeWidth="1.4" />
        <path d="M70 46l22-22h64" stroke={LINE_SOFT} strokeWidth="1.2" />
        <circle cx="162" cy="46" r="2.4" fill={NODE} />
        <circle cx="158" cy="24" r="1.8" fill={LINE} />
        <circle cx="196" cy="24" r="2" stroke={LINE} strokeWidth="1.2" />
        <path d="M162 46h36" stroke={LINE_SOFT} strokeWidth="1.1" />
      </svg>

      {/* ── Left edge: dotted data column ── */}
      <div className="absolute left-4 top-[120px] hidden flex-col items-center gap-[7px] md:flex">
        {[0.55, 0.5, 0.45, 0.4, 0.32, 0.26].map((o, i) => (
          <span
            key={i}
            className="h-[5px] w-[5px] rounded-[1px]"
            style={{ background: NODE, opacity: o }}
          />
        ))}
        {[0.22, 0.18, 0.14].map((o, i) => (
          <span
            key={i}
            className="h-[3px] w-[3px] rounded-full"
            style={{ background: NODE, opacity: o }}
          />
        ))}
      </div>

      {/* ── Bottom-left: angular frame ── */}
      <svg className="absolute bottom-0 left-0 h-[90px] w-[240px]" viewBox="0 0 240 90" fill="none">
        <path d="M8 -4v52l34 34h178" stroke={LINE} strokeWidth="1.4" />
        <circle cx="42" cy="82" r="2" fill={NODE} opacity="0.7" />
      </svg>

      {/* ── Right edge: tall angular frame + data column ── */}
      <svg
        className="absolute right-0 top-10 hidden h-[420px] w-[70px] lg:block"
        viewBox="0 0 70 420"
        fill="none"
      >
        <path d="M62 -4v130l-26 34v120l26 34v110" stroke={LINE} strokeWidth="1.4" />
        <circle cx="62" cy="126" r="2.2" fill={NODE} opacity="0.8" />
        <circle cx="36" cy="228" r="1.8" fill={LINE} />
      </svg>
      <div className="absolute bottom-[70px] right-4 hidden flex-col items-center gap-[6px] md:flex">
        {[0.16, 0.22, 0.3, 0.38, 0.46, 0.52].map((o, i) => (
          <span
            key={i}
            className="h-[5px] w-[5px] rounded-[1px]"
            style={{ background: NODE, opacity: o }}
          />
        ))}
      </div>

      {intensity === "full" && radar && (
        <>
          {/* ── Top-right: concentric radar HUD ── */}
          <svg
            className="absolute -top-4 right-8 h-[150px] w-[150px] sm:right-14"
            viewBox="0 0 150 150"
            fill="none"
          >
            {/* Entire HUD rotates 360° continuously — linear, seamless, GPU-composited.
                Pivot fixed at the circle center (75,75). Honors prefers-reduced-motion
                via the global reduced-motion rules in index.css. */}
            <g
              className="animate-[spin_14s_linear_infinite]"
              style={{ transformOrigin: "75px 75px", willChange: "transform" }}
            >
              <circle cx="75" cy="75" r="64" stroke={LINE_SOFT} strokeWidth="1" opacity="0.7" />
              <circle cx="75" cy="75" r="50" stroke={LINE} strokeWidth="1.1" opacity="0.8" />
              <circle
                cx="75" cy="75" r="36"
                stroke={LINE} strokeWidth="6" opacity="0.5"
                strokeDasharray="140 200" strokeLinecap="round"
              />
              <circle cx="75" cy="75" r="22" stroke={LINE} strokeWidth="1.1" />
              <path d="M75 5v14M75 131v14M5 75h14M131 75h14" stroke={LINE_SOFT} strokeWidth="1" />
              <path d="M75 75l16-22" stroke={NODE} strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="75" cy="75" r="2.2" fill={NODE} />
              <circle cx="139" cy="52" r="1.6" fill={LINE} />
            </g>
          </svg>

          {/* ── Top-right: dotted row leading to the radar ── */}
          <div className="absolute right-[180px] top-5 hidden items-center gap-[7px] lg:flex">
            {[0.14, 0.2, 0.26, 0.34, 0.42, 0.5, 0.42, 0.34].map((o, i) => (
              <span
                key={i}
                className="h-[4px] w-[4px] rounded-full"
                style={{ background: NODE, opacity: o }}
              />
            ))}
          </div>

          {/* ── Delicate glowing blue accents ── */}
          <span
            className="absolute left-[52px] top-[75px] h-1.5 w-1.5 rounded-full"
            style={{ background: GLOW, opacity: 0.55, boxShadow: `0 0 8px 2px ${GLOW}55` }}
          />
          <span
            className="absolute bottom-[86px] right-[58px] hidden h-1.5 w-1.5 rounded-full lg:block"
            style={{ background: GLOW, opacity: 0.45, boxShadow: `0 0 8px 2px ${GLOW}44` }}
          />
        </>
      )}
    </div>
  );
}
