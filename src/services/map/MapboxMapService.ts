import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapService, ShipmentMapOptions } from "./MapService";
import type { RouteGeometry } from "@/types/shipment";
import { cumulativeDistances, pointAtFraction, routeUpToFraction } from "@/utils/geo";

const ROUTE_SOURCE = "shipment-route";
const DONE_SOURCE = "shipment-route-done";
const BRAND_BLUE = "#2145E6";
const DONE_BLUE = "#16297D";

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
      fitBoundsOptions: { padding: 64 },
      attributionControl: true,
      cooperativeGestures: true,
    });
    this.map = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    await new Promise<void>((resolve) => map.on("load", () => resolve()));

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
      paint: { "line-color": BRAND_BLUE, "line-width": 4, "line-opacity": 0.35 },
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
      paint: { "line-color": DONE_BLUE, "line-width": 4 },
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
    this.truckMarker = new mapboxgl.Marker({ element: truckMarker(), rotationAlignment: "map" })
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
    this.truckMarker.setLngLat(point).setRotation(bearing);

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
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.className = "relative flex h-4 w-4 items-center justify-center";
  el.innerHTML = `
    <span class="absolute inline-flex h-full w-full rounded-full ${
      kind === "destination" ? "bg-brand-600" : "bg-ink"
    } opacity-30 animate-pin-pulse"></span>
    <span class="relative inline-flex h-3 w-3 rounded-full border-2 border-white shadow-soft ${
      kind === "destination" ? "bg-brand-600" : "bg-ink"
    }"></span>`;
  return el;
}

function truckMarker(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", "Current shipment location");
  el.className =
    "flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lift ring-2 ring-brand-600";
  el.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="#2145E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="h-5 w-5">
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
       <div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:#2145E6;text-transform:uppercase">${label}</div>
       <div style="font-size:13px;font-weight:600;color:#0B1B3F">${escapeHtml(city)}, ${escapeHtml(country)}</div>
     </div>`,
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
