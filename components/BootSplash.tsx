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
      {/* Premium 3D layered glow — multiple orbs at different depths drift
          and rotate, building a volumetric forest-green sphere of light. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Outermost diffuse halo — sets the ambient glow */}
        <div
          className="absolute aura-rotate"
          style={{
            top: "50%",
            left: "50%",
            width: glowIntense ? "1600px" : "1100px",
            height: glowIntense ? "1600px" : "1100px",
            background:
              "radial-gradient(circle, rgba(20, 83, 45, 0.55) 0%, rgba(20, 83, 45, 0.18) 35%, transparent 70%)",
            transform: "translate(-50%, -50%)",
            filter: "blur(80px)",
            transition: "width 1.4s ease, height 1.4s ease",
          }}
        />
        {/* Mid-depth orb — gives 3D body */}
        <div
          className="absolute aura-orb"
          style={{
            top: "50%",
            left: "50%",
            width: glowIntense ? "900px" : "640px",
            height: glowIntense ? "900px" : "640px",
            background:
              "radial-gradient(circle at 35% 35%, #22c55e 0%, #14532d 45%, transparent 75%)",
            opacity: glowIntense ? 0.78 : 0.55,
            transform: "translate(-50%, -50%)",
            filter: "blur(45px)",
            transition: "opacity 1.2s ease, width 1.2s ease, height 1.2s ease",
          }}
        />
        {/* Specular highlight — top-left, brightens to fake a light source */}
        <div
          className="absolute aura-highlight"
          style={{
            top: "32%",
            left: "32%",
            width: "420px",
            height: "420px",
            background:
              "radial-gradient(circle, rgba(220, 252, 231, 0.85) 0%, transparent 65%)",
            opacity: glowIntense ? 0.6 : 0.3,
            filter: "blur(40px)",
            transition: "opacity 1.2s ease",
          }}
        />
        {/* Deep-shadow orb — bottom-right, anchors the volumetric feel */}
        <div
          className="absolute aura-shadow"
          style={{
            top: "68%",
            left: "60%",
            width: "560px",
            height: "560px",
            background:
              "radial-gradient(circle, #052e16 0%, transparent 65%)",
            opacity: glowIntense ? 0.55 : 0.35,
            filter: "blur(50px)",
            mixBlendMode: "multiply",
            transition: "opacity 1.2s ease",
          }}
        />
        {/* Secondary drifting orb — adds parallax depth */}
        <div
          className="absolute aura-orb-secondary"
          style={{
            top: "25%",
            left: "70%",
            width: "380px",
            height: "380px",
            background:
              "radial-gradient(circle, #166534 0%, transparent 70%)",
            opacity: glowIntense ? 0.55 : 0.25,
            filter: "blur(60px)",
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
        @keyframes drift-center {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          25% {
            transform: translate(-46%, -54%) scale(1.04);
          }
          50% {
            transform: translate(-52%, -48%) scale(0.98);
          }
          75% {
            transform: translate(-50%, -52%) scale(1.05);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes rotate-slow {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes drift-highlight {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -30px) scale(1.1);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes drift-shadow {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-58%, -42%) scale(1.08);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes drift-far {
          0% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(-90px, 50px);
          }
          66% {
            transform: translate(60px, -40px);
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
        .aura-rotate {
          animation: rotate-slow 24s linear infinite;
        }
        .aura-orb {
          animation: drift-center 7s ease-in-out infinite;
        }
        .aura-highlight {
          animation: drift-highlight 5s ease-in-out infinite;
        }
        .aura-shadow {
          animation: drift-shadow 8s ease-in-out infinite;
        }
        .aura-orb-secondary {
          animation: drift-far 11s ease-in-out infinite;
        }
        .caret {
          animation: blink 1s steps(2) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aura-rotate,
          .aura-orb,
          .aura-highlight,
          .aura-shadow,
          .aura-orb-secondary,
          .caret {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
