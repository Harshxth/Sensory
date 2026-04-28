"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
};

/**
 * Crowd visualization - population-density-style heatmap. Cool blues for
 * sparse, deep purples for packed. Distinct from noise (warm spectrum) and
 * light (gold spectrum).
 */
export function CrowdHeatmap({ venues, visible = true }: Props) {
  const map = useMap();
  const visualization = useMapsLibrary("visualization");

  useEffect(() => {
    if (!map || !visualization) return;

    const points = venues
      .filter((v) => v.location?.coordinates && v.sensory)
      .map((v) => ({
        location: new google.maps.LatLng(
          v.location.coordinates[1],
          v.location.coordinates[0],
        ),
        weight: Math.max(0.1, (v.sensory?.crowd ?? 0) / 10),
      }));

    const heatmap = new visualization.HeatmapLayer({
      data: points,
      radius: 50,
      opacity: 0.7,
      gradient: [
        "rgba(0,0,0,0)",
        "rgba(186, 230, 253, 0.45)", // sky-200
        "rgba(125, 211, 252, 0.55)", // sky-300
        "rgba(56, 189, 248, 0.65)", // sky-400
        "rgba(99, 102, 241, 0.75)", // indigo-500
        "rgba(124, 58, 237, 0.85)", // violet-600
        "rgba(168, 85, 247, 0.9)", // purple-500
        "rgba(192, 38, 211, 0.95)", // fuchsia-600
        "rgba(162, 28, 175, 1)", // fuchsia-700
        "rgba(112, 26, 117, 1)", // purple-900
      ],
      maxIntensity: 1,
      dissipating: true,
      map: visible ? map : null,
    });

    return () => {
      heatmap.setMap(null);
    };
  }, [map, visualization, venues, visible]);

  return null;
}
