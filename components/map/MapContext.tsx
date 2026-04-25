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
  children,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  options: mapboxgl.MapOptions;
  children: ReactNode;
}) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const initRef = useRef(false);

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

    return () => {
      instance.remove();
      setMap(null);
      setLoaded(false);
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MapContext.Provider value={{ map, loaded }}>{children}</MapContext.Provider>;
}
