"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import mapboxgl from "mapbox-gl";

type Ctx = {
  map: mapboxgl.Map | null;
  loaded: boolean;
};

const MapContext = createContext<Ctx>({ map: null, loaded: false });

export function useMap() {
  return useContext(MapContext);
}

export function MapProvider({
  containerRef,
  options,
  styleUrl,
  children,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  options: mapboxgl.MapOptions;
  styleUrl?: string;
  children: ReactNode;
}) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const initRef = useRef(false);

  // Live-switch the basemap when the system theme changes, without re-creating
  // the map (preserves layers and viewport).
  useEffect(() => {
    if (!map || !styleUrl) return;
    try {
      const current = map.getStyle();
      const currentName = current?.name ?? "";
      const wantDark = styleUrl.includes("/dark-");
      const isDark = /dark/i.test(currentName);
      if (wantDark !== isDark) {
        map.setStyle(styleUrl);
      }
    } catch {
      // map removed
    }
  }, [map, styleUrl]);

  useEffect(() => {
    if (initRef.current) return;
    if (!containerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    initRef.current = true;
    mapboxgl.accessToken = token;

    const instance = new mapboxgl.Map({
      ...options,
      container: containerRef.current,
    });

    instance.on("load", () => setLoaded(true));
    setMap(instance);

    // Adapt to container size changes (handles initial 0×0 render race).
    const ro = new ResizeObserver(() => {
      try {
        instance.resize();
      } catch {
        // map may be removed
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      instance.remove();
      setMap(null);
      setLoaded(false);
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MapContext.Provider value={{ map, loaded }}>{children}</MapContext.Provider>;
}
