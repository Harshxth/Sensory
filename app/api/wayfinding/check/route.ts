import { NextRequest, NextResponse } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/mongodb";

/**
 * Wayfinding sign-check.
 *
 * The user just took a photo of a sign. We extracted a candidate place name
 * via Gemini Vision; their phone has GPS; nav (if active) has a destination.
 * This endpoint compares those three signals and returns spoken guidance:
 *
 *   - "yes you're at it" / "you're heading right toward it" - when the
 *     visible sign matches the destination.
 *   - "this is X, but your destination is Y, head <bearing>" - when the
 *     sign matches a known venue but it isn't the destination.
 *   - "I can't match this sign to a nearby venue, your destination is
 *     about <distance> to your <bearing>" - when nothing matches.
 *
 * Body:
 *   {
 *     place_name: string | null,
 *     user: { lat: number, lng: number },
 *     destination?: { lat: number, lng: number, name: string }
 *   }
 *
 * Response:
 *   {
 *     match?: { name: string, lat: number, lng: number, distanceMeters: number },
 *     verdict: "at_destination" | "approaching" | "off_track" | "no_match",
 *     spoken: string,                  // short sentence, TTS-ready
 *     bearingFromUser?: string,        // "north", "northeast", etc., relative to user
 *     distanceMeters?: number,         // user → destination
 *   }
 */

type Body = {
  place_name?: string | null;
  user?: { lat: number; lng: number };
  destination?: { lat: number; lng: number; name: string };
};

// Tunables
const NEAR_RADIUS_M = 200; // search this far from user for venue match
const ARRIVED_RADIUS_M = 60; // sign+destination distance under this = "you're there"
const ON_ROUTE_RADIUS_M = 30; // matched venue this close to destination = same place

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const placeName = body.place_name?.trim() || null;
  const user = body.user;
  const destination = body.destination;

  if (!user || typeof user.lat !== "number" || typeof user.lng !== "number") {
    return NextResponse.json({ error: "user.lat/lng required" }, { status: 400 });
  }

  // ---- Try to match the spoken sign against a venue near the user ----
  let match: { name: string; lat: number; lng: number; distanceMeters: number } | null = null;
  if (placeName) {
    try {
      const db = await getDb();
      const lower = placeName.toLowerCase();
      // Loose name match, then geo filter on results client-side. Mongo's
      // $text would require an index; this stays index-free for portability.
      const candidates = await db
        .collection(COLLECTIONS.venues)
        .find({
          name: { $regex: escapeRegex(stripCommonAffixes(placeName)), $options: "i" },
          location: {
            $geoWithin: {
              $centerSphere: [[user.lng, user.lat], NEAR_RADIUS_M / 6378137],
            },
          },
        })
        .limit(5)
        .toArray();

      if (candidates.length > 0) {
        // Pick the candidate whose name is most "central" to the OCR result,
        // then closest by distance. Cheap heuristic: sort by token-overlap then dist.
        const scored = candidates
          .map((v) => {
            const [lng, lat] = (v.location?.coordinates ?? [0, 0]) as [number, number];
            const d = haversine(user, { lat, lng });
            const overlap = tokenOverlap(lower, String(v.name).toLowerCase());
            return { name: String(v.name), lat, lng, d, overlap };
          })
          .sort((a, b) => b.overlap - a.overlap || a.d - b.d);
        const top = scored[0];
        match = { name: top.name, lat: top.lat, lng: top.lng, distanceMeters: Math.round(top.d) };
      }
    } catch {
      // DB hiccup - fall through; we'll still return a useful response.
    }
  }

  // ---- Compose the verdict + a short spoken sentence ----
  let verdict: "at_destination" | "approaching" | "off_track" | "no_match" = "no_match";
  let spoken = "";
  let distanceMeters: number | undefined;
  let bearingFromUser: string | undefined;

  if (destination) {
    distanceMeters = Math.round(haversine(user, destination));
    bearingFromUser = bearingLabel(user, destination);
  }

  if (match && destination) {
    const matchToDest = haversine(
      { lat: match.lat, lng: match.lng },
      { lat: destination.lat, lng: destination.lng },
    );

    if (matchToDest <= ON_ROUTE_RADIUS_M) {
      // Sign matches a venue at (or basically at) the destination.
      if (match.distanceMeters <= ARRIVED_RADIUS_M) {
        verdict = "at_destination";
        spoken = `Yes, you're at ${cleanName(destination.name)}. You've arrived.`;
      } else {
        verdict = "approaching";
        spoken = `Good - that sign is for ${cleanName(destination.name)}. You're heading the right way, about ${roundDistanceSpoken(distanceMeters ?? match.distanceMeters)} to go.`;
      }
    } else {
      verdict = "off_track";
      spoken = `That sign reads ${cleanName(match.name)}, but your destination is ${cleanName(destination.name)}, about ${roundDistanceSpoken(distanceMeters ?? 0)} to your ${bearingFromUser}. Try heading ${bearingFromUser} instead.`;
    }
  } else if (match && !destination) {
    verdict = "no_match";
    spoken = `That sign matches ${cleanName(match.name)}, about ${roundDistanceSpoken(match.distanceMeters)} from you. There's no active route, so I can only tell you what it is.`;
  } else if (!match && destination) {
    verdict = "no_match";
    spoken = `I couldn't match that sign to a nearby venue I know, but your destination ${cleanName(destination.name)} is about ${roundDistanceSpoken(distanceMeters ?? 0)} to your ${bearingFromUser}.`;
  } else if (!match && !destination && placeName) {
    verdict = "no_match";
    spoken = `I read the sign as ${cleanName(placeName)}, but I don't have it in my map yet, and there's no active route.`;
  } else {
    spoken = `I couldn't pick out a place name from that sign.`;
  }

  return NextResponse.json({
    match,
    verdict,
    spoken,
    bearingFromUser,
    distanceMeters,
  });
}

/* ------------------------------------------------------------------
 * helpers
 * ------------------------------------------------------------------ */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripCommonAffixes(name: string): string {
  // Drop punctuation + frequent suffixes (Inc, LLC, Coffee, Cafe) so a sign
  // that says "Felicitous" still matches "Felicitous Coffee & Tea House".
  const words = name
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));
  if (words.length === 0) return name;
  return words[0]; // first significant token is enough for a regex seed
}

const STOP_WORDS = new Set([
  "the", "and", "for", "inc", "llc", "co", "cafe", "coffee", "house",
  "shop", "store", "tea", "park", "center", "centre", "hall", "library",
  "restaurant", "bar", "grill",
]);

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(a.split(/\s+/).filter((t) => t.length >= 3));
  const tb = new Set(b.split(/\s+/).filter((t) => t.length >= 3));
  let overlap = 0;
  ta.forEach((t) => {
    if (tb.has(t)) overlap++;
  });
  return overlap;
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearingLabel(from: { lat: number; lng: number }, to: { lat: number; lng: number }): string {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;
  const φ1 = toRad(from.lat);
  const φ2 = toRad(to.lat);
  const λ1 = toRad(from.lng);
  const λ2 = toRad(to.lng);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const labels = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
  return labels[Math.round(bearing / 45) % 8];
}

function roundDistanceSpoken(m: number): string {
  if (m < 30) return "a few steps";
  if (m < 100) return `${Math.round(m / 10) * 10} meters`;
  if (m < 1000) return `${Math.round(m / 50) * 50} meters`;
  return `${(m / 1000).toFixed(1)} kilometers`;
}

function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}
