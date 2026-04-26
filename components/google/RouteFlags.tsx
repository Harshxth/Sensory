"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Icon } from "@/components/ui/Icon";
import type { Venue, Alert } from "@/types";

export type RouteFlag = {
  id: string;
  position: { lat: number; lng: number };
  kind: "noise" | "crowd" | "light" | "alert";
  severity: "low" | "moderate" | "high";
  label: string;
};

type Props = {
  flags: RouteFlag[];
  visible?: boolean;
};

const KIND_META: Record<
  RouteFlag["kind"],
  { icon: string; bg: string; label: string }
> = {
  noise: { icon: "volume_up", bg: "#ea580c", label: "Loud zone" },
  crowd: { icon: "groups", bg: "#dc2626", label: "Crowded" },
  light: { icon: "flare", bg: "#d97706", label: "Bright light" },
  alert: { icon: "campaign", bg: "#be123c", label: "Live alert" },
};

export function RouteFlags({ flags, visible = true }: Props) {
  if (!visible) return null;
  return (
    <>
      {flags.map((f) => {
        const meta = KIND_META[f.kind];
        return (
          <AdvancedMarker key={f.id} position={f.position}>
            <div className="relative" title={`${meta.label}: ${f.label}`}>
              <span
                aria-hidden
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: meta.bg,
                  opacity: 0.35,
                  filter: "blur(4px)",
                  transform: "scale(1.6)",
                }}
              />
              <span
                aria-label={`${meta.label}: ${f.label}`}
                className="relative flex items-center justify-center w-7 h-7 rounded-full text-white shadow-lg ring-2 ring-white"
                style={{ background: meta.bg }}
              >
                <Icon name={meta.icon} filled size={16} />
              </span>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

// Compute warnings for a route polyline by checking which venues + alerts
// fall within `tolerance` meters of any route point.
export function computeRouteFlags(
  path: google.maps.LatLng[],
  venues: Venue[],
  alerts: Alert[],
  toleranceMeters = 80,
): RouteFlag[] {
  const flags: RouteFlag[] = [];
  const polyline = new google.maps.Polyline({ path });

  venues.forEach((v) => {
    if (!v.location?.coordinates) return;
    const point = new google.maps.LatLng(
      v.location.coordinates[1],
      v.location.coordinates[0],
    );
    if (
      !google.maps.geometry.poly.isLocationOnEdge(point, polyline, toleranceMeters / 111000)
    ) {
      return;
    }
    const noise = v.sensory?.noise ?? 0;
    const crowd = v.sensory?.crowd ?? 0;
    const light = v.sensory?.lighting ?? 0;
    if (noise >= 7) {
      flags.push({
        id: `noise-${v._id}`,
        position: { lat: point.lat(), lng: point.lng() },
        kind: "noise",
        severity: noise >= 9 ? "high" : "moderate",
        label: `${v.name} (noise ${noise.toFixed(0)}/10)`,
      });
    } else if (crowd >= 7) {
      flags.push({
        id: `crowd-${v._id}`,
        position: { lat: point.lat(), lng: point.lng() },
        kind: "crowd",
        severity: crowd >= 9 ? "high" : "moderate",
        label: `${v.name} (crowd ${crowd.toFixed(0)}/10)`,
      });
    } else if (light >= 8) {
      flags.push({
        id: `light-${v._id}`,
        position: { lat: point.lat(), lng: point.lng() },
        kind: "light",
        severity: "moderate",
        label: `${v.name} (bright)`,
      });
    }
  });

  const now = Date.now();
  alerts.forEach((a) => {
    if (new Date(a.start).getTime() > now || new Date(a.end).getTime() < now) return;
    const ring = a.geo_bounds.coordinates[0];
    const cx = ring.reduce((s, [x]) => s + x, 0) / ring.length;
    const cy = ring.reduce((s, [, y]) => s + y, 0) / ring.length;
    const point = new google.maps.LatLng(cy, cx);
    if (google.maps.geometry.poly.isLocationOnEdge(point, polyline, 200 / 111000)) {
      flags.push({
        id: `alert-${a._id}`,
        position: { lat: cy, lng: cx },
        kind: "alert",
        severity: a.severity,
        label: a.title,
      });
    }
  });

  return flags;
}
