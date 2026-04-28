"use client";

import { useEffect } from "react";
import type mapboxgl from "mapbox-gl";
import { useMap } from "./MapContext";

const NOISE_LAYER = "noise-heatmap";
const CROWD_LAYER = "crowd-swarm";
const CROWD_BURST = "crowd-swarm-burst";
const LIGHT_GLOW = "light-glow";
const LIGHT_CORE = "light-core";

type Props = {
  noiseVisible?: boolean;
  crowdVisible?: boolean;
  lightVisible?: boolean;
};

/**
 * Three premium visualizations layered on top of the sensory-venues source
 * (provided by SensoryLayer). Each dimension has its own visual language:
 *
 * - Noise → thermal heat gradient (cool blue → hot red), weighted by noise score
 * - Crowd → cluster of small bouncing dots (particle swarm)
 * - Light → soft radial glow (bright = strong/harsh lighting)
 */
export function SensoryHeatmaps({
  noiseVisible = true,
  crowdVisible = true,
  lightVisible = true,
}: Props) {
  const { map, loaded } = useMap();

  // Add layers once the source is available.
  useEffect(() => {
    if (!map || !loaded) return;
    if (!map.getSource("sensory-venues")) return;

    // ── Noise → thermal heatmap ─────────────────────────────────────────
    if (!map.getLayer(NOISE_LAYER)) {
      map.addLayer({
        id: NOISE_LAYER,
        type: "heatmap",
        source: "sensory-venues",
        filter: ["!", ["has", "point_count"]],
        maxzoom: 18,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "noise"],
            0, 0,
            10, 1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0.6,
            14, 1.2,
            17, 1.8,
          ],
          // Classic thermal palette: cool blue → cyan → yellow → orange → red
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(15, 23, 42, 0)",
            0.15, "rgba(56, 189, 248, 0.55)",
            0.35, "rgba(132, 204, 22, 0.65)",
            0.55, "rgba(245, 158, 11, 0.8)",
            0.75, "rgba(251, 113, 36, 0.9)",
            1, "rgba(225, 29, 72, 0.95)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 18,
            13, 38,
            16, 70,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0.7,
            16, 0.85,
          ],
        },
      });
    }

    // ── Crowd → particle swarm ──────────────────────────────────────────
    if (!map.getLayer(CROWD_BURST)) {
      // Outer halo - animated via JS loop below
      map.addLayer({
        id: CROWD_BURST,
        type: "circle",
        source: "sensory-venues",
        filter: ["all", ["!", ["has", "point_count"]], [">=", ["get", "crowd"], 4]],
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "crowd"],
            4, 14,
            10, 32,
          ],
          "circle-color": "#fde68a",
          "circle-opacity": 0.0,
          "circle-blur": 0.6,
        },
      });
    }
    if (!map.getLayer(CROWD_LAYER)) {
      // Inner dot cluster - many small dots simulating density
      map.addLayer({
        id: CROWD_LAYER,
        type: "circle",
        source: "sensory-venues",
        filter: ["all", ["!", ["has", "point_count"]], [">=", ["get", "crowd"], 4]],
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "crowd"],
            4, 5,
            10, 10,
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "crowd"],
            4, "#fbbf24",
            7, "#f97316",
            10, "#dc2626",
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.85,
          "circle-translate": [0, -2],
        },
      });
    }

    // ── Light → radial glow ─────────────────────────────────────────────
    if (!map.getLayer(LIGHT_GLOW)) {
      map.addLayer({
        id: LIGHT_GLOW,
        type: "circle",
        source: "sensory-venues",
        filter: ["all", ["!", ["has", "point_count"]], [">=", ["get", "lighting"], 4]],
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "lighting"],
            4, 30,
            10, 80,
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "lighting"],
            4, "#fef9c3",
            7, "#fef08a",
            10, "#fde047",
          ],
          "circle-opacity": 0.45,
          "circle-blur": 1.0,
        },
      });
    }
    if (!map.getLayer(LIGHT_CORE)) {
      map.addLayer({
        id: LIGHT_CORE,
        type: "circle",
        source: "sensory-venues",
        filter: ["all", ["!", ["has", "point_count"]], [">=", ["get", "lighting"], 7]],
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "lighting"],
            7, 6,
            10, 12,
          ],
          "circle-color": "#fef9c3",
          "circle-opacity": 0.95,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fde047",
          "circle-blur": 0.4,
        },
      });
    }
  }, [map, loaded]);

  // Animate the crowd burst halo (subtle pulse).
  useEffect(() => {
    if (!map || !loaded) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const opacity = 0.18 + Math.sin(t * 2.2) * 0.12;
      try {
        if (map.getLayer(CROWD_BURST)) {
          map.setPaintProperty(CROWD_BURST, "circle-opacity", Math.max(0.05, opacity));
        }
        if (map.getLayer(LIGHT_CORE)) {
          const lightOp = 0.7 + Math.sin(t * 1.4) * 0.25;
          map.setPaintProperty(LIGHT_CORE, "circle-opacity", Math.max(0.4, Math.min(1, lightOp)));
        }
      } catch {
        /* map removed */
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [map, loaded]);

  // Visibility controls
  useEffect(() => {
    if (!map || !loaded) return;
    setVis(map, NOISE_LAYER, noiseVisible);
  }, [map, loaded, noiseVisible]);
  useEffect(() => {
    if (!map || !loaded) return;
    setVis(map, CROWD_LAYER, crowdVisible);
    setVis(map, CROWD_BURST, crowdVisible);
  }, [map, loaded, crowdVisible]);
  useEffect(() => {
    if (!map || !loaded) return;
    setVis(map, LIGHT_GLOW, lightVisible);
    setVis(map, LIGHT_CORE, lightVisible);
  }, [map, loaded, lightVisible]);

  return null;
}

function setVis(map: mapboxgl.Map, id: string, visible: boolean) {
  if (!map.getLayer(id)) return;
  map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
}
