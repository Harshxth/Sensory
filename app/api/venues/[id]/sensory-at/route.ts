import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

// GET /api/venues/[id]/sensory-at?day=tue&hour=20
// Returns time-adjusted sensory dimensions for a venue based on the
// noise_samples time-series data. Falls back to baseline scores when no
// historical data exists for that bucket.
const DAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const day = req.nextUrl.searchParams.get("day")?.toLowerCase() ?? "";
  const hourParam = req.nextUrl.searchParams.get("hour");
  const hour = hourParam ? parseInt(hourParam, 10) : NaN;
  if (!(day in DAY_INDEX) || Number.isNaN(hour) || hour < 0 || hour > 23) {
    return NextResponse.json({ error: "day (sun..sat) and hour (0-23) required" }, { status: 400 });
  }

  const db = await getDb();
  const venueId = new ObjectId(id);
  const venue = await db.collection(COLLECTIONS.venues).findOne({ _id: venueId });
  if (!venue) return NextResponse.json({ error: "not found" }, { status: 404 });

  const baseline = (venue.sensory ?? {}) as Record<string, number>;

  // Bucket the last 30 days of noise samples by (dayOfWeek, hour) and look up
  // the matching bucket. Fall back to baseline if empty.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const target = DAY_INDEX[day];
  const aggregated = await db
    .collection(COLLECTIONS.noise_samples)
    .aggregate([
      { $match: { "metadata.venue_id": venueId, timestamp: { $gte: since } } },
      {
        $project: {
          db_level: 1,
          dow: { $dayOfWeek: { date: "$timestamp", timezone: "UTC" } }, // 1..7 (Sun=1)
          hr: { $hour: { date: "$timestamp", timezone: "UTC" } },
        },
      },
      { $match: { dow: target + 1, hr: hour } },
      {
        $group: {
          _id: null,
          avg_db: { $avg: "$db_level" },
          n: { $sum: 1 },
        },
      },
    ])
    .toArray();

  let adjustedNoise = baseline.noise ?? 5;
  let derivedFrom = "baseline" as "baseline" | "live";
  if (aggregated[0]?.avg_db) {
    // Convert avg dB to a 0-10 score: 30 dB = 0 (silent), 90 dB = 10 (very loud)
    adjustedNoise = Math.max(0, Math.min(10, (aggregated[0].avg_db - 30) / 6));
    derivedFrom = "live";
  } else {
    // No live data — apply heuristic: louder for evenings on weekends, quieter early mornings.
    const isEvening = hour >= 17 && hour <= 22;
    const isLateNight = hour >= 22 || hour <= 5;
    const isWeekend = target === 0 || target === 6;
    let multiplier = 1;
    if (isEvening && isWeekend) multiplier = 1.4;
    else if (isEvening) multiplier = 1.2;
    else if (isLateNight) multiplier = 0.6;
    else if (hour >= 6 && hour <= 9) multiplier = 0.85;
    adjustedNoise = Math.max(0, Math.min(10, adjustedNoise * multiplier));
  }

  // Crowd: similar heuristic, anchored to baseline
  const baselineCrowd = baseline.crowd ?? 5;
  const isPeakSocial = (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21);
  const adjustedCrowd = Math.max(
    0,
    Math.min(10, baselineCrowd * (isPeakSocial ? 1.25 : hour < 7 || hour > 22 ? 0.5 : 1)),
  );

  // Lighting: harsher overhead noon, softer dusk/dawn
  const baselineLight = baseline.lighting ?? 5;
  const isNoon = hour >= 11 && hour <= 14;
  const isDuskDawn = (hour >= 6 && hour <= 8) || (hour >= 18 && hour <= 20);
  const isDark = hour < 6 || hour > 20;
  const adjustedLight = Math.max(
    0,
    Math.min(10, baselineLight * (isNoon ? 1.15 : isDuskDawn ? 0.85 : isDark ? 0.6 : 1)),
  );

  // Recompute composite with the adjusted dims
  const composite =
    adjustedNoise * 0.35 +
    adjustedCrowd * 0.25 +
    adjustedLight * 0.2 +
    (baseline.smell ?? 5) * 0.1 +
    (10 - (baseline.exits ?? 5)) * 0.1;

  return NextResponse.json({
    sensory: {
      noise: adjustedNoise,
      lighting: adjustedLight,
      crowd: adjustedCrowd,
      smell: baseline.smell ?? 5,
      exits: baseline.exits ?? 5,
      composite,
    },
    derived_from: derivedFrom,
  });
}
