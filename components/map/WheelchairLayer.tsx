"use client";

import { useEffect } from "react";
import type mapboxgl from "mapbox-gl";
import { useMap } from "./MapContext";

const SOURCE_ID = "wheelchair-source";
const RING_LAYER = "wheelchair-ring";

type Props = {
  visible?: boolean;
};

/**
 * Wheelchair overlay — draws a blue accessibility ring around venues whose
 * SensoryLayer-fed `wheelchair` property is "yes" or "limited", and a muted
 * marker for "no". Reuses the sensory-venues source, so no extra fetch.
 */
export function WheelchairLayer({ visible = true }: Props) {
  const { map, loaded } = useMap();

  useEffect(() => {
    if (!map || !loaded) return;
    if (!map.getSource("sensory-venues")) {
      // SensoryLayer hasn't initialized yet — nothing to do.
      return;
    }

    if (!map.getLayer(RING_LAYER)) {
      map.addLayer({
        id: RING_LAYER,
        type: "circle",
        source: "sensory-venues",
        filter: ["all", ["!", ["has", "point_count"]]],
        paint: {
          "circle-radius": 14,
          "circle-color": "transparent",
          "circle-stroke-width": 3,
          "circle-stroke-opacity": 0.85,
          "circle-stroke-color": [
            "match",
            ["get", "wheelchair"],
            "yes", "#22d3ee",
            "limited", "#f59e0b",
            "no", "#64748b",
            "rgba(0,0,0,0)",
          ],
        },
      });
    }
  }, [map, loaded]);

  useEffect(() => {
    if (!map || !loaded) return;
    if (!map.getLayer(RING_LAYER)) return;
    map.setLayoutProperty(RING_LAYER, "visibility", visible ? "visible" : "none");
  }, [map, loaded, visible]);

  return null;
}
