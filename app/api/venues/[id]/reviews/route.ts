import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const db = await getDb();
  const reviews = await db
    .collection(COLLECTIONS.reviews)
    .find({ venue_id: new ObjectId(id) })
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();
  return NextResponse.json({ reviews });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const body = await req.json();
  // TODO: derive contributor_anon_id from authenticated user (master plan §15 #4).
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.reviews).insertOne({
    venue_id: new ObjectId(id),
    contributor_anon_id: "anon-stub",
    text: body.text ?? "",
    sensory_tags: body.sensory_tags ?? { noise: null, lighting: null, crowd: null },
    timestamp: new Date(),
  });
  return NextResponse.json({ id: result.insertedId });
}
