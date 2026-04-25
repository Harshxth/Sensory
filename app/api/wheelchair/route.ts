import { NextRequest, NextResponse } from "next/server";
import { fetchWheelchairFeatures } from "@/lib/osm";

// F1.6 — passthrough to OSM Overpass for wheelchair-tagged features in bbox.
export async function GET(req: NextRequest) {
  const bounds = req.nextUrl.searchParams.get("bounds");
  if (!bounds) return NextResponse.json({ error: "bounds required" }, { status: 400 });
  const [lng1, lat1, lng2, lat2] = bounds.split(",").map(Number);
  if ([lng1, lat1, lng2, lat2].some(Number.isNaN)) {
    return NextResponse.json({ error: "invalid bounds" }, { status: 400 });
  }
  const features = await fetchWheelchairFeatures({ lng1, lat1, lng2, lat2 });
  return NextResponse.json({ features });
}
