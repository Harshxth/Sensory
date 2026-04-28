"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
};

/**
 * Lighting visualization - gold/sunlight palette. Pale yellow for soft, deep
 * gold for harsh. Distinct from noise (red spectrum) and crowd (blue/purple).
 */
export function LightHeatmap({ venues, visible = true }: Props) {
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
        weight: Math.max(0.1, (v.sensory?.lighting ?? 0) / 10),
      }));

    const heatmap = new visualization.HeatmapLayer({
      data: points,
      radius: 45,
      opacity: 0.7,
      gradient: [
        "rgba(0,0,0,0)",
        "rgba(254, 249, 195, 0.4)", // yellow-100
        "rgba(254, 240, 138, 0.55)", // yellow-200
        "rgba(253, 224, 71, 0.7)", // yellow-300
        "rgba(250, 204, 21, 0.8)", // yellow-400
        "rgba(234, 179, 8, 0.88)", // yellow-500
        "rgba(202, 138, 4, 0.95)", // yellow-600
        "rgba(161, 98, 7, 1)", // yellow-700
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
