// Profile-aware route ranking. Given a list of route candidates from the
// Routes API and the user's saved accessibility preferences, score each route
// by how friendly it is to that user's needs. Lower score = better.

import type { Alert, Venue } from "@/types";
import type { Preferences } from "@/lib/preferences";

export type RouteCandidate = {
  index: number;
  encodedPolyline: string;
  durationSec: number;
  distanceMeters: number;
};

export type ScoredRoute = RouteCandidate & {
  penalty: number;
  reasons: string[];
};

// How much each user-need amplifies the relevant penalty type.
function needWeights(needs: Preferences["needs"]) {
  return {
    noise: needs.includes("noise") || needs.includes("blind") || needs.includes("deaf") ? 3 : 1,
    light: needs.includes("light") || needs.includes("blind") ? 3 : 1,
    crowd: needs.includes("wheelchair") ? 2.5 : needs.includes("noise") ? 1.8 : 1,
    wheelchair: needs.includes("wheelchair") ? 5 : 0,
  };
}

// Decode an encoded polyline (Google's algorithm) - returns lat/lng pairs.
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

// Approximate haversine distance in meters between two lat/lng points.
function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}

// Returns the minimum distance from a single point to any vertex of the path.
// Good enough for ~80m proximity checks at city scale.
function distanceToPath(
  point: { lat: number; lng: number },
  path: { lat: number; lng: number }[],
  earlyStopMeters = 200,
): number {
  let best = Infinity;
  for (const p of path) {
    const d = haversine(point, p);
    if (d < best) best = d;
    if (best < earlyStopMeters * 0.5) return best; // good enough
  }
  return best;
}

const PROXIMITY_METERS = 80;

export function scoreRoutes(
  candidates: RouteCandidate[],
  preferences: Preferences,
  venues: Venue[],
  alerts: Alert[],
): ScoredRoute[] {
  const w = needWeights(preferences.needs);
  const now = Date.now();

  return candidates
    .map((c) => {
      const path = decodePolyline(c.encodedPolyline);
      let penalty = 0;
      const reasons: string[] = [];
      let noisyHits = 0;
      let crowdHits = 0;
      let lightHits = 0;
      let wheelchairBlocks = 0;
      let alertHits = 0;

      // Penalize venues near the route based on their scores
      for (const v of venues) {
        if (!v.location?.coordinates) continue;
        const venuePoint = {
          lat: v.location.coordinates[1],
          lng: v.location.coordinates[0],
        };
        const dist = distanceToPath(venuePoint, path);
        if (dist > PROXIMITY_METERS) continue;

        const noise = v.sensory?.noise ?? 0;
        const crowd = v.sensory?.crowd ?? 0;
        const light = v.sensory?.lighting ?? 0;
        const wheelchairTag = v.osm_tags?.wheelchair;

        if (noise >= 6) {
          penalty += (noise - 5) * w.noise;
          if (noise >= 7) noisyHits++;
        }
        if (crowd >= 6) {
          penalty += (crowd - 5) * w.crowd;
          if (crowd >= 7) crowdHits++;
        }
        if (light >= 7) {
          penalty += (light - 6) * w.light;
          if (light >= 8) lightHits++;
        }
        if (preferences.needs.includes("wheelchair") && wheelchairTag === "no") {
          penalty += 50; // strong avoidance
          wheelchairBlocks++;
        }
      }

      // Penalize routes intersecting active alerts
      for (const a of alerts) {
        if (new Date(a.start).getTime() > now || new Date(a.end).getTime() < now) continue;
        const ring = a.geo_bounds.coordinates[0];
        const cx = ring.reduce((s, [x]) => s + x, 0) / ring.length;
        const cy = ring.reduce((s, [, y]) => s + y, 0) / ring.length;
        const center = { lat: cy, lng: cx };
        const dist = distanceToPath(center, path, 300);
        if (dist > 200) continue;
        const sevWeight = a.severity === "high" ? 4 : a.severity === "moderate" ? 2 : 1;
        penalty += sevWeight * 5;
        alertHits++;
      }

      if (noisyHits > 0)
        reasons.push(`${noisyHits} loud zone${noisyHits === 1 ? "" : "s"}`);
      if (crowdHits > 0)
        reasons.push(`${crowdHits} crowded patch${crowdHits === 1 ? "" : "es"}`);
      if (lightHits > 0)
        reasons.push(`${lightHits} bright-light area${lightHits === 1 ? "" : "s"}`);
      if (wheelchairBlocks > 0)
        reasons.push(`${wheelchairBlocks} non-accessible segment${wheelchairBlocks === 1 ? "" : "s"}`);
      if (alertHits > 0)
        reasons.push(`${alertHits} live alert${alertHits === 1 ? "" : "s"}`);

      return { ...c, penalty, reasons };
    })
    .sort((a, b) => a.penalty - b.penalty);
}

// Build a human explainer comparing the chosen route to the alternative.
export function buildExplainer(
  chosen: ScoredRoute,
  baseline: ScoredRoute | null,
  preferences: Preferences,
): string | null {
  if (preferences.needs.length === 0) return null;
  if (!baseline || baseline === chosen) {
    if (chosen.penalty === 0) return null;
    return `Picked the only available route - ${chosen.reasons.join(", ")} on the way`;
  }
  const saved = baseline.penalty - chosen.penalty;
  if (saved <= 0) return null;
  return `Picked to avoid ${chosen.reasons.length > 0 ? chosen.reasons.join(", ") : "high-sensory areas"} for your needs`;
}
