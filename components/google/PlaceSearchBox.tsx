"use client";

import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Icon } from "@/components/ui/Icon";

type Props = {
  onSelect: (place: { lat: number; lng: number; name: string }) => void;
  /** Bias predictions toward this center (defaults to USF Tampa). */
  bias?: { lat: number; lng: number; radiusM?: number };
};

/**
 * Search box that floats over the top of the map. Uses Google Places
 * Autocomplete (legacy widget — battle-tested) attached to a styled input.
 * On selection, fires `onSelect({ lat, lng, name })` so the parent can
 * setDestination → DirectionsLayer kicks in automatically.
 */
export function PlaceSearchBox({ onSelect, bias }: Props) {
  const places = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const center = bias ?? { lat: 28.0587, lng: -82.4139, radiusM: 12000 };
    // Build a bbox approximation around the bias center (~12km default).
    const r = (center.radiusM ?? 12000) / 111_000; // degrees per ~km
    const bounds = new google.maps.LatLngBounds(
      { lat: center.lat - r, lng: center.lng - r * 1.15 },
      { lat: center.lat + r, lng: center.lng + r * 1.15 },
    );
    const ac = new places.Autocomplete(inputRef.current, {
      fields: ["geometry.location", "name", "formatted_address", "place_id"],
      types: ["establishment", "geocode"],
      bounds,
      strictBounds: false,
    });
    autocompleteRef.current = ac;
    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;
      onSelect({
        lat: loc.lat(),
        lng: loc.lng(),
        name: place.name ?? place.formatted_address ?? "Destination",
      });
      // Clear the input after selection so the user can search again
      if (inputRef.current) {
        inputRef.current.blur();
      }
    });
    return () => {
      listener.remove();
      autocompleteRef.current = null;
    };
  }, [places, bias, onSelect]);

  return (
    <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
      <div
        className={`bg-surface-container-lowest/95 backdrop-blur-xl rounded-full border flex items-center p-1.5 transition-shadow ${
          focused
            ? "shadow-2xl border-primary/40"
            : "shadow-lg border-on-surface/8 hover:shadow-xl"
        }`}
      >
        <span className="p-2.5 text-on-surface-variant" aria-hidden>
          <Icon name="search" size={20} />
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          autoComplete="off"
          placeholder="Search places, addresses…"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/70 text-base px-1 min-w-0"
        />
        <button
          type="button"
          aria-label="Clear"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-on-surface/5 transition-colors"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}
