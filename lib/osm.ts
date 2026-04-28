import type { Bounds } from "@/types";

const OVERPASS = "https://overpass-api.de/api/interpreter";

export type OsmFeature = {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
};

// F1.6 - wheelchair-accessible nodes within bbox.
export async function fetchWheelchairFeatures(b: Bounds): Promise<OsmFeature[]> {
  const bbox = `${b.lat1},${b.lng1},${b.lat2},${b.lng2}`;
  const query = `[out:json][timeout:25];
(node["wheelchair"](${bbox});
 node["kerb"="lowered"](${bbox}););
out;`;
  const res = await fetch(OVERPASS, { method: "POST", body: query });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = (await res.json()) as { elements: OsmFeature[] };
  return data.elements;
}

// F2.3 - streetlight density (Tier 2, stub for now).
export async function fetchStreetlights(_b: Bounds): Promise<OsmFeature[]> {
  return [];
}
