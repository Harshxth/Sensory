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
  const tags = body.sensory_tags ?? { noise: null, lighting: null, crowd: null };
  const db = await getDb();

  // Insert the review.
  await db.collection(COLLECTIONS.reviews).insertOne({
    venue_id: new ObjectId(id),
    contributor_anon_id: "anon-stub",
    text: body.text ?? "",
    sensory_tags: tags,
    timestamp: new Date(),
  });

  // Roll the user's tagged scores into the venue's sensory averages so the
  // heatmap reflects community input in real time. Each new submission gets
  // 30% weight against the existing 70%.
  const venue = await db
    .collection(COLLECTIONS.venues)
    .findOne({ _id: new ObjectId(id) });
  if (venue) {
    const sensory = (venue.sensory ?? {}) as Record<string, number>;
    const updates: Record<string, number> = {};
    (["noise", "lighting", "crowd"] as const).forEach((key) => {
      const newVal = tags[key];
      if (typeof newVal !== "number") return;
      const oldVal = sensory[key] ?? newVal;
      updates[`sensory.${key}`] = oldVal * 0.7 + newVal * 0.3;
    });
    if (Object.keys(updates).length > 0) {
      // Recompute composite from the updated dimensions.
      const merged = { ...sensory };
      Object.entries(updates).forEach(([k, v]) => {
        merged[k.split(".")[1]] = v;
      });
      const composite =
        (merged.noise ?? 5) * 0.35 +
        (merged.crowd ?? 5) * 0.25 +
        (merged.lighting ?? 5) * 0.2 +
        (merged.smell ?? 5) * 0.1 +
        (10 - (merged.exits ?? 5)) * 0.1;
      updates["sensory.composite"] = composite;
      updates["updated_at"] = Date.now();
      await db
        .collection(COLLECTIONS.venues)
        .updateOne({ _id: new ObjectId(id) }, { $set: updates });
    }
  }

  return NextResponse.json({ ok: true });
}
