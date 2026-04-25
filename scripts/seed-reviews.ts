// F1.7 — seed mock reviews so the venue panel has a populated feed at demo time.
// Run with: npx tsx scripts/seed-reviews.ts

import { config } from "dotenv";
config({ path: ".env.local" });
import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "../lib/mongodb";

const SAMPLES = [
  "Loud today — construction next door. Hard to focus.",
  "Lighting is much softer in the back booths.",
  "Crowded mid-afternoon. Two clear exits, both step-free.",
  "Strong coffee smell, espresso machine peaks every few minutes.",
  "Quiet hour 9–10am, perfect for sensory breaks.",
];

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

async function main() {
  const db = await getDb();
  const venues = await db.collection(COLLECTIONS.venues).find({}, { projection: { _id: 1 } }).toArray();
  if (venues.length === 0) {
    console.error("no venues found — run seed-venues first");
    process.exit(1);
  }

  let inserted = 0;
  for (const v of venues) {
    const venue_id = v._id as ObjectId;
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      await db.collection(COLLECTIONS.reviews).insertOne({
        venue_id,
        contributor_anon_id: `seed-${i}-${venue_id.toHexString().slice(-4)}`,
        text: SAMPLES[Math.floor(Math.random() * SAMPLES.length)],
        sensory_tags: { noise: null, lighting: null, crowd: null },
        timestamp: hoursAgo(Math.random() * 48),
      });
      inserted++;
    }
  }

  console.log(`seeded ${inserted} reviews across ${venues.length} venues`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
