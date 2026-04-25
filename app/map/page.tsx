"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MapView } from "@/components/map/MapView";
import { SensoryLayer } from "@/components/map/SensoryLayer";
import { AlertLayer } from "@/components/map/AlertLayer";
import { WheelchairLayer } from "@/components/map/WheelchairLayer";
import { MapSearchBar, MapControls } from "@/components/map/MapShellChrome";
import { VenuePanel } from "@/components/venue/VenuePanel";
import { fetchAlerts } from "@/lib/map-data";
import type { Alert, Venue } from "@/types";

type ToggleKey = "sensory" | "wheelchair" | "alerts";

export default function MapPage() {
  const [selected, setSelected] = useState<Venue | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [layers, setLayers] = useState<Record<ToggleKey, boolean>>({
    sensory: true,
    wheelchair: false,
    alerts: true,
  });

  useEffect(() => {
    fetchAlerts().then(setAlerts);
  }, []);

  const toggle = (k: ToggleKey) => setLayers((s) => ({ ...s, [k]: !s[k] }));

  const activeAlert = alerts.find((a) => {
    const now = Date.now();
    return new Date(a.start).getTime() <= now && new Date(a.end).getTime() >= now;
  });

  return (
    <>
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

      <main className="relative flex-1 w-full overflow-hidden pb-20 md:pb-0 bg-[#0a0f12]">
        <MapView interactive initialZoom={12} className="absolute inset-0">
          <SensoryLayer
            visible={layers.sensory}
            onSelectVenue={(v) => setSelected(v)}
          />
          <WheelchairLayer visible={layers.wheelchair} />
          <AlertLayer visible={layers.alerts} />
        </MapView>

        <MapSearchBar />

        {/* Layer toggles — top-right on mobile, sits beside zoom controls on desktop */}
        <div className="absolute right-4 top-20 md:top-24 z-30 flex flex-col gap-2">
          <ToggleChip
            icon="graphic_eq"
            label="Sensory"
            active={layers.sensory}
            onToggle={() => toggle("sensory")}
          />
          <ToggleChip
            icon="accessible"
            label="Wheelchair"
            active={layers.wheelchair}
            onToggle={() => toggle("wheelchair")}
          />
          <ToggleChip
            icon="campaign"
            label="Alerts"
            active={layers.alerts}
            onToggle={() => toggle("alerts")}
          />
        </div>

        <MapControls />

        {activeAlert && !bannerDismissed && layers.alerts && (
          <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
            <div className="bg-on-background text-background rounded-2xl p-4 shadow-xl border border-orange-400/40 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/30 text-orange-300 flex items-center justify-center flex-shrink-0">
                <Icon name="campaign" filled size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-300 mb-0.5">
                  Live alert
                </div>
                <div className="font-bold text-sm leading-tight">{activeAlert.title}</div>
                <div className="text-xs opacity-70 mt-1 line-clamp-2">
                  {activeAlert.description}
                </div>
              </div>
              <button
                aria-label="Dismiss alert"
                onClick={() => setBannerDismissed(true)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Map legend bottom-left */}
        <div className="hidden md:flex absolute bottom-6 left-6 z-30 bg-on-background/85 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-white/10 flex-col gap-1.5 text-background">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">
            Sensory load
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Legend swatch="#14b8a6" label="Calm" />
            <Legend swatch="#f59e0b" label="Moderate" />
            <Legend swatch="#ea580c" label="Intense" />
          </div>
        </div>

        <VenuePanel venue={selected} onClose={() => setSelected(null)} />
      </main>

      <BottomNav />
    </>
  );
}

function ToggleChip({
  icon,
  label,
  active,
  onToggle,
}: {
  icon: string;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`Toggle ${label}`}
      onClick={onToggle}
      className={`min-h-[44px] backdrop-blur-md rounded-full px-4 py-2 shadow-md border flex items-center gap-2 text-xs font-bold transition-colors ${
        active
          ? "bg-on-background text-background border-white/15"
          : "bg-on-background/40 text-white/70 border-white/10 hover:bg-on-background/70"
      }`}
    >
      <Icon name={icon} filled={active} size={16} />
      {label}
    </button>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className="w-3 h-3 rounded-full"
        style={{ background: swatch, boxShadow: `0 0 12px ${swatch}66` }}
      />
      <span className="font-semibold">{label}</span>
    </span>
  );
}
