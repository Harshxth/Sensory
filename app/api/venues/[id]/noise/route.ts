import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

// F1.9 - record a single dB sample. Audio never leaves the client (master plan §15 #5).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const { db_level } = await req.json();
  if (typeof db_level !== "number") {
    return NextResponse.json({ error: "db_level required" }, { status: 400 });
  }
  const db = await getDb();
  const venue_id = new ObjectId(id);
  await db.collection(COLLECTIONS.noise_samples).insertOne({
    venue_id,
    timestamp: new Date(),
    metadata: { venue_id, contributor_anon_id: "anon-stub" },
    db_level,
  });
  return NextResponse.json({ ok: true });
}
