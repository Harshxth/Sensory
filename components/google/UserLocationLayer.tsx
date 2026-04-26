"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Icon } from "@/components/ui/Icon";

type Coords = { lat: number; lng: number; accuracy: number; heading: number | null };

/**
 * Live "you are here" layer:
 *   - Watches geolocation continuously while the map is mounted
 *   - Renders a pulsing blue dot at the current position
 *   - Renders a translucent accuracy circle (radius = position.accuracy meters)
 *   - Auto-pans + zooms to the user the first time we get a fix
 *   - Exposes a floating "recenter" button bottom-right
 *   - Renders a tiny status pill in the bottom-left while waiting / on error
 */
export function UserLocationLayer({ enabled = true }: { enabled?: boolean }) {
  const map = useMap();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const didCenterRef = useRef(false);

  // Watch geolocation on mount
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported on this device");
      return;
    }
    setRequested(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setError(null);
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? 30,
          heading: pos.coords.heading,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Position unavailable");
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out");
        } else {
          setError("Could not get location");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  // Auto-center the first time we get a fix
  useEffect(() => {
    if (!map || !coords || didCenterRef.current) return;
    didCenterRef.current = true;
    map.panTo({ lat: coords.lat, lng: coords.lng });
    if ((map.getZoom() ?? 0) < 15) map.setZoom(16);
  }, [map, coords]);

  // Maintain the accuracy circle imperatively
  useEffect(() => {
    if (!map || !coords) return;
    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center: { lat: coords.lat, lng: coords.lng },
        radius: coords.accuracy,
        fillColor: "#1d72f5",
        fillOpacity: 0.12,
        strokeColor: "#1d72f5",
        strokeOpacity: 0.35,
        strokeWeight: 1,
        clickable: false,
      });
    } else {
      circleRef.current.setCenter({ lat: coords.lat, lng: coords.lng });
      circleRef.current.setRadius(coords.accuracy);
    }
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, coords]);

  const recenter = useCallback(() => {
    if (!map || !coords) return;
    map.panTo({ lat: coords.lat, lng: coords.lng });
    map.setZoom(Math.max(map.getZoom() ?? 16, 16));
  }, [map, coords]);

  return (
    <>
      {coords && (
        <AdvancedMarker position={{ lat: coords.lat, lng: coords.lng }} zIndex={9999}>
          <div className="relative w-5 h-5 -translate-x-1/2 -translate-y-1/2" aria-label="Your location">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[#1d72f5]/30 animate-ping"
            />
            <span
              aria-hidden
              className="absolute inset-0 rounded-full ring-[3px] ring-white shadow-md"
              style={{ background: "#1d72f5" }}
            />
          </div>
        </AdvancedMarker>
      )}

      {/* Floating recenter button */}
      <button
        type="button"
        onClick={recenter}
        disabled={!coords}
        aria-label="Center on my location"
        className="absolute right-4 bottom-28 md:bottom-8 z-30 w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface shadow-xl border border-on-surface/15 flex items-center justify-center hover:bg-surface-container-low active:scale-95 transition-all disabled:opacity-50"
      >
        <Icon
          name={coords ? "my_location" : "location_searching"}
          filled={!!coords}
          size={22}
        />
      </button>

      {/* Status pill while waiting or on error */}
      {(error || (requested && !coords)) && (
        <div className="absolute left-4 bottom-28 md:bottom-8 z-30 px-3 h-9 rounded-full bg-surface-container-lowest/95 backdrop-blur border border-on-surface/15 shadow-lg flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
          <Icon
            name={error ? "location_off" : "location_searching"}
            size={14}
          />
          {error ?? "Finding you…"}
        </div>
      )}
    </>
  );
}
