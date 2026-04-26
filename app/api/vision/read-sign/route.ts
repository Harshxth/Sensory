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
          `Read every piece of visible text in this image — signs, menus, transit boards, posters, anything. ` +
          `Translate to natural ${langName} if not already in that language. ` +
          `Format as a short, scannable readout. If there are multiple distinct items, separate with periods. ` +
          `If no readable text, return exactly "No text found".`,
      },
    ]);
    const text = result.response.text().trim();
    return NextResponse.json({ text, language });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Vision request failed" },
      { status: 500 },
    );
  }
}
