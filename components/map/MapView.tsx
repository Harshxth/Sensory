"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useRouter } from "next/navigation";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Venue } from "@/types";

const USF_CENTER: [number, number] = [-82.4139, 28.0587];

type Props = {
  /** When false, disables interaction — for landing page preview */
  interactive?: boolean;
  /** Restrict to specific zoom + center */
  initialZoom?: number;
  /** Show heatmap dots */
  showVenues?: boolean;
  className?: string;
};

export function MapView({
  interactive = true,
  initialZoom = 13,
  showVenues = true,
  className = "absolute inset-0",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: USF_CENTER,
      zoom: initialZoom,
      interactive,
      attributionControl: false,
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive, initialZoom]);

  useEffect(() => {
    if (!showVenues) return;
    fetch(
      "/api/venues?bounds=-82.55,27.95,-82.30,28.15",
      { cache: "no-store" },
    )
      .then((r) => r.json())
      .then((d) => setVenues(d.venues ?? []))
      .catch(() => setVenues([]));
  }, [showVenues]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showVenues || venues.length === 0) return;

    const addLayer = () => {
      const features = venues
        .filter((v) => v.location?.coordinates)
        .map((v) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: v.location.coordinates,
          },
          properties: {
            id: String(v._id),
            name: v.name,
            composite: v.sensory?.composite ?? 5,
          },
        }));

      const data = { type: "FeatureCollection" as const, features };

      if (map.getSource("venues")) {
        (map.getSource("venues") as mapboxgl.GeoJSONSource).setData(data);
        return;
      }

      map.addSource("venues", { type: "geojson", data });

      map.addLayer({
        id: "venue-halo",
        type: "circle",
        source: "venues",
        paint: {
          "circle-radius": 28,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "composite"],
            0, "#22c55e",
            3, "#aff49e",
            5, "#eab308",
            7, "#fa8e67",
            10, "#aa371c",
          ],
          "circle-opacity": 0.25,
          "circle-blur": 0.6,
        },
      });

      map.addLayer({
        id: "venue-dots",
        type: "circle",
        source: "venues",
        paint: {
          "circle-radius": 8,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "composite"],
            0, "#22c55e",
            3, "#65a30d",
            5, "#eab308",
            7, "#ea580c",
            10, "#aa371c",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      if (interactive) {
        map.on("click", "venue-dots", (e) => {
          const id = e.features?.[0]?.properties?.id;
          if (id) router.push(`/venue/${id}`);
        });
        map.on("mouseenter", "venue-dots", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "venue-dots", () => {
          map.getCanvas().style.cursor = "";
        });
      }
    };

    if (map.loaded()) {
      addLayer();
    } else {
      map.on("load", addLayer);
    }
  }, [venues, showVenues, interactive, router]);

  return <div ref={containerRef} className={className} />;
}
