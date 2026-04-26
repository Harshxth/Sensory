"use client";

import { useEffect, useRef, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Icon } from "@/components/ui/Icon";
import { loadPreferences } from "@/lib/preferences";
import * as haptic from "@/lib/haptic";
import type { AccessibilityNeed } from "@/types";
import type { RouteFlag } from "./RouteFlags";

type TransitStep = {
  vehicle?: string;
  lineName?: string;
  headsign?: string;
  departureStopName?: string;
  arrivalStopName?: string;
  stopCount?: number;
};

type Step = {
  instruction: string;
  distanceMeters: number;
  durationSec: number;
  maneuver?: string;
  transit?: TransitStep;
};

type Props = {
  destinationName: string;
  steps: Step[];
  encodedPolyline: string;
  totalDurationSec: number;
  totalDistanceMeters: number;
  flags: RouteFlag[];
  onEnd: () => void;
};

/**
 * Google-Maps-style fullscreen navigation overlay. Replaces the rest of the
 * map UI when active. Includes:
 *
 *  - Big maneuver card at top with the current step
 *  - ETA / remaining distance / remaining time at bottom
 *  - Live geolocation tracking that auto-advances steps as the user moves
 *  - Voice cues via SpeechSynthesis (turn instructions + condition warnings)
 *  - Profile-aware disability cues (noise / light / wheelchair callouts based
 *    on the user's saved accessibility needs)
 */
