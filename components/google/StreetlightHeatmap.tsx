"use client";

import { useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

type Feature = { id: number; lat: number; lon: number };

const TAMPA_BBOX = "-82.55,27.95,-82.30,28.15";

/**
 * Heatmap showing where street lamps are densest. Useful for low-vision /
 * blind users planning night walks. Data caveat: OSM coverage is spotty in
 * many US areas — the legend will note this.
 */
export function StreetlightHeatmap({ visible = true }: { visible?: boolean }) {
  const map = useMap();
  const visualization = useMapsLibrary("visualization");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!visible || fetched) return;
    setFetched(true);
    fetch(`/api/streetlights?bounds=${TAMPA_BBOX}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setFeatures(d.features ?? []))
      .catch(() => setFeatures([]));
  }, [visible, fetched]);

  useEffect(() => {
    if (!map || !visualization) return;
    if (features.length === 0) return;

    const points = features.map((f) => ({
      location: new google.maps.LatLng(f.lat, f.lon),
      weight: 1,
    }));

    const heatmap = new visualization.HeatmapLayer({
      data: points,
      radius: 30,
      opacity: 0.55,
      gradient: [
        "rgba(0,0,0,0)",
        "rgba(254, 240, 138, 0.5)", // pale gold
        "rgba(253, 224, 71, 0.7)",
        "rgba(250, 204, 21, 0.8)",
        "rgba(234, 179, 8, 0.9)", // strong gold
      ],
      maxIntensity: 8,
      dissipating: true,
      map: visible ? map : null,
    });

    return () => {
      heatmap.setMap(null);
    };
  }, [map, visualization, features, visible]);

  return null;
}
