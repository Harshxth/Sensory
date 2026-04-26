"use client";

import { useEffect, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { useMap } from "./MapContext";
import {
  fetchWheelchairOSM,
  wheelchairToFeatureCollection,
  type WheelchairFeature,
} from "@/lib/map-data";

const RING_LAYER = "wheelchair-ring";
const OSM_SOURCE = "wheelchair-osm";
const OSM_DOTS = "wheelchair-osm-dots";

type Props = {
  visible?: boolean;
};

export function WheelchairLayer({ visible = true }: Props) {
  const { map, loaded } = useMap();
  const [features, setFeatures] = useState<WheelchairFeature[]>([]);
  const [fetched, setFetched] = useState(false);

  // Lazy-fetch OSM once the layer is first toggled on.
  useEffect(() => {
    if (!visible || fetched) return;
    setFetched(true);
    fetchWheelchairOSM().then(setFeatures);
  }, [visible, fetched]);

  // Ring around each venue based on its osm_tags.wheelchair (cached on the venue).
  useEffect(() => {
    if (!map || !loaded) return;
    if (!map.getSource("sensory-venues")) return;
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
          "circle-stroke-opacity": 0.9,
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

  // OSM points layer (curb cuts + wheelchair-tagged nodes).
  useEffect(() => {
    if (!map || !loaded) return;
    if (features.length === 0) return;
    const data = wheelchairToFeatureCollection(features);
    const existing = map.getSource(OSM_SOURCE) as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
      return;
    }
    map.addSource(OSM_SOURCE, { type: "geojson", data });
    map.addLayer({
      id: OSM_DOTS,
      type: "circle",
      source: OSM_SOURCE,
      paint: {
        "circle-radius": 5,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
        "circle-color": [
          "match",
          ["get", "status"],
          "yes", "#22d3ee",
          "limited", "#f59e0b",
          "no", "#64748b",
          "kerb_lowered", "#06b6d4",
          "#22d3ee",
        ],
      },
    });
  }, [map, loaded, features]);

  // Visibility toggle for both layers.
  useEffect(() => {
    if (!map || !loaded) return;
    const value = visible ? "visible" : "none";
    [RING_LAYER, OSM_DOTS].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", value);
    });
  }, [map, loaded, visible]);

  return null;
}
