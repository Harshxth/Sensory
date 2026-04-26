import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "share_sessions";

// POST /api/share/[token]/ping
// Body: { lat, lng }
// Updates the share session's latest known position. Called by the owner's
// browser every ~30s while group mode is active.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 6) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }
  const body = (await req.json()) as { lat?: number; lng?: number };
  if (typeof body.lat !== "number" || typeof body.lng !== "number") {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }
  const db = await getDb();
  await db.collection(COLLECTION).updateOne(
    { token },
    {
      $set: {
        position: { lat: body.lat, lng: body.lng },
        updated_at: new Date(),
      },
    },
  );
  return NextResponse.json({ ok: true });
}
