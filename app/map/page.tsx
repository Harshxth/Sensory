"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GoogleMap, GoogleMapsProvider } from "@/components/google/GoogleMapBase";
import { NoiseHeatmap } from "@/components/google/NoiseHeatmap";
import { CrowdHeatmap } from "@/components/google/CrowdHeatmap";
import { LightHeatmap } from "@/components/google/LightHeatmap";
import { HeatmapLegend } from "@/components/google/HeatmapLegend";
import { VenueMarkers } from "@/components/google/VenueMarkers";
import { AlertMarkers } from "@/components/google/AlertMarkers";
import { WheelchairMarkers } from "@/components/google/WheelchairMarkers";
import { DirectionsLayer, type Route } from "@/components/google/DirectionsLayer";
import { NavigationOverlay } from "@/components/google/NavigationOverlay";
import type { RouteFlag } from "@/components/google/RouteFlags";
import { PlaceInfoCard } from "@/components/google/PlaceInfoCard";
import { SensoryDetailPanel } from "@/components/google/SensoryDetailPanel";
import { fetchAlerts } from "@/lib/map-data";
import type { Alert, Venue } from "@/types";
import type { GooglePlaceDetails } from "@/lib/google-places";

type ToggleKey = "noise" | "crowd" | "light" | "wheelchair" | "alerts";

