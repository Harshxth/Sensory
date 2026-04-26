"use client";

import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
};

/**
 * Thermal noise heatmap using google.maps.visualization.HeatmapLayer.
 * Cool blue → cyan → green → yellow → orange → red, weighted by noise score.
 */
export function NoiseHeatmap({ venues, visible = true }: Props) {
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
        weight: Math.max(0.1, (v.sensory?.noise ?? 0) / 10),
      }));

    const heatmap = new visualization.HeatmapLayer({
      data: points,
      radius: 55,
      opacity: 0.82,
      // Banded thermal palette — discrete steps create the geothermal-style bands
      // visible on the reference map (cool green → yellow → orange → red → magenta).
      gradient: [
        "rgba(0, 0, 0, 0)",
        "rgba(34, 197, 94, 0.45)", // green-500
        "rgba(132, 204, 22, 0.55)", // lime-500
        "rgba(190, 242, 100, 0.6)", // lime-300
        "rgba(253, 224, 71, 0.7)", // yellow-300
        "rgba(251, 191, 36, 0.78)", // amber-400
        "rgba(245, 158, 11, 0.82)", // amber-500
        "rgba(249, 115, 22, 0.86)", // orange-500
        "rgba(234, 88, 12, 0.9)", // orange-600
        "rgba(220, 38, 38, 0.92)", // red-600
        "rgba(190, 18, 60, 0.94)", // rose-700
        "rgba(157, 23, 77, 0.97)", // pink-800
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
