import { NextRequest, NextResponse } from "next/server";

// GET /api/places/nearby?lat=...&lng=...
// Returns the nearest establishment from Google Places to the given lat/lng.
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY missing" }, { status: 500 });

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("rankby", "distance");
  url.searchParams.set("type", "establishment");
  url.searchParams.set("key", key);

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return NextResponse.json({ error: "places upstream" }, { status: 502 });
  const data = (await r.json()) as { results: GooglePlaceSummary[]; status: string };
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return NextResponse.json({ error: `places ${data.status}` }, { status: 502 });
  }

  return NextResponse.json({ place: data.results?.[0] ?? null });
}

type GooglePlaceSummary = {
  place_id: string;
  name: string;
  vicinity?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat: number; lng: number } };
  business_status?: string;
  opening_hours?: { open_now?: boolean };
  photos?: { photo_reference: string }[];
  price_level?: number;
};
