// F1.4 step 2 — for each venue, batch-call Gemini on its reviews → sensory dimensions.
// Run with: npx tsx scripts/extract-sensory.ts
// This writes results to MongoDB so the demo never live-calls Gemini.

import "dotenv/config";
import { COLLECTIONS, getDb } from "../lib/mongodb";
import { compositeScore, extractSensory } from "../lib/gemini";

async function main() {
  const db = await getDb();
  const venues = await db.collection(COLLECTIONS.venues).find().toArray();

  for (const v of venues) {
    // TODO: fetch real Google review texts for v.google_place_id; placeholder for now.
    const reviewTexts: string[] = (v as { _seed_reviews?: string[] })._seed_reviews ?? [];
    if (reviewTexts.length === 0) continue;

    try {
      const dims = await extractSensory(v.name as string, reviewTexts);
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
    } catch (e) {
      console.error(`failed ${v.name}`, e);
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
