"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
};

/**
 * Lighting glow visualization — soft yellow halos for venues with strong/harsh
 * lighting. The radius and opacity scale with the lighting score.
 */
export function LightLayer({ venues, visible = true }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const circles: google.maps.Circle[] = [];

    venues.forEach((v) => {
      if (!v.location?.coordinates) return;
      const score = v.sensory?.lighting ?? 0;
      if (score < 4) return;
      const center = {
        lat: v.location.coordinates[1],
        lng: v.location.coordinates[0],
      };

      const radius = 40 + score * 12;
      const glow = new google.maps.Circle({
        center,
        radius,
        strokeColor: "#fde047",
        strokeOpacity: 0,
        fillColor: score >= 7 ? "#fde047" : "#fef9c3",
        fillOpacity: 0.32,
        clickable: false,
        map: visible ? map : null,
      });
      circles.push(glow);

      if (score >= 7) {
        const core = new google.maps.Circle({
          center,
          radius: 10 + score * 0.5,
          strokeColor: "#fde047",
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: "#fef9c3",
          fillOpacity: 0.95,
          clickable: false,
          map: visible ? map : null,
        });
        circles.push(core);
      }
    });

    let raf = 0;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (visible && !reduceMotion) {
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / 1000;
        const breath = 0.25 + Math.sin(t * 1.4) * 0.12;
        circles.forEach((c, i) => {
          if (i % 2 === 0) {
            try {
              c.setOptions({ fillOpacity: Math.max(0.15, breath) });
            } catch {
              /* removed */
            }
          }
        });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, venues, visible]);

  return null;
}
