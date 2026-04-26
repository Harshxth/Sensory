"use client";

import { useEffect, useState } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { fetchWheelchairOSM, type WheelchairFeature } from "@/lib/map-data";

type Props = {
  visible?: boolean;
};

const STATUS_COLOR: Record<WheelchairFeature["status"], string> = {
  yes: "#22d3ee",
  limited: "#f59e0b",
  no: "#64748b",
  kerb_lowered: "#06b6d4",
};

export function WheelchairMarkers({ visible = true }: Props) {
  const [features, setFeatures] = useState<WheelchairFeature[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!visible || fetched) return;
    setFetched(true);
    fetchWheelchairOSM().then(setFeatures);
  }, [visible, fetched]);

  if (!visible) return null;

  return (
    <>
      {features.map((f) => (
        <AdvancedMarker key={f.id} position={{ lat: f.lat, lng: f.lon }}>
          <span
            aria-label={`Wheelchair ${f.status}`}
            className="block w-2.5 h-2.5 rounded-full ring-2 ring-white shadow"
            style={{ background: STATUS_COLOR[f.status] }}
          />
        </AdvancedMarker>
      ))}
    </>
  );
}
