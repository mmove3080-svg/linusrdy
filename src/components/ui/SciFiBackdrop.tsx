interface SciFiBackdropProps {
  /** grid + accent strength — "soft" for content-dense areas, "full" for showcase sections */
  intensity?: "soft" | "full";
  /** swap which corner gets blue vs violet tint so adjacent sections alternate */
  flip?: boolean;
}

/**
 * White futuristic backdrop matching the What We Do section:
 * faint radially-fading grid, soft blue/violet corner tints, thin blueprint
 * corner outlines, and small plus-marks. Position: absolute — the parent
 * section must be `relative overflow-hidden`.
 */
export function SciFiBackdrop({ intensity = "full", flip = false }: SciFiBackdropProps) {
  const gridOpacity = intensity === "full" ? "opacity-60" : "opacity-40";
  const tintA = flip ? "rgba(108,46,255,0.05)" : "rgba(45,140,255,0.05)";
  const tintB = flip ? "rgba(45,140,255,0.05)" : "rgba(108,46,255,0.05)";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* faint grid, fading toward the edges */}
      <div
        className={`absolute inset-0 bg-[linear-gradient(to_right,#EEF3FB_1px,transparent_1px),linear-gradient(to_bottom,#EEF3FB_1px,transparent_1px)] bg-[size:44px_44px] ${gridOpacity}
          [mask-image:radial-gradient(75%_70%_at_50%_45%,black,transparent)]`}
      />
      {/* soft color tints */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(42% 36% at 12% 10%, ${tintA}, transparent)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(42% 36% at 88% 88%, ${tintB}, transparent)` }}
      />
      {/* blueprint corner outlines */}
      <svg className="absolute left-5 top-6 h-8 w-8 opacity-40" viewBox="0 0 32 32">
        <path d="M2 12V2h10" fill="none" stroke="#BFD6F2" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-6 right-5 h-8 w-8 opacity-40" viewBox="0 0 32 32">
        <path d="M30 20v10H20" fill="none" stroke="#BFD6F2" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {/* plus marks */}
      {intensity === "full" &&
        [
          "left-[14%] top-[22%]",
          "right-[16%] top-[30%]",
          "left-[10%] bottom-[18%]",
          "right-[12%] bottom-[26%]",
        ].map((pos) => (
          <svg key={pos} className={`absolute h-3 w-3 opacity-40 ${pos}`} viewBox="0 0 12 12">
            <g stroke="#BFD6F2" strokeWidth="1.2" strokeLinecap="round">
              <line x1="6" y1="1.5" x2="6" y2="10.5" />
              <line x1="1.5" y1="6" x2="10.5" y2="6" />
            </g>
          </svg>
        ))}
    </div>
  );
}
