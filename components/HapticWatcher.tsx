"use client";

import { useEffect, useRef } from "react";
import { loadPreferences } from "@/lib/preferences";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
};

const TRIGGER_RADIUS_M = 50;
const COOLDOWN_MS = 60_000; // don't re-vibrate the same venue within a minute

/**
 * Watches the user's geolocation and triggers a brief vibration pattern when
 * they enter the bubble of a high-sensory venue that matches one of their
 * accessibility needs. Helps deafblind users feel an approaching trigger.
 */
export function HapticWatcher({ venues }: Props) {
  const lastTriggeredRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const prefs = loadPreferences();
    if (!prefs.hapticWarnings) return;
    if (typeof window === "undefined" || !navigator.geolocation || !navigator.vibrate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const now = Date.now();
        for (const v of venues) {
          if (!v.location?.coordinates) continue;
          const id = String(v._id);
          const lastFired = lastTriggeredRef.current.get(id) ?? 0;
          if (now - lastFired < COOLDOWN_MS) continue;

          const dist = haversine(here, {
            lat: v.location.coordinates[1],
            lng: v.location.coordinates[0],
          });
          if (dist > TRIGGER_RADIUS_M) continue;

          const noise = v.sensory?.noise ?? 0;
          const crowd = v.sensory?.crowd ?? 0;
          const light = v.sensory?.lighting ?? 0;
          const matchedNeed =
            (noise >= 7 && (prefs.needs.includes("noise") || prefs.needs.includes("blind"))) ||
            (crowd >= 7 && prefs.needs.includes("wheelchair")) ||
            (light >= 8 && (prefs.needs.includes("light") || prefs.needs.includes("blind")));

          if (!matchedNeed) continue;

          // Pattern depends on what triggered it
          let pattern: number[] = [200, 100, 200];
          if (noise >= 9 || crowd >= 9) pattern = [300, 80, 300, 80, 300];
          else if (light >= 9) pattern = [150, 80, 150];
          try {
            navigator.vibrate(pattern);
          } catch {
            /* ignore */
          }
          lastTriggeredRef.current.set(id, now);
        }
      },
      () => {
        /* ignore errors */
      },
      { enableHighAccuracy: false, maximumAge: 30_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [venues]);

  return null;
}

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
