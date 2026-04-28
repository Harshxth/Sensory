import { NextRequest, NextResponse } from "next/server";
import { synthesize } from "@/lib/elevenlabs";
import type { Language } from "@/types";

// F1.5 - POST { text, voice_id, lang } → multilingual TTS audio stream.
export async function POST(req: NextRequest) {
  const { text, voice_id, lang } = (await req.json()) as {
    text: string;
    voice_id: string;
    lang: Language;
  };
  if (!text || !voice_id) {
    return NextResponse.json({ error: "text and voice_id required" }, { status: 400 });
  }
  const stream = await synthesize(voice_id, text, lang ?? "en");
  return new Response(stream, { headers: { "Content-Type": "audio/mpeg" } });
}
