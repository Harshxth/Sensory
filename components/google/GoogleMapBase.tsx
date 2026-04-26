"use client";

import { ReactNode } from "react";
import { APIProvider, Map, MapEvent } from "@vis.gl/react-google-maps";
import { fetchPlaceDetails } from "@/lib/google-places";
import type { GooglePlaceDetails } from "@/lib/google-places";

const USF_CENTER = { lat: 28.0587, lng: -82.4139 };

/**
 * Wraps the entire app section that needs Google Maps context. Use this once,
 * then put both <GoogleMap /> and any HTML overlays that need useMap() inside.
 */
export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-container-low text-on-surface-variant text-sm p-4 text-center">
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY missing — add it to .env.local and restart the dev server.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["visualization", "places", "routes", "marker", "geometry"]}>
      {children}
    </APIProvider>
  );
}

type Props = {
  children?: ReactNode;
  /** Called when the user taps on a Google POI (with placeId) or empty space. */
  onPlaceSelect?: (place: GooglePlaceDetails | null) => void;
  defaultZoom?: number;
};

/**
 * The actual map. Children of this component render INSIDE the map's div
 * (good for layers + advanced markers). HTML overlays that need fullscreen
 * positioning (like NavigationOverlay) should be siblings of <GoogleMap>
 * inside <GoogleMapsProvider>, not children of it.
 */
export function GoogleMap({ children, onPlaceSelect, defaultZoom = 13 }: Props) {
  const handleClick = async (e: MapEvent<unknown>) => {
    const ev = e as unknown as {
      detail?: { placeId?: string; latLng?: { lat: number; lng: number } };
      stop?: () => void;
    };
    const placeId = ev.detail?.placeId;
    if (!placeId) return;
    ev.stop?.();
    const details = await fetchPlaceDetails(placeId);
    if (details) onPlaceSelect?.(details);
  };

  return (
    <Map
      defaultCenter={USF_CENTER}
      defaultZoom={defaultZoom}
      mapId="d2f9e44a8c1b1e2"
      gestureHandling="greedy"
      disableDefaultUI={false}
      clickableIcons={true}
      onClick={handleClick}
      colorScheme="FOLLOW_SYSTEM"
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    >
      {children}
    </Map>
  );
}

/**
 * Backwards-compatible: the old name still works, just behaves as Provider+Map.
 */
export function GoogleMapBase(props: Props) {
  return (
    <GoogleMapsProvider>
      <GoogleMap {...props} />
    </GoogleMapsProvider>
  );
}
