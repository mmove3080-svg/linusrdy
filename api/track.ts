/**
 * GET /api/track?number=LIN123456789
 *
 * The ONLY code path that talks to Airtable and the Mapbox Directions API.
 * The browser never sees Airtable credentials or the secret Mapbox token.
 *
 * Flow:  validate → Airtable (Shipments) → Airtable (Shipment Events)
 *        → Mapbox Directions (origin → destination) → combined payload
 *
 * Caching: Vercel Edge Cache via Cache-Control s-maxage. Identical tracking
 * lookups within the window are served from the edge without re-querying
 * Airtable or Mapbox. (Future: write the encoded route back to a
 * `Cached Route` field in Airtable to persist across deployments.)
 */

// Minimal req/res typings so no @vercel/node dependency is required.
interface ApiRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
}
interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

// Deliberately permissive: any 4–40 character alphanumeric code, optionally
// containing hyphens. This guards against junk input without rejecting a
// format the customer's Airtable actually uses.
const TRACKING_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,38}[A-Z0-9]$/;
const AIRTABLE_API = "https://api.airtable.com/v0";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed", code: "SERVER_ERROR" });
  }

  const raw = req.query.number;
  const trackingNumber = (Array.isArray(raw) ? raw[0] : raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!TRACKING_PATTERN.test(trackingNumber)) {
    return res.status(400).json({
      error: "Please enter a valid tracking number.",
      code: "INVALID_NUMBER",
    });
  }

  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, MAPBOX_SERVER_TOKEN } = process.env;
  const shipmentsTable = process.env.AIRTABLE_SHIPMENTS_TABLE ?? "Shipments";
  const eventsTable = process.env.AIRTABLE_EVENTS_TABLE ?? "Shipment Events";

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error("Missing required environment variables");
    return res.status(500).json({ error: "Server configuration error.", code: "SERVER_ERROR" });
  }

  // Escape single quotes so the value can never break out of the filter formula.
  const safeNumber = trackingNumber.replace(/'/g, "\\'");
  // Airtable's `=` is case-sensitive and does not ignore stray whitespace, so a
  // record stored as "lin123456789" or "LIN123456789 " would silently fail to
  // match an uppercased query. Normalising BOTH sides makes the lookup forgiving
  // of how the data was entered.
  const filter = `UPPER(TRIM({Tracking Number})) = '${safeNumber}'`;

  try {
    // 1+2 ── Shipment and its timeline events, fetched CONCURRENTLY.
    // Both queries filter on the same tracking number, so there's no reason to
    // wait for the first before starting the second — this roughly halves the
    // round-trip time.
    const [shipmentRecord, events] = await Promise.all([
      airtableFirst(AIRTABLE_BASE_ID, shipmentsTable, filter, AIRTABLE_API_KEY),
      airtableAll(AIRTABLE_BASE_ID, eventsTable, filter, AIRTABLE_API_KEY).catch((err) => {
        // A missing/renamed events table shouldn't break the whole lookup —
        // the shipment summary and map are still useful on their own.
        console.warn("Timeline events unavailable:", err);
        return [] as AirtableRecord[];
      }),
    ]);

    if (!shipmentRecord) {
      return res.status(404).json({
        error: "No shipment found for that tracking number. Please check and try again.",
        code: "NOT_FOUND",
      });
    }
    const f = shipmentRecord.fields;

    // 3 ── Driving route (origin → destination). Mapbox is OPTIONAL: without
    // a token (or if Directions fails) we return null and the frontend draws
    // an elegant curved route between the coordinates instead.
    const origin: [number, number] = [num(f["Origin Longitude"]), num(f["Origin Latitude"])];
    const destination: [number, number] = [
      num(f["Destination Longitude"]),
      num(f["Destination Latitude"]),
    ];
    let route: Awaited<ReturnType<typeof fetchRoute>> | null = null;
    if (MAPBOX_SERVER_TOKEN) {
      try {
        route = await fetchRoute(origin, destination, MAPBOX_SERVER_TOKEN);
      } catch (routeErr) {
        console.warn("Mapbox Directions unavailable, using curved fallback:", routeErr);
      }
    }

    // 4 ── Combined payload
    const payload = {
      shipment: {
        trackingNumber,
        customerName: str(f["Customer Name"]),
        status: str(f["Shipment Status"]) || "In Transit",
        courier: str(f["Courier"]) || "Linus Delivery",
        estimatedDelivery: str(f["Estimated Delivery"]),
        progress: clamp(num(f["Progress"]), 0, 100),
        origin: {
          lat: origin[1],
          lng: origin[0],
          city: str(f["Origin City"]),
          state: str(f["Origin State"]) || undefined,
          country: str(f["Origin Country"]),
        },
        destination: {
          lat: destination[1],
          lng: destination[0],
          city: str(f["Destination City"]),
          state: str(f["Destination State"]) || undefined,
          country: str(f["Destination Country"]),
        },
        currentLocation: {
          lat: num(f["Current Latitude"]),
          lng: num(f["Current Longitude"]),
          city: str(f["Current City"]) || undefined,
        },
        packageDetails: str(f["Package Details"]) || undefined,
        lastUpdated: str(f["Last Updated"]) || undefined,
        shipmentTypeLabel: str(f["Shipment Type"]) || undefined,
        serviceLevel: str(f["Service Level"]) || str(f["Shipping Method"]) || undefined,
        currentFacility: str(f["Current Facility"]) || undefined,
        senderName: str(f["Sender Name"]) || undefined,
        receiverName: str(f["Receiver Name"]) || undefined,
        shippingMethod: str(f["Shipping Method"]) || undefined,
        reference: str(f["Reference"]) || undefined,
        shipmentDate: str(f["Shipment Date"]) || undefined,
        deliveryWindow: str(f["Delivery Window"]) || undefined,
        weightLabel: str(f["Weight"]) || undefined,
        dimensionsLabel: str(f["Dimensions"]) || undefined,
        packagePhotoUrl: attachmentUrl(f["Package Photo"]),
        timeline: events
          .map((r, i) => ({
            id: r.id,
            status: str(r.fields["Status"]),
            city: str(r.fields["City"]),
            state: str(r.fields["State"]) || undefined,
            country: str(r.fields["Country"]),
            date: str(r.fields["Date"]),
            time: str(r.fields["Time"]),
            sortOrder: num(r.fields["Sort Order"]) || i,
            // Optional per-scan coordinates. When supplied, the map plots the
            // journey exactly; when absent it interpolates along the route.
            lat: hasNum(r.fields["Latitude"]) ? num(r.fields["Latitude"]) : undefined,
            lng: hasNum(r.fields["Longitude"]) ? num(r.fields["Longitude"]) : undefined,
          }))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      },
      route,
    };

    // Edge cache: 5 min fresh, serve stale for 1h while revalidating.
    // Short cache: shipment data changes as parcels move, and a long TTL makes
    // Airtable edits appear "stuck" during testing.
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("track handler error:", err);

    // Surface actionable messages instead of one generic failure.
    const message = err instanceof Error ? err.message : "";
    if (message.includes("401")) {
      return res.status(500).json({
        error: "Tracking is temporarily unavailable. Please try again shortly.",
        code: "SERVER_ERROR",
      });
    }
    if (message.includes("403")) {
      console.error(
        "Airtable returned 403 — the personal access token does not have access to this base. " +
          "Grant the token base access at airtable.com/create/tokens (scope: data.records:read).",
      );
      return res.status(500).json({
        error: "Tracking is temporarily unavailable. Please try again shortly.",
        code: "SERVER_ERROR",
      });
    }
    if (message.includes("404")) {
      console.error(
        "Airtable returned 404 — check AIRTABLE_BASE_ID and that the table names match " +
          "(AIRTABLE_SHIPMENTS_TABLE / AIRTABLE_EVENTS_TABLE).",
      );
      return res.status(500).json({
        error: "Tracking is temporarily unavailable. Please try again shortly.",
        code: "SERVER_ERROR",
      });
    }
    if (message.includes("422")) {
      console.error(
        "Airtable returned 422 — the filter formula failed. Confirm the Shipments table has a " +
          "field named exactly 'Tracking Number'.",
      );
    }
    return res.status(500).json({
      error: "We couldn't reach our tracking service. Please try again in a moment.",
      code: "SERVER_ERROR",
    });
  }
}

