"use client";

import { useEffect, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { fetchVenues } from "@/lib/map-data";
import type { Venue } from "@/types";

type Props = {
  onSelect: (venue: Venue) => void;
  refreshKey?: number;
  onVenuesLoaded?: (venues: Venue[]) => void;
};

const STATUS_COLOR = (composite: number) =>
  composite <= 3 ? "#14b8a6" : composite <= 6 ? "#f59e0b" : "#ea580c";

/**
 * Small clickable dots over each venue we have sensory data for.
 * They sit on top of the heatmap so users can click into the panel without
 * relying on Google's POI hit-testing (which only works for known businesses).
 */
export function VenueMarkers({ onSelect, refreshKey = 0, onVenuesLoaded }: Props) {
  const map = useMap();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    fetchVenues().then((v) => {
      setVenues(v);
      onVenuesLoaded?.(v);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (!map) return null;

  return (
    <>
      {venues.map((v) => {
        if (!v.location?.coordinates) return null;
        const composite = v.sensory?.composite ?? 5;
        return (
          <AdvancedMarker
            key={String(v._id)}
            position={{
              lat: v.location.coordinates[1],
              lng: v.location.coordinates[0],
            }}
            onClick={() => onSelect(v)}
          >
            <div
              role="button"
              aria-label={`Open sensory profile for ${v.name}`}
              className="relative cursor-pointer focus:outline-none"
              tabIndex={0}
            >
              <span
                aria-hidden
                className="block w-3 h-3 rounded-full ring-2 ring-white shadow-md"
                style={{ background: STATUS_COLOR(composite) }}
              />
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
