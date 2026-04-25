import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

// F1.8 — active alerts in bbox + time window.
export async function GET(req: NextRequest) {
  const bounds = req.nextUrl.searchParams.get("bounds");
  const now = new Date();
  const db = await getDb();
  const query: Record<string, unknown> = { start: { $lte: now }, end: { $gte: now } };

  if (bounds) {
    const [lng1, lat1, lng2, lat2] = bounds.split(",").map(Number);
    if (![lng1, lat1, lng2, lat2].some(Number.isNaN)) {
      query.geo_bounds = {
        $geoIntersects: {
          $geometry: {
            type: "Polygon",
            coordinates: [
              [
                [lng1, lat1],
                [lng2, lat1],
                [lng2, lat2],
                [lng1, lat2],
                [lng1, lat1],
              ],
            ],
          },
        },
      };
    }
  }

  const alerts = await db.collection(COLLECTIONS.alerts).find(query).toArray();
  return NextResponse.json({ alerts });
}
