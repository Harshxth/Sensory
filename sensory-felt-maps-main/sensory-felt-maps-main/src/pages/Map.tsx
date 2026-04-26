import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Camera,
  Bell,
  Settings as SettingsIcon,
  Accessibility,
  Layers,
  Locate,
  Volume2,
  X,
  ChevronUp,
} from "lucide-react";
import VenueDetail, { Venue } from "@/components/VenueDetail";
import { useSensory } from "@/context/SensoryContext";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------
 * Premium Main Map Screen
 *
 *  - Full-bleed interactive map canvas
 *  - Floating glass search + profile entry
 *  - Live alert banner (dismissible)
 *  - Sensory heatmap auras with intensity cues + animated rings
 *  - Wheelchair toggle (state lifted to global prefs)
 *  - Layers / Recenter floating controls
 *  - Camera FAB ("sensory check-in")
 *  - Venue panel: bottom sheet on mobile, side panel on desktop
 *  - A11y: landmarks, aria-pressed/expanded, focus mgmt, focus return
 * ------------------------------------------------------------- */

type Level = "calm" | "moderate" | "intense";

interface MapVenue extends Venue {
  x: number;
  y: number;
  level: Level;
  size: number;
  /** Whether this venue is step-free / wheelchair friendly. */
}

const VENUES: MapVenue[] = [
  {
    id: "linden",
    name: "Linden Street Cafe",
    category: "Cafe · Quiet",
    x: 22,
    y: 30,
    level: "calm",
    size: 130,
    sensory: { noise: 22, light: 30, crowd: 28, smell: 35, exits: 80 },
    accessibility: { wheelchair: true, blind: true, deaf: true, esl: true },
    desc: "Warm jazz, low chatter, soft lamps. Step-free entrance.",
    reviews: [
      { who: "Maya", when: "2h ago", text: "Went at 9am — stayed an hour. Calm enough to read.", level: "calm" },
      { who: "Idris", when: "yesterday", text: "Quiet back room exists. Ask the barista.", level: "calm" },
    ],
  },
  {
    id: "argo",
    name: "Argo Night Market",
    category: "Market · Lively",
    x: 55,
    y: 55,
    level: "intense",
    size: 180,
    sensory: { noise: 88, light: 78, crowd: 92, smell: 70, exits: 45 },
    accessibility: { wheelchair: true, blind: false, deaf: true, esl: true },
    desc: "Bright string lights, music, dense crowds. Step-free but tight aisles.",
    reviews: [{ who: "Ren", when: "30m ago", text: "Loud right now. Saturday night peak.", level: "intense" }],
  },
  {
    id: "fern",
    name: "Fern Library Annex",
    category: "Library · Silent",
    x: 72,
    y: 22,
    level: "calm",
    size: 110,
    sensory: { noise: 12, light: 38, crowd: 18, smell: 20, exits: 70 },
    accessibility: { wheelchair: true, blind: true, deaf: true, esl: true },
    desc: "Whispered voices only. Soft daylight, fragrance-free.",
    reviews: [{ who: "Sol", when: "1d ago", text: "Sensory-friendly hour 2–4pm Tuesdays.", level: "calm" }],
  },
  {
    id: "tide",
    name: "Tide & Stone Diner",
    category: "Restaurant",
    x: 38,
    y: 70,
    level: "moderate",
    size: 140,
    sensory: { noise: 55, light: 50, crowd: 60, smell: 65, exits: 60 },
    accessibility: { wheelchair: true, blind: false, deaf: true, esl: true },
    desc: "Steady hum, warm lighting, ramp at side entrance.",
    reviews: [{ who: "Priya", when: "3h ago", text: "Brought my noise-canceling buds, fine for me.", level: "moderate" }],
  },
  {
    id: "olive",
    name: "Olive Park Pavilion",
    category: "Park · Outdoor",
    x: 80,
    y: 78,
    level: "calm",
    size: 160,
    sensory: { noise: 28, light: 60, crowd: 22, smell: 18, exits: 95 },
    accessibility: { wheelchair: true, blind: true, deaf: true, esl: true },
    desc: "Open lawn, tree shade, accessible paths and benches.",
    reviews: [{ who: "Tomas", when: "5h ago", text: "Peaceful at sunset.", level: "calm" }],
  },
];

