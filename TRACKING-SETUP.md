# Tracking Setup — Airtable + Vercel

The tracking result page is live in the code, but it needs your Airtable
database and two Vercel environment variables before real lookups work.
Follow this once and tracking is operational.

---

## 1. Create the Airtable base

Go to airtable.com → Create a base. Name it anything (e.g. **Linus Delivery**).

### Table 1 — rename the first table to exactly: `Shipments`

Create these fields with EXACTLY these names (field type in parentheses):

| Field name            | Type                | Example                  |
| --------------------- | ------------------- | ------------------------ |
| Tracking Number       | Single line text    | LIN123456789             |
| Customer Name         | Single line text    | John Smith               |
| Shipment Status       | Single select       | In Transit               |
| Courier               | Single line text    | Linus Delivery           |
| Estimated Delivery    | Date                | 2026-07-21               |
| Progress              | Number (integer)    | 55                       |
| Origin City           | Single line text    | Los Angeles              |
| Origin State          | Single line text    | CA                       |
| Origin Country        | Single line text    | USA                      |
| Origin Latitude       | Number (decimal)    | 34.05                    |
| Origin Longitude      | Number (decimal)    | -118.24                  |
| Destination City      | Single line text    | New York                 |
| Destination State     | Single line text    | NY                       |
| Destination Country   | Single line text    | USA                      |
| Destination Latitude  | Number (decimal)    | 40.71                    |
| Destination Longitude | Number (decimal)    | -74.00                   |
| Current City          | Single line text    | Chicago                  |
| Current Latitude      | Number (decimal)    | 41.88                    |
| Current Longitude     | Number (decimal)    | -87.63                   |
| Package Details       | Long text           | 1 box, 2.5 kg            |

Single-select options for **Shipment Status** (add all):
`Shipment Created`, `Picked Up`, `Warehouse`, `In Transit`,
`Distribution Center`, `Out For Delivery`, `Delivered`, `Exception`, `On Hold`

**Progress drives the truck position** (0–100). Suggested mapping:
Created 0 · Picked Up 10 · Warehouse 20 · In Transit 40 ·
Distribution Center 70 · Out For Delivery 90 · Delivered 100

### Table 2 — create a second table named exactly: `Shipment Events`

| Field name      | Type             | Example       |
| --------------- | ---------------- | ------------- |
| Tracking Number | Single line text | LIN123456789  |
| Status          | Single line text | In Transit    |
| City            | Single line text | Chicago       |
| State           | Single line text | IL            |
| Country         | Single line text | USA           |
| Date            | Date             | 2026-07-17    |
| Time            | Single line text | 14:32         |
| Sort Order      | Number (integer) | 3             |

Each row is one timeline entry. `Tracking Number` links it to the shipment;
`Sort Order` controls the order (1 = first event). The event whose Status
matches the shipment's current Status is highlighted; earlier ones show
green checks.

### Sample test shipment (enter this to test)

Shipments: the LA → New York example values from the tables above.
Shipment Events:

| Tracking Number | Status           | City        | State | Date       | Time  | Sort Order |
| --------------- | ---------------- | ----------- | ----- | ---------- | ----- | ---------- |
| LIN123456789    | Shipment Created | Los Angeles | CA    | 2026-07-15 | 09:10 | 1          |
| LIN123456789    | Picked Up        | Los Angeles | CA    | 2026-07-15 | 16:40 | 2          |
| LIN123456789    | Warehouse        | Phoenix     | AZ    | 2026-07-16 | 08:05 | 3          |
| LIN123456789    | In Transit       | Chicago     | IL    | 2026-07-17 | 14:32 | 4          |

(Country = USA on all rows.)

---

## 2. Get your Airtable credentials

1. **Base ID**: open your base → the URL looks like
   `airtable.com/appXXXXXXXXXXXXXX/...` — the part starting with `app` is
   your Base ID.
2. **API key (personal access token)**: airtable.com/create/tokens →
   Create token → scopes: `data.records:read` → access: select your base →
   Create. Copy the token (starts with `pat`).

---

## 3. Add environment variables in Vercel

Vercel dashboard → your project → **Settings → Environment Variables**.
Add these two (environment: Production, Preview, and Development):

| Name             | Value                       |
| ---------------- | --------------------------- |
| AIRTABLE_API_KEY | pat... (your token)         |
| AIRTABLE_BASE_ID | app... (your base id)       |

Optional (skip for now): `MAPBOX_SERVER_TOKEN` — adds real road-following
routes on the tracking map. Without it, an elegant curved route is drawn.

**Important:** after adding env variables, go to **Deployments → ⋯ on the
latest deployment → Redeploy** so they take effect.

---

## 4. Test

Open your site → enter `LIN123456789` → Track Package.
You should see the dashboard: summary bar, timeline with green checks and
the blue current step, and the map animating the pin from LA to 55% of the
route with a "From / Los Angeles, CA" card.

Shareable link format: `https://your-site.vercel.app/?track=LIN123456789`
