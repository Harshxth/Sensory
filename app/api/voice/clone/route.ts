import { NextRequest, NextResponse } from "next/server";
import { cloneVoice } from "@/lib/elevenlabs";
import { encryptField } from "@/lib/encryption";
import { ClientIdMissingError, requireClientId } from "@/lib/identity";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

// F1.5 - POST audio blob → ElevenLabs IVC → store encrypted voice_id on the
// user's profile and return the plaintext voiceId for immediate playback.
//
// Auth: gated on a stable client id header (X-Sensory-Client-Id). Once real
// Supabase auth is wired, swap this for a JWT verification helper plus a
// fresh-session re-auth gate (master plan §15 #3).
export async function POST(req: NextRequest) {
  let clientId: string;
  try {
    clientId = requireClientId(req);
  } catch (err) {
    if (err instanceof ClientIdMissingError) {
      return NextResponse.json({ error: "client id required" }, { status: 401 });
    }
    throw err;
  }

  const form = await req.formData();
  const sample = form.get("sample");
  const name = (form.get("name") as string) ?? "comfort-voice";
  if (!(sample instanceof Blob)) {
    return NextResponse.json({ error: "sample blob required" }, { status: 400 });
  }

  const voiceId = await cloneVoice(name, sample);
  const encrypted = encryptField(voiceId);

  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection(COLLECTIONS.users).updateOne(
    { supabase_id: clientId },
    {
      $set: {
        voice_clone: { elevenlabs_voice_id: encrypted, created_at: now },
      },
      $setOnInsert: { supabase_id: clientId, created_at: now },
    },
    { upsert: true },
  );

  return NextResponse.json({ voiceId });
}

// DELETE /api/voice/clone - clear the user's stored clone. Used by Settings
// when the user wants to remove their voice. Does not delete from ElevenLabs
// (the voice_id remains in their account); only detaches it from this profile.
export async function DELETE(req: NextRequest) {
  let clientId: string;
  try {
    clientId = requireClientId(req);
  } catch (err) {
    if (err instanceof ClientIdMissingError) {
      return NextResponse.json({ error: "client id required" }, { status: 401 });
    }
    throw err;
  }

  const db = await getDb();
  await db.collection(COLLECTIONS.users).updateOne(
    { supabase_id: clientId },
    { $set: { voice_clone: null } },
  );

  return NextResponse.json({ ok: true });
}
