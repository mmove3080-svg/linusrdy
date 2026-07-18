import { geoAlbersUsa } from "d3-geo";
import { ALBERS_SCALE, ALBERS_TRANSLATE } from "@/components/home/usMapGeo";

/**
 * Projects real-world coordinates onto the site's US map (980x600 viewBox)
 * using the exact Albers USA parameters the map was generated with.
 * Returns null for points outside the projection (non-US locations).
 */
const projection = geoAlbersUsa().scale(ALBERS_SCALE).translate(ALBERS_TRANSLATE);

export function projectLatLng(lat: number, lng: number): [number, number] | null {
  const p = projection([lng, lat]);
  return p ? [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10] : null;
}
