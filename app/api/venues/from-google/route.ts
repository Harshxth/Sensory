import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

// POST /api/venues/from-google
// Body: { google_place_id, name, address, lat, lng, types? }
// Upserts a venue by google_place_id. Returns the venue's _id.
// Used when a user wants to score a Google place that isn't in our DB yet.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    google_place_id?: string;
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    types?: string[];
  };
  if (!body.google_place_id || !body.name || typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json(
      { error: "google_place_id, name, lat, lng required" },
      { status: 400 },
    );
  }

  const db = await getDb();
  const existing = await db
    .collection(COLLECTIONS.venues)
    .findOne({ google_place_id: body.google_place_id });
  if (existing) {
    return NextResponse.json({ id: String(existing._id), created: false });
  }

  const result = await db.collection(COLLECTIONS.venues).insertOne({
    google_place_id: body.google_place_id,
    name: body.name,
    category: body.types?.find((t) => !["establishment", "point_of_interest"].includes(t)) ?? "place",
    address: body.address ?? "",
    location: { type: "Point", coordinates: [body.lng, body.lat] },
    osm_tags: { wheelchair: null, kerb: null },
    updated_at: new Date(),
    // No sensory yet — first community submission will populate via PATCH cascade
  });

  return NextResponse.json({ id: String(result.insertedId), created: true });
}