const LEVEL_LABEL: Record<Level, string> = {
  calm: "Calm",
  moderate: "Mixed",
  intense: "Busy",
};

const Map = () => {
  const nav = useNavigate();
  const { prefs, setPrefs } = useSensory();
  const [active, setActive] = useState<MapVenue | null>(null);
  const [alertOpen, setAlertOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);

  const activeRef = useRef<HTMLButtonElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const wheelchair = prefs.wheelchairDefault;

  // Filter by wheelchair toggle (don't hide — fade non-accessible to communicate)
  const visibleVenues = useMemo(
    () => VENUES.filter((v) => (wheelchair ? v.accessibility.wheelchair : true)),
    [wheelchair],
  );

  /* ----- Focus management for the venue panel ----- */
  useEffect(() => {
    if (active) {
      // remember the originating element so we can return focus on close
      lastFocused.current = (document.activeElement as HTMLElement) ?? null;
      // move focus to the sheet's close button on next paint
      const t = window.setTimeout(() => sheetCloseRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    } else {
      // restore focus when the panel closes
      lastFocused.current?.focus?.();
    }
  }, [active]);

  /* ----- ESC closes panels ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (active) setActive(null);
      else if (layersOpen) setLayersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, layersOpen]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Skip link for keyboard users */}
      <a
        href="#map-region"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to map
      </a>

      {/* ============ MAP CANVAS ============ */}
      <main
        id="map-region"
        role="application"
        aria-label="Interactive sensory map. Tap a venue to see its sensory profile."
        className="absolute inset-0 map-canvas focus:outline-none"
        tabIndex={-1}
      >
        {/* Faux water ribbon */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path
            d="M -5 60 C 20 50, 40 75, 60 62 S 95 55, 110 65 L 110 80 L -5 80 Z"
            fill="hsl(195 45% 78% / 0.6)"
          />
          <path
            d="M -5 60 C 20 50, 40 75, 60 62 S 95 55, 110 65"
            stroke="hsl(195 50% 55% / 0.55)"
            strokeWidth="0.25"
            fill="none"
          />
        </svg>

        {/* Routes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path
            d="M 5 20 Q 35 25 55 55 T 95 78"
            stroke={wheelchair ? "hsl(150 45% 38%)" : "hsl(150 35% 38% / 0.55)"}
            strokeWidth={wheelchair ? "0.4" : "0.35"}
            fill="none"
            strokeDasharray="0.8 1.2"
          />
          <path
            d="M 10 80 Q 40 70 60 50 T 90 25"
            stroke="hsl(150 35% 38% / 0.45)"
            strokeWidth="0.3"
            fill="none"
          />
        </svg>

        {/* Venues + sensory heatmap auras */}
        {visibleVenues.map((v) => {
          const isActive = active?.id === v.id;
          // Intensity cue: aura scales with sensory severity (avg)
          const avg = (v.sensory.noise + v.sensory.light + v.sensory.crowd) / 3;
          const intensityScale = 0.85 + (avg / 100) * 0.5;
          const auraSize = v.size * intensityScale;
          return (
            <button
              key={v.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => setActive(v)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
              style={{ left: `${v.x}%`, top: `${v.y}%` }}
              aria-label={`${v.name}, ${LEVEL_LABEL[v.level]} sensory level. ${
                v.accessibility.wheelchair ? "Step-free." : "Not step-free."
              } Open profile.`}
              aria-pressed={isActive}
            >
              {/* Heatmap aura — sized by intensity */}
              <span
                className={cn("aura", `aura-${v.level}`)}
                style={{
                  width: auraSize,
                  height: auraSize,
                  left: -auraSize / 2,
                  top: -auraSize / 2,
                  position: "absolute",
                }}
                aria-hidden
              />
              {/* Pulse ring for the active pin */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full"
                  style={{
                    width: 76,
                    height: 76,
                    boxShadow: "0 0 0 2px hsl(var(--primary) / 0.45)",
                    animation: "pulse-ring 2.2s ease-out infinite",
                  }}
                />
              )}
              <span
                className={cn(
                  "relative grid place-items-center w-11 h-11 rounded-full glass-strong transition-transform group-hover:scale-110",
                  v.level === "calm" && "ring-aura-calm",
                  v.level === "moderate" && "ring-aura-moderate",
                  v.level === "intense" && "ring-aura-intense",
                  isActive && "scale-110",
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    v.level === "calm" && "bg-signal-calm",
                    v.level === "moderate" && "bg-signal-moderate",
                    v.level === "intense" && "bg-signal-intense",
                  )}
                  aria-hidden
                />
              </span>
              {isActive && (
                <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-foreground bg-surface-raised/95 backdrop-blur px-2.5 py-1 rounded-full border border-border shadow-sm">
                  {v.name}
                </span>
              )}
            </button>
          );
        })}
      </main>

      {/* ============ TOP — search + profile + alert ============ */}
      <header
        role="banner"
        className="absolute top-0 inset-x-0 z-30 px-4 pt-[max(env(safe-area-inset-top),1rem)]"
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex-1 glass-strong rounded-full pl-5 pr-2 py-2 flex items-center gap-3 shadow-md"
          >
            <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
            <label className="sr-only" htmlFor="map-search">
              Search a place, street, or feeling
            </label>
            <input
              id="map-search"
              placeholder="Search a place, street, or feeling…"
              className="flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none min-w-0"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => nav("/settings")}
              aria-label="Open profile and accessibility settings"
              className="tap w-10 h-10 grid place-items-center rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            >
              <SettingsIcon className="w-5 h-5" aria-hidden />
            </button>
          </form>
        </div>

        {/* Live alert banner */}
        {alertOpen && (
          <div
            role="status"
            aria-live="polite"
            className="max-w-2xl mx-auto mt-3 animate-fade-up"
          >
            <div className="glass rounded-2xl px-4 py-3 flex items-start gap-3 border border-accent/30 shadow-sm">
              <span className="mt-1 w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">
                  Argo Night Market just got louder
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reported by 4 people · 3 min ago
                </p>
              </div>
              <Bell className="w-4 h-4 text-muted-foreground mt-1 shrink-0" aria-hidden />
              <button
                type="button"
                onClick={() => setAlertOpen(false)}
                aria-label="Dismiss alert"
                className="tap w-8 h-8 -m-1.5 grid place-items-center rounded-full hover:bg-surface-raised text-muted-foreground"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============ RIGHT — floating controls ============ */}
      <nav
        aria-label="Map controls"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2"
      >
        <FabIcon
          label="Toggle map layers"
          aria-expanded={layersOpen}
          onClick={() => setLayersOpen((o) => !o)}
          active={layersOpen}
        >
          <Layers className="w-5 h-5" aria-hidden />
        </FabIcon>
        <FabIcon label="Recenter on my location">
          <Locate className="w-5 h-5" aria-hidden />
        </FabIcon>
        <button
          type="button"
          onClick={() => setPrefs({ wheelchairDefault: !wheelchair })}
          aria-pressed={wheelchair}
          aria-label={
            wheelchair
              ? "Wheelchair routes on. Tap to turn off."
              : "Wheelchair routes off. Tap to prioritise step-free routes."
          }
          className={cn(
            "tap w-12 h-12 grid place-items-center rounded-2xl border transition-colors shadow-sm",
            wheelchair
              ? "bg-primary text-primary-foreground border-primary-glow shadow-glow"
              : "glass-strong border-border text-foreground hover:bg-surface-raised",
          )}
        >
          <Accessibility className="w-5 h-5" aria-hidden />
        </button>
      </nav>

      {/* Layers popover */}
      {layersOpen && (
        <div
          role="dialog"
          aria-label="Map layer options"
          className="absolute right-20 top-1/2 -translate-y-1/2 z-30 w-56 glass-strong rounded-2xl border border-border p-3 shadow-md animate-fade-up"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-1 pb-2">
            Show on map
          </p>
          <ul className="space-y-1">
            {[
              { id: "heat", label: "Sensory heatmap", on: true },
              { id: "routes", label: "Step-free routes", on: wheelchair },
              { id: "alerts", label: "Live alerts", on: true },
            ].map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-surface-raised transition-colors"
                  aria-pressed={l.on}
                >
                  <span>{l.label}</span>
                  <span
                    className={cn(
                      "w-8 h-4 rounded-full relative transition-colors",
                      l.on ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-3 h-3 rounded-full bg-foreground transition-all",
                        l.on ? "left-[18px]" : "left-0.5",
                      )}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ============ LEGEND ============ */}
      <aside
        aria-label="Sensory level legend"
        className="hidden md:flex absolute left-4 bottom-6 z-30 glass rounded-2xl px-4 py-3 items-center gap-4 text-xs border border-border shadow-sm"
      >
        <LegendDot label="Calm" cls="bg-signal-calm" />
        <LegendDot label="Moderate" cls="bg-signal-moderate" />
        <LegendDot label="Intense" cls="bg-signal-intense" />
      </aside>

      {/* ============ CAMERA FAB ============ */}
      <button
        type="button"
        aria-label="Add a sensory check-in with your camera"
        className="md:hidden tap absolute z-30 left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+96px)] w-16 h-16 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-glow animate-pulse-ring"
      >
        <Camera className="w-6 h-6" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Add a sensory check-in"
        className="hidden md:grid tap absolute z-30 right-6 bottom-6 w-14 h-14 rounded-full bg-primary text-primary-foreground place-items-center shadow-glow"
      >
        <Camera className="w-5 h-5" aria-hidden />
      </button>

      {/* ============ VENUE PANEL ============ */}
      {active && (
        <>
          {/* Mobile bottom sheet */}
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="venue-sheet-title"
            className="md:hidden absolute inset-x-0 bottom-0 z-40 animate-sheet-up"
          >
            <div className="glass-strong rounded-t-3xl border-t border-border shadow-float pb-[max(env(safe-area-inset-bottom),1rem)]">
              <div className="flex items-center justify-between px-3 pt-2">
                <button
                  ref={sheetCloseRef}
                  type="button"
                  aria-label={`Close ${active.name}`}
                  onClick={() => setActive(null)}
                  className="tap w-9 h-9 grid place-items-center rounded-full hover:bg-surface-raised text-muted-foreground"
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
                <span
                  className="block w-12 h-1.5 rounded-full bg-muted mx-auto"
                  aria-hidden
                />
                <span className="w-9 h-9" aria-hidden />
              </div>
              <h2 id="venue-sheet-title" className="sr-only">
                {active.name}
              </h2>
              <VenueDetail venue={active} compact />
              <div className="px-5 pb-2 flex gap-2">
                <button
                  type="button"
                  className="tap flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold py-3 hover:bg-primary-glow transition-colors"
                >
                  <Volume2 className="w-4 h-4" aria-hidden /> Listen to this place
                </button>
                <button
                  type="button"
                  className="tap inline-flex items-center justify-center rounded-full border border-border px-4 py-3 text-sm hover:bg-surface-raised transition-colors"
                  aria-label="Expand details"
                >
                  <ChevronUp className="w-4 h-4 mr-1" aria-hidden /> More
                </button>
              </div>
            </div>
          </section>

          {/* Desktop side panel */}
          <aside
            role="dialog"
            aria-modal="false"
            aria-labelledby="venue-side-title"
            className="hidden md:flex absolute z-40 right-6 top-24 bottom-6 w-[420px] flex-col"
          >
            <div className="glass-strong rounded-3xl shadow-float border border-border h-full overflow-hidden flex flex-col animate-fade-up">
              <div className="flex items-center justify-between px-3 pt-3">
                <h2 id="venue-side-title" className="sr-only">
                  {active.name}
                </h2>
                <span aria-hidden className="w-8" />
                <button
                  ref={sheetCloseRef}
                  type="button"
                  aria-label={`Close ${active.name}`}
                  onClick={() => setActive(null)}
                  className="tap w-9 h-9 grid place-items-center rounded-full hover:bg-surface-raised text-muted-foreground"
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>
              <VenueDetail venue={active} />
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

/* ---------------- Pieces ---------------- */

const FabIcon = ({
  children,
  label,
  onClick,
  active,
  ...rest
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
} & React.AriaAttributes) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={cn(
      "tap w-12 h-12 grid place-items-center rounded-2xl border text-foreground transition-colors shadow-sm",
      active
        ? "bg-primary/15 border-primary-glow/60"
        : "glass-strong border-border hover:bg-surface-raised",
    )}
    {...rest}
  >
    {children}
  </button>
);

const LegendDot = ({ label, cls }: { label: string; cls: string }) => (
  <span className="inline-flex items-center gap-2 text-muted-foreground">
    <span className={cn("w-2.5 h-2.5 rounded-full", cls)} aria-hidden />
    <span>{label}</span>
  </span>
);

export default Map;
