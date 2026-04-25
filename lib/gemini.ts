import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SensoryDimensions } from "@/types";

const apiKey = process.env.GEMINI_API_KEY;

export function getGemini() {
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");
  return new GoogleGenerativeAI(apiKey);
}

// F1.4 — extract sensory dimensions from a venue's reviews.
// Run via scripts/extract-sensory.ts at seed time so the demo never live-calls.
export async function extractSensory(
  venueName: string,
  reviewTexts: string[],
): Promise<Omit<SensoryDimensions, "composite"> & { summary: string }> {
  const model = getGemini().getGenerativeModel({
    model: "gemini-2.5-pro",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `You are extracting sensory accessibility data from venue reviews.
Venue: ${venueName}
Reviews:
${reviewTexts.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Return strict JSON with keys: noise (0-10), lighting (0-10), crowd (0-10), smell (0-10), exits (0-10), summary (one plain-language sentence describing the sensory feel).`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// composite score weights — tuned for heatmap color (master plan §4 F1.2)
export function compositeScore(d: Omit<SensoryDimensions, "composite">): number {
  return d.noise * 0.35 + d.crowd * 0.25 + d.lighting * 0.2 + d.smell * 0.1 + (10 - d.exits) * 0.1;
}
