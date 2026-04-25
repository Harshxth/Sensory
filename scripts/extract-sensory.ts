// F1.4 step 2 — for each venue, batch-call Gemini on its reviews → sensory dimensions.
// Run with: npx tsx scripts/extract-sensory.ts
// This writes results to MongoDB so the demo never live-calls Gemini.

import { config } from "dotenv";
config({ path: ".env.local" });
import { COLLECTIONS, getDb } from "../lib/mongodb";
import { compositeScore, extractSensory } from "../lib/gemini";

async function main() {
  const db = await getDb();
  const venues = await db.collection(COLLECTIONS.venues).find().toArray();

  // Free-tier Gemini 2.5 Flash = 5 RPM. Pace at 1 call / 13s with retry-on-429.
  const DELAY_MS = 13_000;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (const v of venues) {
    if (v.sensory && typeof (v.sensory as { composite?: number }).composite === "number") {
      console.log(`skip ${v.name} (already scored)`);
      continue;
    }

    let attempt = 0;
    while (attempt < 4) {
      try {
        const dims = await extractSensory({
          name: v.name as string,
          category: (v.category as string) ?? "place",
        });
        const composite = compositeScore(dims);
        await db.collection(COLLECTIONS.venues).updateOne(
          { _id: v._id },
          {
            $set: {
              sensory: { ...dims, composite },
              summary: dims.summary,
              updated_at: new Date(),
            },
          },
        );
        console.log(`scored ${v.name}: composite=${composite.toFixed(2)}`);
        break;
      } catch (e) {
        const msg = (e as Error).message;
        const retryMatch = msg.match(/retry in (\d+)/i);
        const waitS = retryMatch ? parseInt(retryMatch[1], 10) + 2 : 30;
        attempt++;
        if (msg.includes("429") && attempt < 4) {
          console.log(`  rate-limited on ${v.name}, sleeping ${waitS}s (attempt ${attempt})`);
          await sleep(waitS * 1000);
          continue;
        }
        console.error(`failed ${v.name}: ${msg.slice(0, 120)}`);
        break;
      }
    }

    await sleep(DELAY_MS);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
