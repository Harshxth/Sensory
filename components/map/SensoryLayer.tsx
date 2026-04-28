"use client";

import { useEffect, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { useRouter } from "next/navigation";
import { useMap } from "./MapContext";
import {
  fetchVenues,
  venuesToFeatureCollection,
} from "@/lib/map-data";
import type { Venue } from "@/types";

const SOURCE_ID = "sensory-venues";
const HALO_LAYER = "sensory-halo";
const DOT_LAYER = "sensory-dots";
const PULSE_LAYER = "sensory-pulse";
const LABEL_LAYER = "sensory-labels";
const CLUSTER_LAYER = "sensory-cluster";
const CLUSTER_COUNT_LAYER = "sensory-cluster-count";

type Props = {
  visible?: boolean;
  onSelectVenue?: (venue: Venue) => void;
  refreshKey?: number;
};

export function SensoryLayer({ visible = true, onSelectVenue, refreshKey = 0 }: Props) {
  const { map, loaded } = useMap();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    fetchVenues().then(setVenues);
  }, [refreshKey]);

  useEffect(() => {
    if (!map || !loaded) return;
    const data = venuesToFeatureCollection(venues);

    const existing = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
      return;
    }

    map.addSource(SOURCE_ID, {
      type: "geojson",
      data,
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 48,
    });

    // Cluster bubble (low zoom)
    map.addLayer({
      id: CLUSTER_LAYER,
      type: "circle",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#22d3ee",
        "circle-opacity": 0.85,
        "circle-radius": [
          "step",
          ["get", "point_count"],
          18,
          5, 24,
          15, 32,
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "rgba(255,255,255,0.5)",
      },
    });

    map.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: "symbol",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 13,
      },
      paint: {
        "text-color": "#0a0f12",
      },
    });

    // Halo for individual venues - calm teal → amber → orange
    map.addLayer({
      id: HALO_LAYER,
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 36,
        "circle-blur": 0.7,
        "circle-opacity": 0.45,
        "circle-color": [
          "interpolate", ["linear"], ["get", "composite"],
          0, "#14b8a6",
          3, "#22d3ee",
          5, "#f59e0b",
          7, "#fb923c",
          10, "#ea580c",
        ],
      },
    });

    // Pulse halo (only for venues with recent==1, animated below)
    map.addLayer({
      id: PULSE_LAYER,
      type: "circle",
      source: SOURCE_ID,
      filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "recent"], 1]],
      paint: {
        "circle-radius": 16,
        "circle-color": "#ffffff",
        "circle-opacity": 0.6,
        "circle-blur": 0.4,
      },
    });

    // Solid dot
    map.addLayer({
      id: DOT_LAYER,
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-color": [
          "interpolate", ["linear"], ["get", "composite"],
          0, "#0d9488",
          3, "#0891b2",
          5, "#d97706",
          7, "#ea580c",
          10, "#c2410c",
        ],
      },
    });

    // Composite-score label (only at high zoom, master plan §F1.2)
    map.addLayer({
      id: LABEL_LAYER,
      type: "symbol",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      minzoom: 15,
      layout: {
        "text-field": ["to-string", ["round", ["get", "composite"]]],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 11,
        "text-offset": [0, -2],
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "rgba(0,0,0,0.6)",
        "text-halo-width": 1.2,
      },
    });

    // Click handlers
    const onDotClick = (e: mapboxgl.MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const id = feature.properties?.id as string;
      const venue = venues.find((v) => String(v._id) === id);
      if (venue && onSelectVenue) {
        onSelectVenue(venue);
        return;
      }
      if (id) router.push(`/venue/${id}`);
    };

    const onClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const clusterId = feature.properties?.cluster_id as number;
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return;
        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
        });
      });
    };

    const setPointer = () => (map.getCanvas().style.cursor = "pointer");
    const clearPointer = () => (map.getCanvas().style.cursor = "");

    map.on("click", DOT_LAYER, onDotClick);
    map.on("click", CLUSTER_LAYER, onClusterClick);
    map.on("mouseenter", DOT_LAYER, setPointer);
    map.on("mouseleave", DOT_LAYER, clearPointer);
    map.on("mouseenter", CLUSTER_LAYER, setPointer);
    map.on("mouseleave", CLUSTER_LAYER, clearPointer);

    return () => {
      map.off("click", DOT_LAYER, onDotClick);
      map.off("click", CLUSTER_LAYER, onClusterClick);
      map.off("mouseenter", DOT_LAYER, setPointer);
      map.off("mouseleave", DOT_LAYER, clearPointer);
      map.off("mouseenter", CLUSTER_LAYER, setPointer);
      map.off("mouseleave", CLUSTER_LAYER, clearPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, loaded, venues]);

  // Animate pulse for recent updates (radius oscillates).
  useEffect(() => {
    if (!map || !loaded) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      const radius = 14 + Math.sin(t * 2.4) * 8;
      const opacity = 0.5 + Math.sin(t * 2.4) * 0.2;
      try {
        if (map.getLayer(PULSE_LAYER)) {
          map.setPaintProperty(PULSE_LAYER, "circle-radius", radius);
          map.setPaintProperty(PULSE_LAYER, "circle-opacity", Math.max(0.2, opacity));
        }
      } catch {
        // map removed
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [map, loaded]);

  // Visibility toggle
  useEffect(() => {
    if (!map || !loaded) return;
    const value = visible ? "visible" : "none";
    [HALO_LAYER, DOT_LAYER, PULSE_LAYER, LABEL_LAYER, CLUSTER_LAYER, CLUSTER_COUNT_LAYER].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", value);
    });
  }, [map, loaded, visible]);

  return null;
}
