// F1.4 step 1 — fetch ~30 Tampa venues from Google Places, store with 2dsphere index.
// Run with: npx tsx scripts/seed-venues.ts

import { config } from "dotenv";
config({ path: ".env.local" });
import { COLLECTIONS, getDb } from "../lib/mongodb";

const USF_CENTER = { lat: 28.0587, lng: -82.4139 };
const RADIUS_M = 5_000;
const TYPES = ["cafe", "restaurant", "library", "park", "museum"];

type GooglePlace = {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  types?: string[];
  geometry?: { location: { lat: number; lng: number } };
};

async function fetchPlaces(type: string): Promise<GooglePlace[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY required");
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${USF_CENTER.lat},${USF_CENTER.lng}`);
  url.searchParams.set("radius", String(RADIUS_M));
  url.searchParams.set("type", type);
  url.searchParams.set("key", key);
  const res = await fetch(url);
  const data = (await res.json()) as { results: GooglePlace[] };
  return data.results.slice(0, 6);
}

async function main() {
  const db = await getDb();
  const collected: GooglePlace[] = [];
  for (const t of TYPES) collected.push(...(await fetchPlaces(t)));

  const seen = new Set<string>();
  for (const p of collected) {
    if (seen.has(p.place_id) || !p.geometry) continue;
    seen.add(p.place_id);
    const { lat, lng } = p.geometry.location;
    await db.collection(COLLECTIONS.venues).updateOne(
      { google_place_id: p.place_id },
      {
        $set: {
          google_place_id: p.place_id,
          name: p.name,
          category: p.types?.[0] ?? "place",
          address: p.formatted_address ?? p.vicinity ?? "",
          location: { type: "Point", coordinates: [lng, lat] },
          osm_tags: { wheelchair: null, kerb: null },
          updated_at: new Date(),
        },
      },
      { upsert: true },
    );
  }

  console.log(`seeded ${seen.size} venues`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
