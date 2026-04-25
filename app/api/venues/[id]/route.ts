import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const db = await getDb();
  const venue = await db.collection(COLLECTIONS.venues).findOne({ _id: new ObjectId(id) });
  if (!venue) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ venue });
}
