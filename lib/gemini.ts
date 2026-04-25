import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SensoryDimensions } from "@/types";

export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required (check .env.local)");
  return new GoogleGenerativeAI(apiKey);
}

// F1.4 — produce sensory dimensions for a venue.
// Run via scripts/extract-sensory.ts at seed time so the demo never live-calls.
// If reviewTexts are provided, ground the score in them; otherwise have Gemini
// synthesize plausible defaults from the venue type.
export async function extractSensory(args: {
  name: string;
  category: string;
  reviewTexts?: string[];
}): Promise<Omit<SensoryDimensions, "composite"> & { summary: string }> {
  const { name, category, reviewTexts } = args;
  const model = getGemini().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const reviewBlock =
    reviewTexts && reviewTexts.length > 0
      ? `Reviews:\n${reviewTexts.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
      : `No reviews provided — infer realistic typical values for a venue of this category.`;

  const prompt = `You score venues on sensory accessibility for autistic, sensory-sensitive users.
Venue: ${name}
Category: ${category}
${reviewBlock}

Return strict JSON with keys:
- noise (0-10, 10 = very loud)
- lighting (0-10, 10 = harsh/fluorescent/strobing)
- crowd (0-10, 10 = packed)
- smell (0-10, 10 = overpowering)
- exits (0-10, 10 = many easy step-free exits)
- summary (one plain-language sentence describing the sensory feel, e.g. "Espresso machines and music. Loud peaks every few minutes.")`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// composite score weights — tuned for heatmap color (master plan §4 F1.2)
export function compositeScore(d: Omit<SensoryDimensions, "composite">): number {
  return d.noise * 0.35 + d.crowd * 0.25 + d.lighting * 0.2 + d.smell * 0.1 + (10 - d.exits) * 0.1;
}
