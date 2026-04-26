import { NextRequest, NextResponse } from "next/server";

// GET /api/streetlights?bounds=lng1,lat1,lng2,lat2
// Proxy to OSM Overpass: returns highway=street_lamp nodes in the bbox.
// Useful for blind/low-vision users planning night walks.
export async function GET(req: NextRequest) {
  const bounds = req.nextUrl.searchParams.get("bounds");
  if (!bounds) return NextResponse.json({ error: "bounds required" }, { status: 400 });
  const [lng1, lat1, lng2, lat2] = bounds.split(",").map(Number);
  if ([lng1, lat1, lng2, lat2].some(Number.isNaN)) {
    return NextResponse.json({ error: "invalid bounds" }, { status: 400 });
  }

  const bbox = `${lat1},${lng1},${lat2},${lng2}`;
  const query = `[out:json][timeout:20];
node["highway"="street_lamp"](${bbox});
out;`;

  try {
    const r = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });
    if (!r.ok) return NextResponse.json({ error: `overpass ${r.status}` }, { status: 502 });
    const data = (await r.json()) as { elements: { id: number; lat: number; lon: number }[] };
    return NextResponse.json({ features: data.elements ?? [] });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