export function NavigationOverlay({
  destinationName,
  steps,
  encodedPolyline,
  totalDurationSec,
  totalDistanceMeters,
  flags,
  onEnd,
}: Props) {
  const map = useMap();
  const geometry = useMapsLibrary("geometry");
  const [stepIdx, setStepIdx] = useState(0);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [muted, setMuted] = useState(false);
  const spokenRef = useRef<Set<string>>(new Set());
  const watchRef = useRef<number | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const needsRef = useRef<AccessibilityNeed[]>([]);

  // Load saved profile so we tailor warnings.
  useEffect(() => {
    needsRef.current = loadPreferences().needs ?? [];
  }, []);

  // Live position tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 4000 },
    );
    return () => {
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  // Center map on user + show user marker
  useEffect(() => {
    if (!map || !position) return;
    map.panTo(position);
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#2f6c27",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
    } else {
      userMarkerRef.current.setPosition(position);
    }
    return () => {
      // user marker removed only on unmount via onEnd cleanup
    };
  }, [map, position]);

  useEffect(() => {
    return () => {
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
    };
  }, []);

  // Auto-advance steps based on position
  useEffect(() => {
    if (!geometry || !position || !steps.length) return;
    const path = geometry.encoding.decodePath(encodedPolyline);
    let cumulative = 0;
    let bestIdx = 0;
    let bestDist = Infinity;
    path.forEach((p, i) => {
      const d = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(position.lat, position.lng),
        p,
      );
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    // Sum up step lengths to figure out which step we're "in"
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (acc + s.distanceMeters > bestDist + cumulative) {
        idx = i;
        break;
      }
      acc += s.distanceMeters;
      idx = i;
    }
    setStepIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, geometry, encodedPolyline]);

  // Voice cue + haptic when step changes
  useEffect(() => {
    if (muted) return;
    const step = steps[stepIdx];
    if (!step) return;
    const key = `step-${stepIdx}`;
    if (spokenRef.current.has(key)) return;
    spokenRef.current.add(key);
    speak(stripHtml(step.instruction));
    // Subtle haptic confirms the step changed even if voice is missed.
    haptic.pulse();
  }, [stepIdx, steps, muted]);

  // Voice cue + warning haptic when approaching a flagged condition
  useEffect(() => {
    if (muted || !position) return;
    flags.forEach((f) => {
      const key = `flag-${f.id}`;
      if (spokenRef.current.has(key)) return;
      const dist = haversine(position, f.position);
      if (dist < 120) {
        spokenRef.current.add(key);
        const phrase = warningPhrase(f, needsRef.current);
        if (phrase) speak(phrase);
        haptic.warn();
      }
    });
  }, [position, flags, muted]);

  const remainingSec = steps
    .slice(stepIdx + 1)
    .reduce((s, x) => s + x.durationSec, totalDurationSec / Math.max(steps.length, 1));
  const remainingMeters = steps
    .slice(stepIdx + 1)
    .reduce((s, x) => s + x.distanceMeters, 0) || totalDistanceMeters;
  const eta = new Date(Date.now() + remainingSec * 1000);
  const etaText = eta.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const currentStep = steps[stepIdx];
  const distToNext = currentStep ? formatDistance(currentStep.distanceMeters) : "—";

  const visibleFlags = flags
    .filter((f) => position && haversine(position, f.position) < 400)
    .slice(0, 3);

  return (
    <div className="absolute inset-0 z-[60] flex flex-col pointer-events-none">
      {/* Top: maneuver card */}
      <div className="pointer-events-auto p-4">
        <div className="bg-surface-container-lowest text-on-surface rounded-2xl shadow-2xl border border-on-surface/10 overflow-hidden">
          <div className="flex items-stretch gap-3 p-4">
            <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary text-on-primary rounded-xl px-3 py-2 min-w-[88px]">
              <Icon name={maneuverIcon(currentStep?.maneuver)} filled size={36} />
              <span className="mt-1 text-xs font-bold tabular-nums">{distToNext}</span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">
                In {distToNext}
              </div>
              <div
                className="font-bold text-base leading-snug"
                dangerouslySetInnerHTML={{
                  __html: currentStep?.instruction ?? "Continue to destination",
                }}
              />
              {currentStep?.transit && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full font-bold">
                    <Icon name={vehicleIcon(currentStep.transit.vehicle)} filled size={12} />
                    {currentStep.transit.lineName ?? currentStep.transit.vehicle ?? "Transit"}
                  </span>
                  {currentStep.transit.headsign && (
                    <span className="text-on-surface-variant truncate">
                      → {currentStep.transit.headsign}
                    </span>
                  )}
                  {currentStep.transit.stopCount != null && (
                    <span className="text-on-surface-variant">
                      · {currentStep.transit.stopCount} stops
                    </span>
                  )}
                </div>
              )}
              {currentStep?.transit?.departureStopName && (
                <div className="mt-1 text-[11px] text-on-surface-variant">
                  Board at <strong className="text-on-surface">{currentStep.transit.departureStopName}</strong>
                  {currentStep.transit.arrivalStopName && (
                    <>, off at <strong className="text-on-surface">{currentStep.transit.arrivalStopName}</strong></>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label={muted ? "Unmute voice" : "Mute voice"}
              onClick={() => setMuted((m) => !m)}
              className="self-start p-2 rounded-full hover:bg-on-surface/8 text-on-surface-variant"
            >
              <Icon name={muted ? "volume_off" : "volume_up"} size={20} />
            </button>
          </div>

          {visibleFlags.length > 0 && (
            <div className="px-4 py-2 border-t border-on-surface/10 bg-orange-500/10">
              <div className="flex items-center gap-2 text-orange-200 text-[11px] font-bold mb-1">
                <Icon name="report" filled size={13} />
                Heads up
              </div>
              <ul className="space-y-0.5 text-[12px] text-on-surface">
                {visibleFlags.map((f) => (
                  <li key={f.id} className="flex items-start gap-1.5">
                    <span aria-hidden>•</span>
                    <span>
                      {warningPhrase(f, needsRef.current) ?? f.label}
                      {position && (
                        <span className="text-on-surface-variant">
                          {" "}
                          ({formatDistance(haversine(position, f.position))})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: ETA bar with End button */}
      <div className="mt-auto pointer-events-auto p-4">
        <div className="bg-surface-container-lowest text-on-surface rounded-2xl shadow-2xl border border-on-surface/10 flex items-center gap-3 p-3">
          <button
            type="button"
            onClick={onEnd}
            className="flex-shrink-0 px-4 h-12 rounded-full bg-error text-on-error font-bold text-sm hover:opacity-90 transition-opacity"
          >
            End
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold tabular-nums">
                {Math.max(1, Math.round(remainingSec / 60))} min
              </span>
              <span className="text-sm text-on-surface-variant tabular-nums">
                {formatDistance(remainingMeters)} · ETA {etaText}
              </span>
            </div>
            <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
              to {destinationName}
            </div>
          </div>
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Default ElevenLabs voice (Bella) — used when the user hasn't cloned one yet.
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

let _audioEl: HTMLAudioElement | null = null;
let _audioUrl: string | null = null;

function fallbackBrowserSpeak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/**
 * Speak a navigation cue. Priority:
 *   1. User's cloned ElevenLabs voice (preferences.voiceCloneId)
 *   2. Stock ElevenLabs voice (Bella)
 *   3. Browser SpeechSynthesis (last resort)
 *
 * Calls /api/voice/speak which streams MP3 from ElevenLabs. The previous
 * audio is canceled before playing the next cue so we never overlap.
 */
function speak(text: string) {
  if (typeof window === "undefined" || !text) return;
  let voiceId = DEFAULT_VOICE_ID;
  let lang: "en" | "es" | "zh" = "en";
  try {
    const raw = window.localStorage.getItem("sensory:preferences");
    if (raw) {
      const p = JSON.parse(raw) as { voiceCloneId?: string; language?: "en" | "es" | "zh" };
      if (p.voiceCloneId && typeof p.voiceCloneId === "string") voiceId = p.voiceCloneId;
      if (p.language) lang = p.language;
    }
  } catch {
    /* ignore */
  }

  // Stop any in-flight audio
  if (_audioEl) {
    try {
      _audioEl.pause();
      _audioEl.src = "";
    } catch {
      /* ignore */
    }
  }
  if (_audioUrl) {
    try {
      URL.revokeObjectURL(_audioUrl);
    } catch {
      /* ignore */
    }
    _audioUrl = null;
  }

  fetch("/api/voice/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId, lang }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`speak ${res.status}`);
      const blob = await res.blob();
      _audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(_audioUrl);
      audio.preload = "auto";
      _audioEl = audio;
      await audio.play();
    })
    .catch(() => {
      // ElevenLabs unavailable (no key, network, quota) — fall back so the
      // user still hears the cue. Better robotic than silent.
      fallbackBrowserSpeak(text);
    });
}

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters / 5) * 5} m`;
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  const mi = meters / 1609.344;
  return `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
}

// Tailor the warning phrase to the user's saved accessibility needs.
function warningPhrase(f: RouteFlag, needs: AccessibilityNeed[]): string | null {
  switch (f.kind) {
    case "noise":
      if (needs.includes("noise") || needs.includes("blind") || needs.includes("deaf")) {
        return `Loud zone ahead — ${f.label}.`;
      }
      return `Loud zone — ${f.label}.`;
    case "crowd":
      if (needs.includes("wheelchair")) {
        return `Crowded patch ahead — narrow space, ${f.label}.`;
      }
      if (needs.includes("noise") || needs.includes("blind")) {
        return `Crowded ahead — extra noise expected, ${f.label}.`;
      }
      return `Crowded ahead — ${f.label}.`;
    case "light":
      if (needs.includes("light") || needs.includes("blind")) {
        return `Bright lighting ahead at ${f.label}.`;
      }
      return null;
    case "alert":
      return `Live alert nearby — ${f.label}.`;
    default:
      return null;
  }
}

function maneuverIcon(maneuver?: string): string {
  if (!maneuver) return "arrow_upward";
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
  return "arrow_upward";
}

function vehicleIcon(vehicle?: string): string {
  if (!vehicle) return "directions_transit";
  const v = vehicle.toUpperCase();
  if (v.includes("BUS")) return "directions_bus";
  if (v.includes("RAIL") || v.includes("HEAVY_RAIL")) return "directions_railway";
  if (v.includes("SUBWAY") || v.includes("METRO")) return "directions_subway";
  if (v.includes("TRAM") || v.includes("LIGHT_RAIL")) return "tram";
  if (v.includes("FERRY")) return "directions_boat";
  if (v.includes("CABLE")) return "tram";
  return "directions_transit";
}
