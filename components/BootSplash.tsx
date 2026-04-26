"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { loadPreferences } from "@/lib/preferences";

type Phase = "wordmark" | "typing" | "brighten" | "exit" | "gone";

const STORAGE_KEY = "sensory:boot-seen";
const TAGLINE = "Maps for everyone.";

/**
 * Cinematic app boot splash.
 * Timeline (auto-progresses, no user action required):
 *  0.0s  wordmark fades in with breathing aura
 *  1.0s  tagline starts typing letter by letter
 *  2.6s  glow brightens + moves across the screen
 *  3.8s  splash exits with a soft slide
 *
 * Skip button is always visible for impatient users.
 */
export function BootSplash({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("wordmark");
  const [typed, setTyped] = useState("");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const dismissedRef = useRef(false);

  // First-mount setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    setNeedsOnboarding(!loadPreferences().onboardingComplete);
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setPhase("gone");
      onDone?.();
      return;
    }
    const t1 = window.setTimeout(() => setPhase("typing"), 1000);
    const t2 = window.setTimeout(() => setPhase("brighten"), 2600);
    const t3 = window.setTimeout(() => triggerExit(), 3800);
    return () => {
      [t1, t2, t3].forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typewriter
  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTyped(TAGLINE.slice(0, i));
      if (i >= TAGLINE.length) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [phase]);

  const triggerExit = () => {
    if (dismissedRef.current) return;
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
      // First-time visitors get routed straight into the onboarding flow.
      if (needsOnboarding) {
        setTimeout(() => router.push("/onboarding"), 50);
      }
    }, 700);
  };

  if (phase === "gone") return null;

  const wordmarkVisible = phase !== "exit";
  const showTagline = phase === "typing" || phase === "brighten" || phase === "exit";
  const exiting = phase === "exit";
  const glowIntense = phase === "brighten" || phase === "exit";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boot-title"
      className="fixed inset-0 z-[100] overflow-hidden select-none"
      style={{
        background: "#ffffff",
        color: "#113a1e",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.04)" : "scale(1)",
        transition: "opacity 700ms ease-in-out, transform 800ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <button
        type="button"
        onClick={triggerExit}
        className="absolute top-4 right-4 z-20 px-4 h-9 rounded-full text-xs font-bold backdrop-blur-md transition-colors"
        style={{ background: "rgba(17, 58, 30, 0.08)", color: "#113a1e" }}
      >
        Skip →
      </button>

      {/* Moving, brightening aura behind the wordmark */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ filter: "blur(60px)" }}
      >
        <div
          className="absolute aura-orb"
          style={{
            top: "50%",
            left: "50%",
            width: glowIntense ? "780px" : "460px",
            height: glowIntense ? "780px" : "460px",
            background:
              "radial-gradient(circle, #14532d 0%, transparent 70%)",
            opacity: glowIntense ? 0.6 : 0.35,
            transform: "translate(-50%, -50%)",
            transition: "opacity 1.2s ease, width 1.2s ease, height 1.2s ease",
          }}
        />
        <div
          className="absolute aura-orb-secondary"
          style={{
            top: "30%",
            left: "30%",
            width: "320px",
            height: "320px",
            background:
              "radial-gradient(circle, #166534 0%, transparent 70%)",
            opacity: glowIntense ? 0.45 : 0.18,
            transition: "opacity 1.2s ease",
          }}
        />
      </div>

      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        <h1
          id="boot-title"
          className={`text-7xl md:text-8xl font-bold tracking-tight transition-all duration-700 ${
            wordmarkVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{
            color: "#000000",
            textShadow: glowIntense
              ? "0 0 90px #14532d, 0 0 30px #14532d"
              : "0 0 40px #14532d",
            transition: "text-shadow 1s ease-in-out",
          }}
        >
          Sensory
        </h1>

        <p
          className={`mt-8 text-xl md:text-3xl font-semibold tracking-tight transition-opacity duration-500 ${
            showTagline ? "opacity-100" : "opacity-0"
          }`}
          style={{ color: "#113a1e" }}
          aria-live="polite"
        >
          {typed}
          <span
            className="inline-block w-[2px] h-7 align-middle ml-1 caret"
            style={{ background: "#113a1e" }}
            aria-hidden
          />
        </p>

        <p
          className={`mt-4 text-sm md:text-base max-w-md text-center transition-opacity duration-700 ${
            phase === "brighten" || phase === "exit" ? "opacity-100" : "opacity-0"
          }`}
          style={{ color: "#3f6847" }}
        >
          Sensory heatmaps · Haptic feedback · Voice-guided routes
        </p>
      </div>

      <style jsx>{`
        @keyframes drift {
          0% {
            transform: translate(-50%, -50%);
          }
          25% {
            transform: translate(-46%, -54%);
          }
          50% {
            transform: translate(-52%, -50%);
          }
          75% {
            transform: translate(-50%, -46%);
          }
          100% {
            transform: translate(-50%, -50%);
          }
        }
        @keyframes drift-secondary {
          0% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(80px, 60px);
          }
          66% {
            transform: translate(-60px, 40px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
        .aura-orb {
          animation: drift 6s ease-in-out infinite;
        }
        .aura-orb-secondary {
          animation: drift-secondary 9s ease-in-out infinite;
        }
        .caret {
          animation: blink 1s steps(2) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aura-orb,
          .aura-orb-secondary,
          .caret {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
