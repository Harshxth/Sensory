import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

// GET /api/venues?bounds=lng1,lat1,lng2,lat2 → venues in bbox via 2dsphere $geoWithin.
export async function GET(req: NextRequest) {
  const bounds = req.nextUrl.searchParams.get("bounds");
  if (!bounds) return NextResponse.json({ error: "bounds required" }, { status: 400 });

  const [lng1, lat1, lng2, lat2] = bounds.split(",").map(Number);
  if ([lng1, lat1, lng2, lat2].some(Number.isNaN)) {
    return NextResponse.json({ error: "invalid bounds" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const venues = await db
      .collection(COLLECTIONS.venues)
      .find({
        location: {
          $geoWithin: {
            $box: [
              [lng1, lat1],
              [lng2, lat2],
            ],
          },
        },
      })
      .limit(500)
      .toArray();

    return NextResponse.json({ venues });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Surface the underlying mongo failure so we can diagnose Atlas IP-allowlist
    // / DNS / auth issues from the client side instead of an opaque 500.
    return NextResponse.json(
      { error: "venues_query_failed", message: msg },
      { status: 500 },
    );
  }
}
