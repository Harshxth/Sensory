import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { Language } from "@/types";

export function getElevenLabs(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required (check .env.local)");
  return new ElevenLabsClient({ apiKey });
}

// F1.5 — Instant Voice Clone. Returns a voice_id to be field-encrypted before storage.
export async function cloneVoice(name: string, sample: Blob): Promise<string> {
  const client = getElevenLabs();
  const result = await client.voices.ivc.create({ name, files: [sample] });
  return result.voiceId;
}

// F1.5 — Multilingual TTS using user's cloned voice_id.
export async function synthesize(
  voiceId: string,
  text: string,
  _lang: Language,
): Promise<ReadableStream<Uint8Array>> {
  const client = getElevenLabs();
  const stream = await client.textToSpeech.stream(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
  });
  return stream as unknown as ReadableStream<Uint8Array>;
}
