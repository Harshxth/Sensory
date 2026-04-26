import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "share_sessions";

// GET /api/share/[token]
// Returns the latest known position + display profile for a share session.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 6) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }
  const db = await getDb();
  const session = await db.collection(COLLECTION).findOne({ token });
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    name: session.name ?? "A friend",
    needs: session.needs ?? [],
    position: session.position ?? null,
    updated_at: session.updated_at ?? null,
  });
}

// POST /api/share/[token]
// Body: { name?, needs? }
// Creates the session document if it doesn't exist (called when generating
// the share link).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 6) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }
  const body = (await req.json()) as { name?: string; needs?: string[] };
  const db = await getDb();
  await db.collection(COLLECTION).updateOne(
    { token },
    {
      $set: {
        token,
        name: body.name ?? null,
        needs: body.needs ?? [],
        created_at: new Date(),
      },
    },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
