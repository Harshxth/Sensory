"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "./MapContext";
import { fetchVenues } from "@/lib/map-data";
import type { Venue } from "@/types";

type Kind = "noise" | "crowd" | "light";

const SVG: Record<Kind, string> = {
  noise: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>`,
  crowd: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2 0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2 0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>`,
  light: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`,
};

const THRESHOLDS: Record<Kind, (v: Venue) => boolean> = {
  noise: (v) => (v.sensory?.noise ?? 0) >= 7,
  crowd: (v) => (v.sensory?.crowd ?? 0) >= 7,
  light: (v) => (v.sensory?.lighting ?? 0) >= 7,
};

const PRIORITY: Kind[] = ["noise", "crowd", "light"];

function pickKind(v: Venue): Kind | null {
  for (const k of PRIORITY) {
    if (THRESHOLDS[k](v)) return k;
  }
  return null;
}

const MIN_ZOOM = 13;

export function AnimatedSensoryMarkers({ visible = true }: { visible?: boolean }) {
  const { map, loaded } = useMap();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    fetchVenues().then(setVenues);
  }, []);

  useEffect(() => {
    if (!map || !loaded) return;
    const markers: mapboxgl.Marker[] = [];

    const render = () => {
      markers.forEach((m) => m.remove());
      markers.length = 0;
      if (!visible) return;
      if (map.getZoom() < MIN_ZOOM) return;

      for (const v of venues) {
        if (!v.location?.coordinates) continue;
        const kind = pickKind(v);
        if (!kind) continue;

        const el = document.createElement("button");
        el.type = "button";
        el.className = `sensory-marker sensory-marker--${kind}`;
        el.setAttribute("aria-label", `${kind} alert at ${v.name}`);
        el.innerHTML = `<span class="ring"></span><span class="ring delayed"></span>${SVG[kind]}`;
        el.addEventListener("click", () => {
          const id = String(v._id);
          if (id) window.location.href = `/venue/${id}`;
        });

        const marker = new mapboxgl.Marker({ element: el, offset: [0, -28] })
          .setLngLat(v.location.coordinates as [number, number])
          .addTo(map);
        markers.push(marker);
      }
    };

    render();
    map.on("zoomend", render);
    map.on("moveend", render);

    return () => {
      map.off("zoomend", render);
      map.off("moveend", render);
      markers.forEach((m) => m.remove());
    };
  }, [map, loaded, venues, visible]);

  return null;
}
