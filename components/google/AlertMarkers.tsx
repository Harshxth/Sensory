"use client";

import { useEffect, useState } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { fetchAlerts } from "@/lib/map-data";
import type { Alert } from "@/types";

type Props = {
  visible?: boolean;
  onSelect?: (alert: Alert) => void;
};

const SEVERITY_BG: Record<string, string> = {
  high: "#dc2626",
  moderate: "#ea580c",
  low: "#0891b2",
};

export function AlertMarkers({ visible = true, onSelect }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchAlerts().then(setAlerts);
  }, []);

  if (!visible) return null;

  return (
    <>
      {alerts.map((a) => {
        const ring = a.geo_bounds.coordinates[0];
        const cx = ring.reduce((s, [x]) => s + x, 0) / ring.length;
        const cy = ring.reduce((s, [, y]) => s + y, 0) / ring.length;
        const bg = SEVERITY_BG[a.severity] ?? "#0891b2";
        return (
          <AdvancedMarker
            key={String(a._id)}
            position={{ lat: cy, lng: cx }}
            onClick={() => onSelect?.(a)}
          >
            <div className="relative -translate-y-1/2 cursor-pointer">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full opacity-50 animate-ping"
                style={{ background: bg }}
              />
              <span
                aria-label={`Alert: ${a.title}`}
                className="relative flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ring-2 ring-white shadow-lg"
                style={{ background: bg }}
              >
                !
              </span>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
