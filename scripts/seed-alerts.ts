// F1.8 — seed 2-3 realistic Tampa alerts for the demo.
// Run with: npx tsx scripts/seed-alerts.ts

import { config } from "dotenv";
config({ path: ".env.local" });
import { COLLECTIONS, getDb } from "../lib/mongodb";

async function main() {
  const db = await getDb();
  const today = new Date();
  const todayStart = new Date(today.toDateString());

  const alerts = [
    {
      title: "Tampa Downtown Street Fair",
      description: "Live music + food trucks. Unusually loud, expect crowds.",
      geo_bounds: {
        type: "Polygon",
        coordinates: [
          [
            [-82.46, 27.94],
            [-82.44, 27.94],
            [-82.44, 27.96],
            [-82.46, 27.96],
            [-82.46, 27.94],
          ],
        ],
      },
      start: new Date(todayStart.getTime() + 16 * 60 * 60 * 1000),
      end: new Date(todayStart.getTime() + 19 * 60 * 60 * 1000),
      severity: "high",
      affected_dimensions: ["noise", "crowd"],
    },
    {
      title: "USF Graduation Ceremony",
      description: "Crowded around MUMA + parking lots. Limited accessible parking.",
      geo_bounds: {
        type: "Polygon",
        coordinates: [
          [
            [-82.42, 28.05],
            [-82.4, 28.05],
            [-82.4, 28.07],
            [-82.42, 28.07],
            [-82.42, 28.05],
          ],
        ],
      },
      start: new Date(todayStart.getTime() + 10 * 60 * 60 * 1000),
      end: new Date(todayStart.getTime() + 14 * 60 * 60 * 1000),
      severity: "moderate",
      affected_dimensions: ["crowd"],
    },
  ];

  for (const a of alerts) {
    await db.collection(COLLECTIONS.alerts).updateOne(
      { title: a.title, start: a.start },
      { $set: a },
      { upsert: true },
    );
  }

  console.log(`seeded ${alerts.length} alerts`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
