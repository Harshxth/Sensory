import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

// F1.10 - 24h hourly aggregation from the time-series collection.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const db = await getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const buckets = await db
    .collection(COLLECTIONS.noise_samples)
    .aggregate([
      { $match: { "metadata.venue_id": new ObjectId(id), timestamp: { $gte: since } } },
      {
        $group: {
          _id: { $dateTrunc: { date: "$timestamp", unit: "hour" } },
          avg_db: { $avg: "$db_level" },
          n: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .toArray();
  return NextResponse.json({ buckets });
}
