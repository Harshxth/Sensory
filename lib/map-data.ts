// Typed fetchers + GeoJSON shaping for the map view.
// Server returns Venue/Alert documents from MongoDB; we transform them into
// FeatureCollections that Mapbox can consume directly via setData.

import type { Alert, Venue } from "@/types";

const TAMPA_BBOX = "-82.55,27.95,-82.30,28.15";

// Fall back to seeded demo data if /api/venues 500s — the map should never appear empty.
const DEMO_VENUES: Venue[] = [
  {
    _id: "demo-1",
    google_place_id: "demo-1",
    name: "Demo Quiet Cafe",
    category: "cafe",
    address: "USF area",
    location: { type: "Point", coordinates: [-82.4139, 28.0587] },
    sensory: { noise: 2, lighting: 3, crowd: 2, smell: 4, exits: 8, composite: 2.5 },
    summary: "Sample calm venue (demo data).",
    osm_tags: { wheelchair: "yes", kerb: null },
    updated_at: new Date().toISOString(),
  },
];

export type VenueFeatureProps = {
  id: string;
  name: string;
  composite: number;
  noise: number;
  lighting: number;
  crowd: number;
  exits: number;
  wheelchair: string;
  recent: 0 | 1; // 1 if updated_at within RECENT_WINDOW_MS
};

const RECENT_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function fetchVenues(bounds = TAMPA_BBOX): Promise<Venue[]> {
  try {
    const res = await fetch(`/api/venues?bounds=${bounds}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`venues ${res.status}`);
    const data = (await res.json()) as { venues: Venue[] };
    if (!data.venues || data.venues.length === 0) return DEMO_VENUES;
    return data.venues;
  } catch {
    return DEMO_VENUES;
  }
}

export async function fetchAlerts(bounds = TAMPA_BBOX): Promise<Alert[]> {
  try {
    const res = await fetch(`/api/alerts?bounds=${bounds}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { alerts: Alert[] };
    return data.alerts ?? [];
  } catch {
    return [];
  }
}

export function venuesToFeatureCollection(
  venues: Venue[],
): GeoJSON.FeatureCollection<GeoJSON.Point, VenueFeatureProps> {
  const now = Date.now();
  return {
    type: "FeatureCollection",
    features: venues
      .filter((v) => v.location?.coordinates?.length === 2)
      .map((v) => {
        const updated = v.updated_at ? new Date(v.updated_at).getTime() : 0;
        const recent: 0 | 1 = now - updated < RECENT_WINDOW_MS ? 1 : 0;
        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: v.location.coordinates,
          },
          properties: {
            id: String(v._id),
            name: v.name,
            composite: v.sensory?.composite ?? 5,
            noise: v.sensory?.noise ?? 5,
            lighting: v.sensory?.lighting ?? 5,
            crowd: v.sensory?.crowd ?? 5,
            exits: v.sensory?.exits ?? 5,
            wheelchair: v.osm_tags?.wheelchair ?? "unknown",
            recent,
          },
        };
      }),
  };
}

export function alertsToFeatureCollection(
  alerts: Alert[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: alerts.map((a) => {
      // Use the polygon centroid for the badge marker.
      const ring = a.geo_bounds.coordinates[0];
      const cx = ring.reduce((sum, [x]) => sum + x, 0) / ring.length;
      const cy = ring.reduce((sum, [, y]) => sum + y, 0) / ring.length;
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [cx, cy] },
        properties: {
          id: String(a._id),
          title: a.title,
          severity: a.severity,
        },
      };
    }),
  };
}

// Sensory color stops — calm teal → amber → orange. NEVER red/green.
export const SENSORY_COLOR_STOPS: Array<[number, string]> = [
  [0, "#14b8a6"], // teal — calm
  [3, "#22d3ee"], // cyan
  [5, "#f59e0b"], // amber — moderate
  [7, "#fb923c"], // orange-300
  [10, "#ea580c"], // orange-600 — intense
];

export type WheelchairFeature = {
  id: number;
  lat: number;
  lon: number;
  status: "yes" | "limited" | "no" | "kerb_lowered";
};

// Pulls wheelchair / curb-cut data from /api/wheelchair (which proxies OSM Overpass).
export async function fetchWheelchairOSM(bounds = TAMPA_BBOX): Promise<WheelchairFeature[]> {
  try {
    const res = await fetch(`/api/wheelchair?bounds=${bounds}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      features: { id: number; lat: number; lon: number; tags: Record<string, string> }[];
    };
    return (data.features ?? []).map((f) => {
      const wc = f.tags.wheelchair as "yes" | "limited" | "no" | undefined;
      const kerb = f.tags.kerb;
      const status: WheelchairFeature["status"] =
        wc === "yes" || wc === "limited" || wc === "no"
          ? wc
          : kerb === "lowered"
            ? "kerb_lowered"
            : "yes";
      return { id: f.id, lat: f.lat, lon: f.lon, status };
    });
  } catch {
    return [];
  }
}

export function wheelchairToFeatureCollection(
  features: WheelchairFeature[],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: features.map((f) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [f.lon, f.lat] },
      properties: { id: String(f.id), status: f.status },
    })),
  };
}
