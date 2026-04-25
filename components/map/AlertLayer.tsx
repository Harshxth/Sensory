"use client";

import { useEffect, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { useMap } from "./MapContext";
import { alertsToFeatureCollection, fetchAlerts } from "@/lib/map-data";
import type { Alert } from "@/types";

const SOURCE_ID = "alerts-source";
const HALO_LAYER = "alerts-halo";
const BADGE_LAYER = "alerts-badge";
const ICON_LAYER = "alerts-icon";

type Props = {
  visible?: boolean;
  onSelectAlert?: (alert: Alert) => void;
};

export function AlertLayer({ visible = true, onSelectAlert }: Props) {
  const { map, loaded } = useMap();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchAlerts().then(setAlerts);
  }, []);

  useEffect(() => {
    if (!map || !loaded) return;
    const data = alertsToFeatureCollection(alerts);

    const existing = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
      return;
    }
    map.addSource(SOURCE_ID, { type: "geojson", data });

    map.addLayer({
      id: HALO_LAYER,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": 30,
        "circle-blur": 0.6,
        "circle-opacity": 0.4,
        "circle-color": [
          "match",
          ["get", "severity"],
          "high", "#fb923c",
          "moderate", "#f59e0b",
          "low", "#22d3ee",
          "#22d3ee",
        ],
      },
    });

    map.addLayer({
      id: BADGE_LAYER,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": 14,
        "circle-color": [
          "match",
          ["get", "severity"],
          "high", "#ea580c",
          "moderate", "#d97706",
          "low", "#0891b2",
          "#0891b2",
        ],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    });

    map.addLayer({
      id: ICON_LAYER,
      type: "symbol",
      source: SOURCE_ID,
      layout: {
        "text-field": "!",
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 16,
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const id = e.features?.[0]?.properties?.id as string;
      if (!id) return;
      const a = alerts.find((x) => String(x._id) === id);
      if (a) onSelectAlert?.(a);
    };
    const setPointer = () => (map.getCanvas().style.cursor = "pointer");
    const clearPointer = () => (map.getCanvas().style.cursor = "");

    map.on("click", BADGE_LAYER, onClick);
    map.on("mouseenter", BADGE_LAYER, setPointer);
    map.on("mouseleave", BADGE_LAYER, clearPointer);

    return () => {
      map.off("click", BADGE_LAYER, onClick);
      map.off("mouseenter", BADGE_LAYER, setPointer);
      map.off("mouseleave", BADGE_LAYER, clearPointer);
    };
  }, [map, loaded, alerts, onSelectAlert]);

  useEffect(() => {
    if (!map || !loaded) return;
    const value = visible ? "visible" : "none";
    [HALO_LAYER, BADGE_LAYER, ICON_LAYER].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", value);
    });
  }, [map, loaded, visible]);

  return null;
}
