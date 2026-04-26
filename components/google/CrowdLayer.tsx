"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
};

/**
 * Crowd density visualization — pulsing orange/amber halos around busy venues,
 * size + brightness scale with crowd score. Implemented as overlapping
 * google.maps.Circle objects (rendered cheaply on the map plane).
 */
export function CrowdLayer({ venues, visible = true }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const circles: google.maps.Circle[] = [];

    venues.forEach((v) => {
      if (!v.location?.coordinates) return;
      const score = v.sensory?.crowd ?? 0;
      if (score < 4) return;
      const center = {
        lat: v.location.coordinates[1],
        lng: v.location.coordinates[0],
      };

      const halo = new google.maps.Circle({
        center,
        radius: 30 + score * 10,
        strokeColor: "#fbbf24",
        strokeOpacity: 0,
        fillColor: score >= 7 ? "#dc2626" : score >= 5 ? "#f97316" : "#fbbf24",
        fillOpacity: 0.18,
        clickable: false,
        map: visible ? map : null,
      });
      circles.push(halo);

      const dot = new google.maps.Circle({
        center,
        radius: 8 + score,
        strokeColor: "#ffffff",
        strokeOpacity: 0.85,
        strokeWeight: 1.5,
        fillColor: score >= 7 ? "#dc2626" : score >= 5 ? "#f97316" : "#fbbf24",
        fillOpacity: 0.95,
        clickable: false,
        map: visible ? map : null,
      });
      circles.push(dot);
    });

    let raf = 0;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (visible && !reduceMotion) {
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / 1000;
        const opacity = 0.12 + Math.sin(t * 2.2) * 0.08;
        circles.forEach((c, i) => {
          if (i % 2 === 0) {
            try {
              c.setOptions({ fillOpacity: Math.max(0.05, opacity) });
            } catch {
              /* circle removed */
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
