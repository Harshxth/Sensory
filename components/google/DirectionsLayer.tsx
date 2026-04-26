"use client";

import { useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Icon } from "@/components/ui/Icon";
import { RouteFlags, computeRouteFlags, type RouteFlag } from "./RouteFlags";
import type { Alert, Venue } from "@/types";

type Mode = "WALK" | "DRIVE" | "TRANSIT" | "BICYCLE";

type Step = {
  instruction: string;
  distanceMeters: number;
  durationSec: number;
  maneuver?: string;
};

export type Route = {
  durationSec: number;
  distanceMeters: number;
  encodedPolyline: string;
  steps: Step[];
};

type Props = {
  destination: { lat: number; lng: number; name?: string } | null;
  venues: Venue[];
  alerts: Alert[];
  onClose: () => void;
  /** Lift navigation up to the parent so it can hide other chrome and render fullscreen. */
  onStartNavigation: (payload: { route: Route; flags: RouteFlag[] }) => void;
};

export function DirectionsLayer({
  destination,
  venues,
  alerts,
  onClose,
  onStartNavigation,
}: Props) {
  const map = useMap();
  const geometry = useMapsLibrary("geometry");

  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<Mode>("WALK");
  const [route, setRoute] = useState<Route | null>(null);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState<RouteFlag[]>([]);

  useEffect(() => {
    if (!destination) return;
    if (!navigator.geolocation) {
      setOrigin({ lat: 28.0587, lng: -82.4139 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setOrigin({ lat: 28.0587, lng: -82.4139 }),
      { timeout: 4000 },
    );
  }, [destination]);

  useEffect(() => {
    if (!destination || !origin) return;
    setLoading(true);
    setError(null);
    fetchRoute(origin, destination, mode)
      .then((r) => {
        setRoute(r);
        setError(null);
      })
      .catch((e: Error) => {
        setError(e.message);
        setRoute(null);
      })
      .finally(() => setLoading(false));
  }, [origin, destination, mode]);

  useEffect(() => {
    if (!map || !geometry || !route) return;
    const path = geometry.encoding.decodePath(route.encodedPolyline);
    const line = new google.maps.Polyline({
      path,
      strokeColor: "#2f6c27",
      strokeWeight: 6,
      strokeOpacity: 0.9,
      map,
    });
    setPolyline(line);

    const bounds = new google.maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 120, bottom: 80, left: 60, right: 60 });

    // Compute route condition flags from nearby venues + alerts
    setFlags(computeRouteFlags(path, venues, alerts));

    return () => {
      line.setMap(null);
    };
  }, [map, geometry, route, venues, alerts]);

  if (!destination) return null;

  const minutes = route ? Math.round(route.durationSec / 60) : null;
  const miles = route ? (route.distanceMeters / 1609.344).toFixed(1) : null;

  return (
    <>
      <RouteFlags flags={flags} visible={!loading} />

      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
        <div className="bg-surface-container-lowest/97 backdrop-blur-xl rounded-2xl shadow-2xl border border-on-surface/8 overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-on-surface/8">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
                <Icon name="directions" filled size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  Directions
                </div>
                <div className="font-bold text-on-surface truncate text-sm">
                  to {destination.name ?? "destination"}
                </div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close directions"
              onClick={() => {
                polyline?.setMap(null);
                onClose();
              }}
              className="p-1 rounded-full hover:bg-on-surface/5 text-on-surface-variant"
            >
              <Icon name="close" size={18} />
            </button>
          </header>

          {(
            <div className="flex gap-1 px-3 py-2 border-b border-on-surface/8">
              {[
                { v: "WALK" as const, icon: "directions_walk", label: "Walk" },
                { v: "DRIVE" as const, icon: "directions_car", label: "Drive" },
                { v: "TRANSIT" as const, icon: "directions_transit", label: "Transit" },
                { v: "BICYCLE" as const, icon: "directions_bike", label: "Bike" },
              ].map((m) => (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setMode(m.v)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 h-9 rounded-lg text-xs font-bold transition-colors ${
                    mode === m.v
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-variant hover:bg-on-surface/5"
                  }`}
                >
                  <Icon name={m.icon} size={16} />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-3 max-h-[55vh] overflow-y-auto">
            {error && <p className="text-xs text-error font-bold">{error}</p>}
            {loading && !error && (
              <p className="text-xs text-on-surface-variant">Calculating route…</p>
            )}

            {route && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-on-surface tabular-nums">
                    {minutes} min
                  </span>
                  <span className="text-sm text-on-surface-variant">· {miles} mi</span>
                </div>

                {flags.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-orange-800 text-xs font-bold mb-1">
                      <Icon name="report" filled size={14} />
                      {flags.length} sensory condition{flags.length === 1 ? "" : "s"} on route
                    </div>
                    <ul className="text-[11px] text-orange-900/80 space-y-0.5 ml-5 list-disc">
                      {flags.slice(0, 3).map((f) => (
                        <li key={f.id}>{f.label}</li>
                      ))}
                      {flags.length > 3 && (
                        <li>+ {flags.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {origin && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onStartNavigation({ route, flags })}
                      className="bg-primary text-on-primary font-bold text-sm h-11 rounded-full flex items-center justify-center gap-2 hover:bg-primary-dim transition-colors shadow-sm shadow-primary/30"
                    >
                      <Icon name="navigation" filled size={18} />
                      Start
                    </button>
                    <a
                      href={buildGoogleMapsUrl(origin, destination, mode)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface-container-lowest border border-on-surface/15 text-on-surface font-bold text-sm h-11 rounded-full flex items-center justify-center gap-1.5 hover:bg-on-surface/5 transition-colors"
                    >
                      <Icon name="open_in_new" size={16} />
                      Google
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

async function fetchRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: Mode,
): Promise<Route> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Maps API key missing");

  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration",
    },
    body: JSON.stringify({
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
      },
      destination: {
        location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
      },
      travelMode: mode,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Routes ${res.status}: ${body.slice(0, 120)}`);
  }
  const data = (await res.json()) as {
    routes?: {
      duration?: string;
      distanceMeters?: number;
      polyline?: { encodedPolyline?: string };
      legs?: {
        steps?: {
          navigationInstruction?: { instructions?: string; maneuver?: string };
          distanceMeters?: number;
          staticDuration?: string;
        }[];
      }[];
    }[];
  };
  const r = data.routes?.[0];
  if (!r?.polyline?.encodedPolyline) throw new Error("No route found");

  const durationSec = parseInt(String(r.duration ?? "0").replace(/[^\d]/g, ""), 10) || 0;
  const steps: Step[] =
    r.legs?.flatMap(
      (leg) =>
        leg.steps?.map((s) => ({
          instruction: s.navigationInstruction?.instructions ?? "Continue",
          maneuver: s.navigationInstruction?.maneuver,
          distanceMeters: s.distanceMeters ?? 0,
          durationSec:
            parseInt(String(s.staticDuration ?? "0").replace(/[^\d]/g, ""), 10) || 0,
        })) ?? [],
    ) ?? [];

  return {
    durationSec,
    distanceMeters: r.distanceMeters ?? 0,
    encodedPolyline: r.polyline.encodedPolyline,
    steps,
  };
}

function buildGoogleMapsUrl(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: Mode,
): string {
  const modeMap: Record<Mode, string> = {
    WALK: "walking",
    DRIVE: "driving",
    TRANSIT: "transit",
    BICYCLE: "bicycling",
  };
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&travelmode=${modeMap[mode]}`
  );
}

function maneuverIcon(maneuver?: string): string {
  if (!maneuver) return "arrow_forward";
  const m = maneuver.toLowerCase();
  if (m.includes("left") && m.includes("u")) return "u_turn_left";
  if (m.includes("right") && m.includes("u")) return "u_turn_right";
  if (m.includes("sharp_left")) return "turn_sharp_left";
  if (m.includes("sharp_right")) return "turn_sharp_right";
  if (m.includes("slight_left")) return "turn_slight_left";
  if (m.includes("slight_right")) return "turn_slight_right";
  if (m.includes("left")) return "turn_left";
  if (m.includes("right")) return "turn_right";
  if (m.includes("merge")) return "merge";
  if (m.includes("roundabout")) return "roundabout_left";
  if (m.includes("destination")) return "place";
  if (m.includes("ferry")) return "directions_boat";
  return "straight";
}
