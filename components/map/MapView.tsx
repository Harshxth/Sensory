"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapProvider } from "./MapContext";

const USF_CENTER: [number, number] = [-82.4139, 28.0587];
const LIGHT_STYLE = "mapbox://styles/mapbox/streets-v12";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

type Props = {
  interactive?: boolean;
  initialZoom?: number;
  styleUrl?: string;
  className?: string;
  children?: ReactNode;
};

function useSystemMapStyle(override?: string): string {
  const [style, setStyle] = useState(override ?? LIGHT_STYLE);

  useEffect(() => {
    if (override) {
      setStyle(override);
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setStyle(mq.matches ? DARK_STYLE : LIGHT_STYLE);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [override]);

  return style;
}

/**
 * MapView hosts the Mapbox instance and exposes it via MapContext.
 * Layer components (SensoryLayer, AlertLayer, WheelchairLayer) consume that
 * context and add their own sources + layers when the map is ready.
 */
export function MapView({
  interactive = true,
  initialZoom = 12,
  styleUrl,
  className = "absolute inset-0",
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolvedStyle = useSystemMapStyle(styleUrl);

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-label="Map of accessibility data"
      />
      <MapProvider
        containerRef={containerRef}
        styleUrl={resolvedStyle}
        options={{
          container: containerRef.current as HTMLDivElement,
          style: resolvedStyle,
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
