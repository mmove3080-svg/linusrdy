/**
 * CCTV media registry.
 *
 * Every surveillance clip available to the tracking page is listed here. To
 * switch which one customers see, change ACTIVE_CCTV_VIDEO to another key
 * below — no component or logic changes are required.
 *
 * To add another clip in future:
 *   1. Drop the file into `public/media/`.
 *   2. Add an entry to CCTV_SOURCES with its crop anchor and camera label.
 *   3. Optionally point ACTIVE_CCTV_VIDEO at it.
 */

export interface CctvSource {
  /** Path served from `public/`. */
  src: string;
  /** Camera ident drawn on the footage, e.g. "CAM 02". */
  camLabel: string;
  /**
   * Vertical anchor for the square crop, as an object-position percentage.
   * 0 keeps the very top of the frame, 50 centres, 100 keeps the bottom.
   */
  cropYPercent: number;
  /** Maintainer note; never rendered. */
  description: string;
}

export const CCTV_SOURCES = {
  interior: {
    src: "/media/truck-cctv.mp4",
    camLabel: "CAM 02",
    cropYPercent: 22,
    description: "Vehicle interior — rear doors, benches and safe",
  },
  beltran: {
    src: "/media/beltran-package.mp4",
    camLabel: "CAM 02",
    cropYPercent: 22,
    description: "Beltran package handling",
  },
} as const satisfies Record<string, CctvSource>;

export type CctvSourceKey = keyof typeof CCTV_SOURCES;

/**
 * ── THE SWITCH ──
 * Change this to any key in CCTV_SOURCES above to swap the displayed footage.
 * Current options: "interior" | "beltran"
 */
export const ACTIVE_CCTV_VIDEO: CctvSourceKey = "beltran";

/** Resolves the active source, falling back to the interior clip if misconfigured. */
export function getActiveCctvSource(): CctvSource {
  return CCTV_SOURCES[ACTIVE_CCTV_VIDEO] ?? CCTV_SOURCES.interior;
}
