// Create indexes + the noise_samples time-series collection.
// Run with: npx tsx scripts/init-indexes.ts

import { config } from "dotenv";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) config({ path: ".env.local" });
else if (existsSync(".env.production.local")) config({ path: ".env.production.local" });
import { COLLECTIONS, getDb } from "../lib/mongodb";

async function main() {
  const db = await getDb();

  // Time-series collection (must be created explicitly).
  const collections = await db.listCollections({ name: COLLECTIONS.noise_samples }).toArray();
  if (collections.length === 0) {
    await db.createCollection(COLLECTIONS.noise_samples, {
      timeseries: {
        timeField: "timestamp",
        metaField: "metadata",
        granularity: "minutes",
      },
    });
    console.log(`created time-series collection: ${COLLECTIONS.noise_samples}`);
  }

  await db.collection(COLLECTIONS.venues).createIndex({ location: "2dsphere" });
  await db.collection(COLLECTIONS.venues).createIndex({ "sensory.composite": 1 });
  await db.collection(COLLECTIONS.alerts).createIndex({ geo_bounds: "2dsphere" });
  await db.collection(COLLECTIONS.alerts).createIndex({ start: 1, end: 1 });
  await db.collection(COLLECTIONS.reviews).createIndex({ venue_id: 1, timestamp: -1 });

  console.log("indexes created");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
