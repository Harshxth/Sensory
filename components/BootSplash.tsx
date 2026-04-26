"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadPreferences } from "@/lib/preferences";

type Phase = "in" | "ready" | "exit" | "gone";

const STORAGE_KEY = "sensory:boot-seen";
const TAGLINE = "Maps for everyone.";

/**
 * Cinematic boot splash — ported from the Claude Design prototype.
 * White background. Animated map drift behind a black "Sensory" wordmark
 * and a Playfair Display italic tagline that types out. After ~2.7s a
 * "Tap anywhere to continue" hint appears; click/tap/Enter dismisses with
 * a blur-out + scale-up and routes to onboarding (first-timers) or stays
 * on the landing for returning users.
 */
export function BootSplash({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("in");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [mapIn, setMapIn] = useState(false);
  const [wordmarkIn, setWordmarkIn] = useState(false);
  const [taglineIn, setTaglineIn] = useState(false);
  const [hintIn, setHintIn] = useState(false);
  const [typed, setTyped] = useState("");
  const dismissedRef = useRef(false);

  // First-mount: check session flag, load profile, kick off animation
  useEffect(() => {
    if (typeof window === "undefined") return;
    setNeedsOnboarding(!loadPreferences().onboardingComplete);
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setPhase("gone");
      onDone?.();
      return;
    }
    const t1 = window.setTimeout(() => setMapIn(true), 60);
    const t2 = window.setTimeout(() => setWordmarkIn(true), 200);
    const t3 = window.setTimeout(() => setTaglineIn(true), 1100);
    const t4 = window.setTimeout(() => {
      setHintIn(true);
      setPhase("ready");
    }, 2700);
    return () => [t1, t2, t3, t4].forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typewriter for the tagline
  useEffect(() => {
    if (!taglineIn) return;
    let i = 0;
    const stepMs = 1100 / TAGLINE.length;
    const id = window.setInterval(() => {
      i++;
      setTyped(TAGLINE.slice(0, i));
      if (i >= TAGLINE.length) window.clearInterval(id);
    }, stepMs);
    return () => window.clearInterval(id);
  }, [taglineIn]);

  // Click/keyboard dismiss
  useEffect(() => {
    if (phase !== "ready") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const dismiss = () => {
    if (dismissedRef.current || phase !== "ready") return;
    dismissedRef.current = true;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setPhase("exit");
    setTimeout(() => {
      setPhase("gone");
      onDone?.();
      if (needsOnboarding) {
        setTimeout(() => router.push("/onboarding"), 50);
      }
    }, 1060);
  };

  if (phase === "gone") return null;

  const exiting = phase === "exit";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boot-title"
      onClick={dismiss}
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      style={{
        background: "#ffffff",
        color: "#0a0f0c",
        cursor: phase === "ready" ? "pointer" : "default",
      }}
    >
      <div
        className="absolute inset-0 grid place-items-center"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "scale(1.05)" : "scale(1)",
          filter: exiting ? "blur(5px)" : "blur(0)",
          transition:
            "opacity 1000ms cubic-bezier(0.7,0,0.84,0), transform 1000ms cubic-bezier(0.7,0,0.84,0), filter 1000ms cubic-bezier(0.7,0,0.84,0)",
        }}
      >
        {/* Animated map drift background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 1600 1600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "140vmax",
              height: "140vmax",
              transform: "translate(-50%, -50%)",
              opacity: mapIn ? 0.4 : 0,
              transition: "opacity 1500ms ease-out",
            }}
          >
            <defs>
              <pattern id="boot-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#c9d6c2" strokeWidth="0.5" opacity="0.35" />
              </pattern>
            </defs>
            <g className="map-drift">
              <rect width="1600" height="1600" fill="#fafffa" />
              <rect width="1600" height="1600" fill="url(#boot-grid)" />
              {/* Parks */}
              <path d="M 240 220 Q 360 180 460 250 Q 560 330 540 460 Q 510 580 380 600 Q 240 580 200 460 Q 180 320 240 220 Z" fill="#d8ebcd" opacity="0.7" />
              <path d="M 1100 980 Q 1240 940 1360 1020 Q 1440 1120 1380 1240 Q 1280 1360 1140 1320 Q 1020 1260 1040 1140 Q 1060 1040 1100 980 Z" fill="#d8ebcd" opacity="0.7" />
              <path d="M 0 1100 Q 200 1080 380 1140 Q 540 1200 700 1180 Q 860 1160 1000 1220 Q 1180 1280 1300 1260 L 1300 1600 L 0 1600 Z" fill="#d6e7ee" opacity="0.7" />
              {/* Roads (light grey backing) */}
              <g stroke="#c9d6c2" fill="none" strokeLinecap="round">
                <path d="M 80 800 Q 80 200 800 200 Q 1520 200 1520 800 Q 1520 1400 800 1400 Q 80 1400 80 800 Z" strokeWidth="22" opacity="0.5" />
                <path d="M 0 720 L 1600 720" strokeWidth="18" />
                <path d="M 0 960 L 1600 960" strokeWidth="14" />
                <path d="M 640 0 L 640 1600" strokeWidth="18" />
                <path d="M 920 0 L 920 1600" strokeWidth="14" />
                <path d="M 0 480 L 1600 480" strokeWidth="14" />
                <path d="M 360 0 L 360 1600" strokeWidth="12" />
                <path d="M 1200 0 L 1200 1600" strokeWidth="12" />
                <path d="M 80 80 L 1520 1520" strokeWidth="10" opacity="0.5" />
                <path d="M 1520 80 L 80 1520" strokeWidth="8" opacity="0.4" />
              </g>
              {/* Roads (white inner) */}
              <g stroke="#fff" fill="none" strokeLinecap="round">
                <path d="M 80 800 Q 80 200 800 200 Q 1520 200 1520 800 Q 1520 1400 800 1400 Q 80 1400 80 800 Z" strokeWidth="14" />
                <path d="M 0 720 L 1600 720" strokeWidth="11" />
                <path d="M 0 960 L 1600 960" strokeWidth="8" />
                <path d="M 640 0 L 640 1600" strokeWidth="11" />
                <path d="M 920 0 L 920 1600" strokeWidth="8" />
                <path d="M 0 480 L 1600 480" strokeWidth="7" />
                <path d="M 360 0 L 360 1600" strokeWidth="6" />
                <path d="M 1200 0 L 1200 1600" strokeWidth="6" />
              </g>
              {/* Routes drawing in */}
              <g opacity="0.55">
                <path d="M 240 1280 Q 360 1180 480 1180 Q 600 1180 640 1060 Q 680 940 800 920 Q 920 900 1000 800 Q 1080 720 1200 640" stroke="#2f6c27" strokeWidth="22" opacity="0.18" fill="none" strokeLinecap="round" />
                <path className="route r1" d="M 240 1280 Q 360 1180 480 1180 Q 600 1180 640 1060 Q 680 940 800 920 Q 920 900 1000 800 Q 1080 720 1200 640" stroke="#2f6c27" strokeWidth="10" pathLength="1" />
                <path d="M 360 280 Q 460 360 540 480 Q 620 600 760 720 Q 900 840 1060 960 Q 1220 1060 1340 1180" stroke="#22c55e" strokeWidth="18" opacity="0.14" fill="none" strokeLinecap="round" />
                <path className="route r2" d="M 360 280 Q 460 360 540 480 Q 620 600 760 720 Q 900 840 1060 960 Q 1220 1060 1340 1180" stroke="#22c55e" strokeWidth="8" pathLength="1" />
                <path className="route r3" d="M 1340 280 Q 1180 360 1060 480 Q 940 600 880 760 Q 820 920 720 1060 Q 600 1180 480 1280" stroke="#9c4524" strokeWidth="6" strokeDasharray="0.012 0.008" pathLength="1" />
                <path className="route r4" d="M 800 920 Q 880 940 940 920 Q 1000 900 1040 840" stroke="#225f1c" strokeWidth="6" pathLength="1" />
              </g>
              {/* Pulsing pins */}
              <g opacity="0.7">
                <circle className="pin-pulse" cx="240" cy="1280" r="10" fill="#22c55e" />
                <circle cx="240" cy="1280" r="9" fill="#fff" stroke="#2f6c27" strokeWidth="3" />
                <circle cx="240" cy="1280" r="3.5" fill="#2f6c27" />
                <circle className="pin-pulse delay-1" cx="1200" cy="640" r="12" fill="#2f6c27" />
                <circle cx="1200" cy="640" r="11" fill="#2f6c27" />
                <circle cx="1200" cy="640" r="4" fill="#fff" />
                <circle className="pin-pulse delay-2" cx="800" cy="920" r="9" fill="#9c4524" />
                <circle cx="800" cy="920" r="7" fill="#fff" stroke="#9c4524" strokeWidth="2.5" />
                <circle className="pin-pulse delay-3" cx="1340" cy="1180" r="9" fill="#22c55e" />
                <circle cx="1340" cy="1180" r="7" fill="#fff" stroke="#22c55e" strokeWidth="2.5" />
                <circle className="pin-pulse delay-1" cx="540" cy="480" r="8" fill="#22c55e" />
                <circle cx="540" cy="480" r="6" fill="#fff" stroke="#22c55e" strokeWidth="2" />
              </g>
            </g>
          </svg>
          {/* White vignette fade — keeps content readable */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.92) 78%, #fff 100%)",
            }}
          />
        </div>

        {/* Wordmark + tagline + tap hint */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <h1
            id="boot-title"
            style={{
              fontFamily: '"Public Sans", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: "clamp(72px, 14vw, 200px)",
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
              color: "#0a0f0c",
              opacity: wordmarkIn ? 1 : 0,
              transform: wordmarkIn ? "translateY(0) scale(1)" : "translateY(12px) scale(0.985)",
              transition: "opacity 1100ms cubic-bezier(0.16,1,0.3,1), transform 1100ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Sensory
          </h1>

          <div
            aria-live="polite"
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: "2px",
              fontFamily: '"Playfair Display", "Public Sans", serif',
              fontStyle: "italic",
              fontSize: "clamp(22px, 2.8vw, 34px)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "#113a1e",
              minHeight: "1.4em",
              opacity: taglineIn ? 1 : 0,
              transition: "opacity 400ms ease",
            }}
          >
            <span style={{ whiteSpace: "nowrap" }}>{typed}</span>
            <span
              className="caret"
              aria-hidden
              style={{
                display: "inline-block",
                width: "2px",
                height: "1.05em",
                background: "#2f6c27",
                marginLeft: "2px",
                transform: "translateY(2px)",
              }}
            />
          </div>

          <span
            className="tap-hint"
            style={{
              marginTop: "22px",
              fontFamily: '"Public Sans", system-ui, sans-serif',
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#3f6847",
              opacity: hintIn ? 0.6 : 0,
              transition: "opacity 500ms ease",
            }}
          >
            Tap anywhere to continue
          </span>
        </div>
      </div>

      <style jsx>{`
        :global(.map-drift) {
          transform-origin: 50% 50%;
          animation: map-drift 60s ease-in-out infinite alternate;
        }
        @keyframes map-drift {
          0% {
            transform: translate(0, 0) rotate(-1deg);
          }
          100% {
            transform: translate(-3%, 2%) rotate(1.5deg);
          }
        }
        :global(.route) {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: route-draw 4500ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        :global(.route.r1) {
          animation-delay: 200ms;
        }
        :global(.route.r2) {
          animation-delay: 900ms;
        }
        :global(.route.r3) {
          animation-delay: 1500ms;
        }
        :global(.route.r4) {
          animation-delay: 2100ms;
        }
        @keyframes route-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        :global(.pin-pulse) {
          transform-origin: center;
          transform-box: fill-box;
          animation: pin-pulse 2.4s ease-out infinite;
        }
        :global(.pin-pulse.delay-1) {
          animation-delay: 0.6s;
        }
        :global(.pin-pulse.delay-2) {
          animation-delay: 1.2s;
        }
        :global(.pin-pulse.delay-3) {
          animation-delay: 1.8s;
        }
        @keyframes pin-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.6);
            opacity: 0;
          }
        }
        .tap-hint {
          animation: tap-pulse 1.8s ease-in-out infinite;
        }
        @keyframes tap-pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.85;
          }
        }
        .caret {
          animation: blink 0.85s steps(1) infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.map-drift),
          :global(.route),
          :global(.pin-pulse),
          .tap-hint,
          .caret {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
