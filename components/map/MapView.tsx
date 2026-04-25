"use client";

import { ReactNode, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapProvider } from "./MapContext";

const USF_CENTER: [number, number] = [-82.4139, 28.0587];

type Props = {
  interactive?: boolean;
  initialZoom?: number;
  styleUrl?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * MapView hosts the Mapbox instance and exposes it via MapContext.
 * Layer components (SensoryLayer, AlertLayer, WheelchairLayer) consume that
 * context and add their own sources + layers when the map is ready.
 */
export function MapView({
  interactive = true,
  initialZoom = 12,
  styleUrl = "mapbox://styles/mapbox/dark-v11",
  className = "absolute inset-0",
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={containerRef} className={className} aria-label="Map of accessibility data" />
      <MapProvider
        containerRef={containerRef}
        options={{
          container: containerRef.current as HTMLDivElement,
          style: styleUrl,
          center: USF_CENTER,
          zoom: initialZoom,
          interactive,
          attributionControl: false,
          pitchWithRotate: false,
        }}
      >
        {children}
      </MapProvider>
    </>
  );
}
