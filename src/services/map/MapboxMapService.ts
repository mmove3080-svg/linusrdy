import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapService, ShipmentMapOptions } from "./MapService";
import type { RouteGeometry } from "@/types/shipment";
import { cumulativeDistances, pointAtFraction, routeUpToFraction } from "@/utils/geo";

const ROUTE_SOURCE = "shipment-route";
const DONE_SOURCE = "shipment-route-done";
const ROUTE_DONE = "#7C3AED"; // violet — completed portion
const ROUTE_AHEAD = "#CBD5E1"; // gray — road ahead

/**
 * V1 map provider built on Mapbox GL JS.
 *
 * - Full route drawn as a light blue line (the road ahead stays visible)
 * - Completed portion drawn in deep blue on top
 * - Origin / destination markers
 * - Truck marker eased along the route with requestAnimationFrame,
 *   stopping at exactly `progress%` of total route distance
 */
export class MapboxMapService implements MapService {
  private map: mapboxgl.Map | null = null;
  private truckMarker: mapboxgl.Marker | null = null;
  private route: RouteGeometry = [];
  private cum: number[] = [];
  private currentFraction = 0;
  private rafId = 0;

  async mount(options: ShipmentMapOptions): Promise<void> {
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    if (!token) throw new Error("VITE_MAPBOX_TOKEN is not set");
    mapboxgl.accessToken = token;

    this.route = options.route.geometry;
    this.cum = cumulativeDistances(this.route);

    const map = new mapboxgl.Map({
      container: options.container,
      style: "mapbox://styles/mapbox/light-v11",
      bounds: this.routeBounds(),
      fitBoundsOptions: { padding: 72 },
      attributionControl: true,
      cooperativeGestures: true,
      // ── 3D perspective ──
      pitch: 55,
      bearing: -12,
      antialias: true,
    });
    this.map = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    await new Promise<void>((resolve) => map.on("load", () => resolve()));

    // ── 3D terrain + sky: realistic elevation and atmosphere ──
    if (!map.getSource("mapbox-dem")) {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.35 });
    map.setFog({}); // default atmospheric haze at the horizon
    if (!map.getLayer("sky")) {
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 12,
        },
      });
    }

    // Full route (road ahead) — lighter blue underneath.
    map.addSource(ROUTE_SOURCE, {
      type: "geojson",
      data: lineFeature(this.route),
    });
    map.addLayer({
      id: `${ROUTE_SOURCE}-line`,
      type: "line",
      source: ROUTE_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ROUTE_AHEAD, "line-width": 4, "line-opacity": 0.9 },
    });

    // Completed portion — solid deep blue drawn on top.
    map.addSource(DONE_SOURCE, {
      type: "geojson",
      data: lineFeature([this.route[0]]),
    });
    map.addLayer({
      id: `${DONE_SOURCE}-line`,
      type: "line",
      source: DONE_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ROUTE_DONE, "line-width": 4.5 },
    });

    // Origin + destination markers.
    new mapboxgl.Marker({ element: dotMarker("origin") })
      .setLngLat(this.route[0])
      .setPopup(placePopup("Origin", options.origin.city, options.origin.country))
      .addTo(map);
    new mapboxgl.Marker({ element: dotMarker("destination") })
      .setLngLat(this.route[this.route.length - 1])
      .setPopup(placePopup("Destination", options.destination.city, options.destination.country))
      .addTo(map);

    // Truck marker starts at the origin, then animates to progress.
    this.truckMarker = new mapboxgl.Marker({ element: truckMarker() })
      .setLngLat(this.route[0])
      .addTo(map);

    this.setProgress(options.progress);
  }

  setProgress(progress: number): void {
    if (!this.map || !this.truckMarker || this.route.length < 2) return;
    cancelAnimationFrame(this.rafId);

    const from = this.currentFraction;
    const to = Math.min(Math.max(progress, 0), 100) / 100;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 0 : Math.min(3200, 900 + Math.abs(to - from) * 2600);
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const f = from + (to - from) * easeOutCubic(t);
      this.renderAtFraction(f);
      if (t < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.currentFraction = to;
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  destroy(): void {
    cancelAnimationFrame(this.rafId);
    this.truckMarker?.remove();
    this.map?.remove();
    this.map = null;
    this.truckMarker = null;
  }

  // ── internals ──────────────────────────────────────────────────────────

  private renderAtFraction(fraction: number): void {
    if (!this.map || !this.truckMarker) return;
    const { point, bearing } = pointAtFraction(this.route, this.cum, fraction);
    void bearing;
    this.truckMarker.setLngLat(point);

    const done = this.map.getSource(DONE_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    done?.setData(lineFeature(routeUpToFraction(this.route, this.cum, fraction)));
  }

  private routeBounds(): mapboxgl.LngLatBounds {
    const bounds = new mapboxgl.LngLatBounds(this.route[0], this.route[0]);
    for (const coord of this.route) bounds.extend(coord);
    return bounds;
  }
}

// ── marker/DOM factories ──────────────────────────────────────────────────

function lineFeature(coords: RouteGeometry): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: coords },
  };
}

function dotMarker(kind: "origin" | "destination"): HTMLElement {
  const color = kind === "origin" ? "#22C55E" : "#EF4444";
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = "width:30px;height:38px;transform:translateY(-6px)";
  el.innerHTML = `
    <svg viewBox="0 0 30 38" width="30" height="38" style="filter:drop-shadow(0 3px 6px rgba(11,27,63,0.3))">
      <path d="M15 1C7.8 1 2 6.7 2 13.8 2 23.5 15 37 15 37s13-13.5 13-23.2C28 6.7 22.2 1 15 1Z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="15" cy="13.5" r="4.5" fill="#fff"/>
    </svg>`;
  return el;
}

function truckMarker(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", "Current shipment location");
  el.style.cssText =
    "display:flex;align-items:center;justify-content:center;width:44px;height:44px;" +
    "border-radius:9999px;background:#7C3AED;border:3px solid #fff;" +
    "box-shadow:0 4px 14px rgba(124,58,237,0.45)";
  el.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         width="20" height="20">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
    </svg>`;
  return el;
}

function placePopup(label: string, city: string, country: string): mapboxgl.Popup {
  return new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
    `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:2px 4px">
       <div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:#7C3AED;text-transform:uppercase">${label}</div>
       <div style="font-size:13px;font-weight:600;color:#0B1B3F">${escapeHtml(city)}, ${escapeHtml(country)}</div>
     </div>`,
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
