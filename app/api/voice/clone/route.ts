import { NextRequest, NextResponse } from "next/server";
import { cloneVoice } from "@/lib/elevenlabs";
import { encryptField } from "@/lib/encryption";

// F1.5 — POST audio blob → ElevenLabs IVC → store encrypted voice_id.
// TODO: gate behind Supabase fresh-session re-auth (master plan §15 #3).
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const sample = form.get("sample");
  const name = (form.get("name") as string) ?? "comfort-voice";
  if (!(sample instanceof Blob)) {
    return NextResponse.json({ error: "sample blob required" }, { status: 400 });
  }
  const voiceId = await cloneVoice(name, sample);
  const encrypted = encryptField(voiceId);
  // TODO: persist `encrypted` against the authenticated user's profile in Mongo.
  return NextResponse.json({ encrypted });
}
