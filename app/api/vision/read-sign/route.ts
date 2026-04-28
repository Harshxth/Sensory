import { NextRequest, NextResponse } from "next/server";
import { getGemini } from "@/lib/gemini";

// POST /api/vision/read-sign
// Body: { image_b64: string, language?: "en"|"es"|"zh" }
// Uses Gemini 2.5 Flash Vision to extract readable text from a photo. Returns
// the extracted text in plain language for TTS.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { image_b64?: string; language?: string };
  if (!body.image_b64) {
    return NextResponse.json({ error: "image_b64 required" }, { status: 400 });
  }
  const language = body.language ?? "en";
  const langName = language === "es" ? "Spanish" : language === "zh" ? "Mandarin" : "English";

  // Strip data URL prefix if present
  const base64 = body.image_b64.replace(/^data:image\/\w+;base64,/, "");

  try {
    const model = getGemini().getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: "image/jpeg",
        },
      },
      {
        text:
          `You are reading a photo a low-vision or ESL user just took. Return STRICT JSON ` +
          `(no markdown fences, no commentary) of shape:\n` +
          `{"text": string, "place_name": string | null}\n\n` +
          `"text" - every readable sign / menu / poster, transcribed and translated to natural ${langName}. ` +
          `Short, scannable, separate distinct items with periods. If nothing is readable, set "text" to "No text found".\n\n` +
          `"place_name" - if the image clearly shows a business / building / venue NAME (e.g. "Felicitous Coffee", ` +
          `"USF Library", "Mr. Dunderbak's"), return that name as a clean string. Otherwise return null. ` +
          `Do NOT invent - only return a name that is literally visible. Do not include addresses, slogans, or hours.`,
      },
    ]);
    const raw = result.response.text().trim();
    // Gemini sometimes wraps JSON in ```json fences despite the instruction. Strip + parse defensively.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    let text = cleaned;
    let placeName: string | null = null;
    try {
      const parsed = JSON.parse(cleaned) as { text?: string; place_name?: string | null };
      if (typeof parsed.text === "string") text = parsed.text;
      if (typeof parsed.place_name === "string" && parsed.place_name.trim().length > 0) {
        placeName = parsed.place_name.trim();
      }
    } catch {
      // Not JSON - fall back to treating the whole response as the readout text.
    }
    return NextResponse.json({ text, place_name: placeName, language });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Vision request failed" },
      { status: 500 },
    );
  }
}
