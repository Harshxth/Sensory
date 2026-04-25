"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// F1.1 — calm, muted Mapbox style centered on USF / downtown Tampa.
const USF_CENTER: [number, number] = [-82.4139, 28.0587];

export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11", // TODO: swap to custom calm style
      center: USF_CENTER,
      zoom: 13,
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  return <div ref={containerRef} className="absolute inset-0" />;
}