export default function MapPage() {
  const [selected, setSelected] = useState<Venue | null>(null);
  const [googlePlace, setGooglePlace] = useState<GooglePlaceDetails | null>(null);
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [navigation, setNavigation] = useState<{
    route: Route;
    flags: RouteFlag[];
    destinationName: string;
  } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [layers, setLayers] = useState<Record<ToggleKey, boolean>>({
    noise: true,
    crowd: true,
    light: true,
    wheelchair: false,
    alerts: true,
  });
  const [venues, setVenues] = useState<Venue[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchAlerts().then(setAlerts);
  }, [refreshKey]);

  // After venues refresh, re-sync the open panel so its sensory bars reflect
  // the new community-weighted scores immediately.
  useEffect(() => {
    if (!selected) return;
    const fresh = venues.find((v) => String(v._id) === String(selected._id));
    if (fresh && fresh !== selected) setSelected(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues]);

  // Reset detail panel when switching places.
  useEffect(() => {
    setDetailOpen(false);
  }, [selected?._id, googlePlace?.place_id]);

  const toggle = (k: ToggleKey) => setLayers((s) => ({ ...s, [k]: !s[k] }));
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  const activeAlert = alerts.find((a) => {
    const now = Date.now();
    return new Date(a.start).getTime() <= now && new Date(a.end).getTime() >= now;
  });

  const openDirections = () => {
    if (selected?.location?.coordinates) {
      setDestination({
        lat: selected.location.coordinates[1],
        lng: selected.location.coordinates[0],
        name: selected.name,
      });
    } else if (googlePlace?.geometry?.location) {
      setDestination({
        lat: googlePlace.geometry.location.lat,
        lng: googlePlace.geometry.location.lng,
        name: googlePlace.name,
      });
    }
  };

  return (
    <>
      {!navigation && (
        <TopAppBar
          title="SensoryPath"
          leading={{ icon: "menu", label: "Menu", href: "/settings" }}
          trailing={
            <button
              aria-label="Profile"
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary bg-primary-container flex items-center justify-center text-on-primary-container"
            >
              <Icon name="person" filled size={20} />
            </button>
          }
        />
      )}

      <main
        className="relative w-full overflow-hidden pb-20 md:pb-0"
        style={{ height: "100dvh" }}
      >
        <GoogleMapsProvider>
          <GoogleMap
            onPlaceSelect={(place) => {
              setSelected(null);
              setGooglePlace(place);
            }}
          >
            <VenueMarkers
              onSelect={(v) => {
                setGooglePlace(null);
                setSelected(v);
              }}
              onVenuesLoaded={setVenues}
              refreshKey={refreshKey}
            />
            <NoiseHeatmap venues={venues} visible={layers.noise} />
            <CrowdHeatmap venues={venues} visible={layers.crowd} />
            <LightHeatmap venues={venues} visible={layers.light} />
            <AlertMarkers visible={layers.alerts} />
            <WheelchairMarkers visible={layers.wheelchair} />
            <DirectionsLayer
              destination={destination}
              venues={venues}
              alerts={alerts}
              onClose={() => setDestination(null)}
              onStartNavigation={({ route, flags }) => {
                setNavigation({
                  route,
                  flags,
                  destinationName: destination?.name ?? "destination",
                });
              }}
            />
          </GoogleMap>
          {/* NavigationOverlay sits OUTSIDE <GoogleMap> so its absolute
              positioning fills the viewport instead of being trapped inside
              the map's tile container. It still has access to useMap()
              because it's inside the same <GoogleMapsProvider>. */}
          {navigation && (
            <NavigationOverlay
              destinationName={navigation.destinationName}
              steps={navigation.route.steps}
              encodedPolyline={navigation.route.encodedPolyline}
              totalDurationSec={navigation.route.durationSec}
              totalDistanceMeters={navigation.route.distanceMeters}
              flags={navigation.flags}
              onEnd={() => {
                setNavigation(null);
                setDestination(null);
              }}
            />
          )}
        </GoogleMapsProvider>

        {/* All map chrome hides when fullscreen navigation is active */}
        {!navigation && (
        <div className="absolute right-4 top-20 md:top-24 z-30 flex flex-col gap-2">
          <ToggleChip
            icon="graphic_eq"
            label="Noise"
            active={layers.noise}
            onToggle={() => toggle("noise")}
            accent="#fb923c"
          />
          <ToggleChip
            icon="groups"
            label="Crowd"
            active={layers.crowd}
            onToggle={() => toggle("crowd")}
            accent="#a855f7"
          />
          <ToggleChip
            icon="lightbulb"
            label="Light"
            active={layers.light}
            onToggle={() => toggle("light")}
            accent="#fde047"
          />
          <ToggleChip
            icon="accessible"
            label="Wheelchair"
            active={layers.wheelchair}
            onToggle={() => toggle("wheelchair")}
            accent="#22d3ee"
          />
          <ToggleChip
            icon="campaign"
            label="Alerts"
            active={layers.alerts}
            onToggle={() => toggle("alerts")}
            accent="#ef4444"
          />
        </div>
        )}

        {/* Live alert banner */}
        {!navigation && activeAlert && !bannerDismissed && layers.alerts && !destination && (
          <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
            <div className="bg-surface-container-lowest/95 backdrop-blur-xl text-on-surface rounded-2xl p-4 shadow-2xl border border-orange-500/30 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                <Icon name="campaign" filled size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-0.5">
                  Live alert
                </div>
                <div className="font-bold text-sm leading-tight">{activeAlert.title}</div>
                <div className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                  {activeAlert.description}
                </div>
              </div>
              <button
                aria-label="Dismiss alert"
                onClick={() => setBannerDismissed(true)}
                className="p-1 rounded-full hover:bg-on-surface/5 text-on-surface-variant"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Sensory layer legend with intensity gradients */}
        {!navigation && (
          <HeatmapLegend
            visible={{ noise: layers.noise, crowd: layers.crowd, light: layers.light }}
          />
        )}

        {!navigation && (
          <>
            <PlaceInfoCard
              venue={selected}
              google={googlePlace}
              onClose={() => {
                setSelected(null);
                setGooglePlace(null);
                setDetailOpen(false);
              }}
              onDirections={openDirections}
              onMore={() => setDetailOpen(true)}
            />
            <SensoryDetailPanel
              venue={selected}
              google={googlePlace}
              open={detailOpen && (!!selected || !!googlePlace)}
              onClose={() => setDetailOpen(false)}
              onUpdated={bumpRefresh}
              onVenueCreated={async (newId) => {
                bumpRefresh();
                try {
                  const res = await fetch(`/api/venues/${newId}`, { cache: "no-store" });
                  if (res.ok) {
                    const data = (await res.json()) as { venue: Venue };
                    setGooglePlace(null);
                    setSelected(data.venue);
                  }
                } catch {
                  // ignore
                }
              }}
            />
          </>
        )}
      </main>

      {!navigation && <BottomNav />}
    </>
  );
}

function ToggleChip({
  icon,
  label,
  active,
  onToggle,
  accent,
}: {
  icon: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`Toggle ${label}`}
      onClick={onToggle}
      className={`min-h-[40px] backdrop-blur-xl rounded-full px-3 py-1.5 shadow-lg border flex items-center gap-2 text-xs font-bold transition-all active:scale-95 ${
        active
          ? "bg-surface-container-lowest text-on-surface border-on-surface/15"
          : "bg-surface-container-lowest/70 text-on-surface-variant border-on-surface/10 hover:bg-surface-container-lowest/90"
      }`}
      style={
        active && accent
          ? { boxShadow: `0 4px 16px ${accent}55, 0 1px 2px rgba(0,0,0,0.08)` }
          : undefined
      }
    >
      <span
        aria-hidden
        className="w-2.5 h-2.5 rounded-full transition-opacity"
        style={{
          background: accent ?? "#22d3ee",
          opacity: active ? 1 : 0.35,
          boxShadow: active && accent ? `0 0 8px ${accent}` : "none",
        }}
      />
      <Icon name={icon} filled={active} size={14} />
      {label}
    </button>
  );
}

