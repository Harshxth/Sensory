import { NextRequest, NextResponse } from "next/server";

// GET /api/places/details?place_id=...
// Returns Google Place Details (hours, photos, address, reviews, etc.).
const FIELDS = [
  "place_id",
  "name",
  "formatted_address",
  "formatted_phone_number",
  "website",
  "geometry",
  "rating",
  "user_ratings_total",
  "types",
  "business_status",
  "opening_hours",
  "current_opening_hours",
  "price_level",
  "photos",
  "url",
].join(",");

export async function GET(req: NextRequest) {
  const place_id = req.nextUrl.searchParams.get("place_id");
  if (!place_id) {
    return NextResponse.json({ error: "place_id required" }, { status: 400 });
  }
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY missing" }, { status: 500 });

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", place_id);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("key", key);

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return NextResponse.json({ error: "places upstream" }, { status: 502 });
  const data = (await r.json()) as { result: unknown; status: string };
  if (data.status !== "OK") {
    return NextResponse.json({ error: `places ${data.status}` }, { status: 502 });
  }
  return NextResponse.json({ place: data.result });
}

// GET /api/places/details/photo?ref=...&maxwidth=400
// (Not implemented here - photos use a separate Google endpoint that requires
// streaming the binary response. We construct a public URL on the client.)
