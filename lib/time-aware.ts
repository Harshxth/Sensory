// Client-side mirror of the time-aware sensory heuristic from
// app/api/venues/[id]/sensory-at/route.ts. Used to recompute heatmap-friendly
// venue scores as the user scrubs the time slider — too many API calls
// otherwise. The server endpoint is reserved for venue detail views where
// historical noise_samples data can override the heuristic.

import type { Venue } from "@/types";

export type TimeKey = {
  day: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  hour: number;
};

const DAY_INDEX: Record<TimeKey["day"], number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function nowKey(): TimeKey {
  const d = new Date();
  const days: TimeKey["day"][] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return { day: days[d.getDay()], hour: d.getHours() };
}

export function isLive(key: TimeKey): boolean {
  const now = nowKey();
  return now.day === key.day && now.hour === key.hour;
}

export function adjustVenuesForTime(venues: Venue[], key: TimeKey): Venue[] {
  const { hour } = key;
  const dayIdx = DAY_INDEX[key.day];
  const isWeekend = dayIdx === 0 || dayIdx === 6;
  const isEvening = hour >= 17 && hour <= 22;
  const isLateNight = hour >= 22 || hour <= 5;
  const isPeakSocial = (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21);
  const isNoon = hour >= 11 && hour <= 14;
  const isDuskDawn = (hour >= 6 && hour <= 8) || (hour >= 18 && hour <= 20);
  const isDark = hour < 6 || hour > 20;

  const noiseMul = isEvening && isWeekend ? 1.4 : isEvening ? 1.2 : isLateNight ? 0.6 : hour >= 6 && hour <= 9 ? 0.85 : 1;
  const crowdMul = isPeakSocial ? 1.25 : hour < 7 || hour > 22 ? 0.5 : 1;
  const lightMul = isNoon ? 1.15 : isDuskDawn ? 0.85 : isDark ? 0.6 : 1;

  return venues.map((v) => {
    if (!v.sensory) return v;
    const adjustedNoise = clamp(v.sensory.noise * noiseMul);
    const adjustedCrowd = clamp(v.sensory.crowd * crowdMul);
    const adjustedLight = clamp(v.sensory.lighting * lightMul);
    const composite =
      adjustedNoise * 0.35 +
      adjustedCrowd * 0.25 +
      adjustedLight * 0.2 +
      v.sensory.smell * 0.1 +
      (10 - v.sensory.exits) * 0.1;
    return {
      ...v,
      sensory: {
        ...v.sensory,
        noise: adjustedNoise,
        crowd: adjustedCrowd,
        lighting: adjustedLight,
        composite,
      },
    };
  });
}

function clamp(v: number) {
  return Math.max(0, Math.min(10, v));
}
