"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { loadPreferences } from "@/lib/preferences";
import * as haptic from "@/lib/haptic";

type Stage = "idle" | "live" | "capturing" | "result" | "error";

type Wayfinding = {
  match?: { name: string; lat: number; lng: number; distanceMeters: number } | null;
  verdict: "at_destination" | "approaching" | "off_track" | "no_match";
  spoken: string;
  bearingFromUser?: string;
  distanceMeters?: number;
};

type Props = {
  /** Active navigation destination - when present, sign reads also do
   *  wayfinding ("you're heading right toward it" / "head left instead"). */
  destination?: { lat: number; lng: number; name: string } | null;
};

/**
 * Floating camera button + camera-capture flow.
 *
 * 1. Gemini Vision transcribes the sign and extracts a place name.
 * 2. Geolocation + active destination feed /api/wayfinding/check.
 * 3. The result - sign text + wayfinding sentence - is read aloud through
 *    ElevenLabs (cloned voice if available, Bella otherwise; falls back to
 *    browser TTS only if the API errors).
 */
export function SignReader({ destination }: Props = {}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [text, setText] = useState<string>("");
  const [wayfinding, setWayfinding] = useState<Wayfinding | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const open = async () => {
    setStage("live");
    setText("");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setError((e as Error).message ?? "Camera access denied");
      setStage("error");
    }
  };

  const close = () => {
    stopStream();
    setStage("idle");
    setText("");
    setWayfinding(null);
    setError(null);
    cancelSpeech();
  };

  const capture = async () => {
    if (!videoRef.current) return;
    setStage("capturing");
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    const lang = loadPreferences().language ?? "en";
    try {
      const visionRes = await fetch("/api/vision/read-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: dataUrl, language: lang }),
      });
      if (!visionRes.ok) throw new Error(String(visionRes.status));
      const visionData = (await visionRes.json()) as {
        text: string;
        place_name?: string | null;
      };
      setText(visionData.text);

      // Try wayfinding if we have a place name candidate AND geolocation. We
      // don't fail the whole flow on a wayfinding miss - just speak the text.
      let way: Wayfinding | null = null;
      if (visionData.place_name && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              maximumAge: 5000,
              timeout: 8000,
            });
          });
          const checkRes = await fetch("/api/wayfinding/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              place_name: visionData.place_name,
              user: { lat: pos.coords.latitude, lng: pos.coords.longitude },
              destination,
            }),
          });
          if (checkRes.ok) {
            way = (await checkRes.json()) as Wayfinding;
          }
        } catch {
          // No location permission, GPS timeout, or DB hiccup - skip wayfinding.
        }
      }
      setWayfinding(way);
      setStage("result");

      // Haptic feedback matches the verdict so users with low vision /
      // hearing assist sense the answer through touch alone.
      if (way) {
        if (way.verdict === "at_destination" || way.verdict === "approaching") {
          haptic.success();
        } else if (way.verdict === "off_track") {
          haptic.offTrack();
        } else {
          haptic.tap();
        }
      } else {
        haptic.tap();
      }

      // Speak: wayfinding line first (if any), then the raw sign text. Both
      // go through ElevenLabs so the cloned/comfort voice is what's heard.
      const utterance = way?.spoken
        ? `${way.spoken} The sign reads: ${visionData.text}`
        : visionData.text;
      speak(utterance, lang);
    } catch (e) {
      setError((e as Error).message ?? "Couldn't read the sign");
      setStage("error");
    }
  };

  if (stage === "idle") {
    return (
      <button
        type="button"
        aria-label="Read a sign with the camera"
        onClick={open}
        className="fixed bottom-24 md:bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-secondary text-on-secondary shadow-xl shadow-secondary/30 hover:bg-secondary-dim transition-all active:scale-95 flex items-center justify-center"
      >
        <Icon name="document_scanner" filled size={26} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <Icon name="document_scanner" filled size={22} />
          Read a sign
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close camera"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {(stage === "live" || stage === "capturing") && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {stage === "capturing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white/95 text-on-surface rounded-full px-5 py-3 font-bold text-sm flex items-center gap-2">
              <Icon name="auto_awesome" filled size={18} className="text-primary animate-spin" />
              Reading sign…
            </div>
          </div>
        )}
        {stage === "result" && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              {wayfinding && (
                <div
                  className="rounded-xl p-3 flex items-start gap-3"
                  style={{
                    background: VERDICT_BG[wayfinding.verdict],
                    border: `1px solid ${VERDICT_BORDER[wayfinding.verdict]}`,
                  }}
                >
                  <Icon
                    name={VERDICT_ICON[wayfinding.verdict]}
                    filled
                    size={22}
                    className="mt-0.5"
                    style={{ color: VERDICT_FG[wayfinding.verdict] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: VERDICT_FG[wayfinding.verdict] }}
                    >
                      {VERDICT_LABEL[wayfinding.verdict]}
                    </div>
                    <p className="text-sm font-semibold mt-0.5 leading-snug">
                      {wayfinding.spoken}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Sensory read this
                </div>
                <p className="text-base leading-relaxed">{text || "No text found."}</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const lang = loadPreferences().language ?? "en";
                    const utterance = wayfinding?.spoken
                      ? `${wayfinding.spoken} The sign reads: ${text}`
                      : text;
                    if (utterance) speak(utterance, lang);
                  }}
                  className="flex-1 h-11 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dim flex items-center justify-center gap-2"
                >
                  <Icon name="volume_up" filled size={18} />
                  Read aloud again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStage("live");
                    setText("");
                    setWayfinding(null);
                  }}
                  className="flex-1 h-11 rounded-full border border-on-surface/15 text-on-surface font-bold text-sm hover:bg-on-surface/5"
                >
                  Read another
                </button>
              </div>
            </div>
          </div>
        )}
        {stage === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-3 text-center">
              <Icon name="error" filled size={32} className="text-error mx-auto" />
              <p className="text-sm text-on-surface-variant">{error}</p>
              <button
                type="button"
                onClick={close}
                className="h-11 px-5 rounded-full bg-primary text-on-primary font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {stage === "live" && (
        <div className="p-6 flex justify-center">
          <button
            type="button"
            onClick={capture}
            aria-label="Capture sign"
            className="w-20 h-20 rounded-full bg-white text-primary border-4 border-primary shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            <Icon name="photo_camera" filled size={36} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Speech ────────────────────────────────────────────────────────
// Same priority as NavigationOverlay: cloned voice → Bella → browser TTS.

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // ElevenLabs "Bella"
let _audioEl: HTMLAudioElement | null = null;
let _audioUrl: string | null = null;

function cancelSpeech() {
  if (_audioEl) {
    try {
      _audioEl.pause();
      _audioEl.src = "";
    } catch {
      /* ignore */
    }
    _audioEl = null;
  }
  if (_audioUrl) {
    try {
      URL.revokeObjectURL(_audioUrl);
    } catch {
      /* ignore */
    }
    _audioUrl = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

function fallbackBrowserSpeak(text: string, language: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === "es" ? "es-ES" : language === "zh" ? "zh-CN" : "en-US";
    u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

function speak(text: string, language: string) {
  if (typeof window === "undefined" || !text) return;
  let voiceId = DEFAULT_VOICE_ID;
  try {
    const raw = window.localStorage.getItem("sensory:prefs");
    if (raw) {
      const p = JSON.parse(raw) as { voiceCloneId?: string };
      if (p.voiceCloneId && typeof p.voiceCloneId === "string") voiceId = p.voiceCloneId;
    }
  } catch {
    /* ignore */
  }

  cancelSpeech();

  fetch("/api/voice/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId, lang: language }),
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
    .catch(() => fallbackBrowserSpeak(text, language));
}

// ─── Verdict styling ───────────────────────────────────────────────

const VERDICT_LABEL: Record<Wayfinding["verdict"], string> = {
  at_destination: "Arrived",
  approaching: "On track",
  off_track: "Heads up",
  no_match: "Not matched",
};
const VERDICT_ICON: Record<Wayfinding["verdict"], string> = {
  at_destination: "where_to_vote",
  approaching: "trending_flat",
  off_track: "u_turn_left",
  no_match: "info",
};
const VERDICT_BG: Record<Wayfinding["verdict"], string> = {
  at_destination: "rgba(34,197,94,0.10)",
  approaching: "rgba(34,197,94,0.10)",
  off_track: "rgba(251,146,60,0.12)",
  no_match: "rgba(148,163,184,0.10)",
};
const VERDICT_BORDER: Record<Wayfinding["verdict"], string> = {
  at_destination: "rgba(34,197,94,0.30)",
  approaching: "rgba(34,197,94,0.30)",
  off_track: "rgba(251,146,60,0.30)",
  no_match: "rgba(148,163,184,0.25)",
};
const VERDICT_FG: Record<Wayfinding["verdict"], string> = {
  at_destination: "#16a34a",
  approaching: "#16a34a",
  off_track: "#c2410c",
  no_match: "#475569",
};