// ── helpers ────────────────────────────────────────────────────────────────

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

async function airtableFirst(
  baseId: string,
  table: string,
  formula: string,
  apiKey: string,
): Promise<AirtableRecord | null> {
  const records = await airtableAll(baseId, table, formula, apiKey, 1);
  return records[0] ?? null;
}

async function airtableAll(
  baseId: string,
  table: string,
  formula: string,
  apiKey: string,
  maxRecords = 100,
): Promise<AirtableRecord[]> {
  const url = new URL(`${AIRTABLE_API}/${baseId}/${encodeURIComponent(table)}`);
  url.searchParams.set("filterByFormula", formula);
  url.searchParams.set("maxRecords", String(maxRecords));

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Airtable ${table} query failed: ${response.status}${detail ? ` — ${detail.slice(0, 200)}` : ""}`,
    );
  }
  const data = (await response.json()) as { records?: AirtableRecord[] };
  return Array.isArray(data.records) ? data.records : [];
}

async function fetchRoute(
  origin: [number, number],
  destination: [number, number],
  token: string,
): Promise<{ geometry: [number, number][]; distance: number; duration: number }> {
  const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
    `?geometries=geojson&overview=full&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mapbox Directions failed: ${response.status}`);
  const data = (await response.json()) as {
    routes: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }[];
  };
  const route = data.routes?.[0];
  if (!route) throw new Error("Mapbox returned no route for the given coordinates");
  return {
    geometry: route.geometry.coordinates,
    distance: route.distance,
    duration: route.duration,
  };
}

function attachmentUrl(v: unknown): string | undefined {
  if (Array.isArray(v) && v[0] && typeof v[0] === "object" && "url" in (v[0] as object)) {
    return String((v[0] as { url: unknown }).url);
  }
  return undefined;
}

function hasNum(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return false;
  return Number.isFinite(typeof v === "number" ? v : Number(v));
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}
function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
