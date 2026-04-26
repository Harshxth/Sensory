"use client";

import { useEffect } from "react";
import type mapboxgl from "mapbox-gl";
import { useMap } from "./MapContext";
import { fetchNearbyPlace, fetchPlaceDetails } from "@/lib/google-places";
import type { GooglePlaceDetails } from "@/lib/google-places";

type Props = {
  /** Called when a Google place is found near the click point. */
  onPlace: (place: GooglePlaceDetails, source: { lat: number; lng: number }) => void;
  /** Layer IDs that should NOT trigger this handler (existing dot/marker layers). */
  excludeLayers?: string[];
};

/**
 * Listens for map clicks anywhere (except on existing layers like our venues),
 * resolves the nearest Google place, fetches its details, and bubbles up.
 */
export function MapClickHandler({ onPlace, excludeLayers = [] }: Props) {
  const { map, loaded } = useMap();

  useEffect(() => {
    if (!map || !loaded) return;

    const handleClick = async (e: mapboxgl.MapMouseEvent) => {
      // If the click hit an existing layer feature (venue dot, alert badge), skip.
      if (excludeLayers.length > 0) {
        const features = map.queryRenderedFeatures(e.point, { layers: excludeLayers });
        if (features.length > 0) return;
      }

      const { lng, lat } = e.lngLat;
      const summary = await fetchNearbyPlace(lat, lng);
      if (!summary) return;
      const details = await fetchPlaceDetails(summary.place_id);
      if (!details) return;
      onPlace(details, { lat, lng });
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, loaded, onPlace, excludeLayers]);

  return null;
}
