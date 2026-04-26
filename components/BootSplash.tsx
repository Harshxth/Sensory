"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { loadPreferences } from "@/lib/preferences";

type Phase = "in" | "hold" | "fadeout" | "reveal" | "swipe" | "gone";

const SWIPE_THRESHOLD = 90;
const SWIPE_VELOCITY = 0.45;
const STORAGE_KEY = "sensory:boot-seen";

/**
 * Cinematic app boot splash — adapted from the partner's Lovable export.
 * Timeline:
 *  - 0.0s: "Sensory" wordmark pops in, breathing aura behind
 *  - 0.7s: hold
 *  - 1.5s: wordmark fades, tagline emerges
 *  - 2.1s: "Try Sensory" CTA appears
 *  - swipe right OR tap CTA to dismiss
 *
 * Only shows once per session (sessionStorage flag).
 */
export function BootSplash({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("in");
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startT = useRef(0);
  const widthRef = useRef(0);

  // Skip if user has already seen the splash this session, otherwise advance
  // through phases on a single mount (deps must NOT include phase or the
  // cleanup cancels the in-flight timers each time phase changes).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setNeedsOnboarding(!loadPreferences().onboardingComplete);
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setPhase("gone");
      onDone?.();
      return;
    }
    const t1 = window.setTimeout(() => setPhase("hold"), 700);
    const t2 = window.setTimeout(() => setPhase("fadeout"), 1500);
    const t3 = window.setTimeout(() => setPhase("reveal"), 2100);
    return () => {
      [t1, t2, t3].forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "swipe") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      setPhase("gone");
      onDone?.();
    }, 600);
    return () => window.clearTimeout(t);
  }, [phase, onDone]);

  const canDrag = phase === "reveal";
  const beginDrag = useCallback(
    (clientX: number) => {
      if (!canDrag) return;
      widthRef.current = containerRef.current?.offsetWidth ?? window.innerWidth;
      startX.current = clientX;
      startT.current = performance.now();
      setDragging(true);
    },
    [canDrag],
  );
  const moveDrag = useCallback(
    (clientX: number) => {
      if (!dragging) return;
      const raw = clientX - startX.current;
      setDrag(raw > 0 ? raw : raw * 0.15);
    },
    [dragging],
  );
  const endDrag = useCallback(
    (clientX: number) => {
      if (!dragging) return;
      const dx = clientX - startX.current;
      const dt = Math.max(1, performance.now() - startT.current);
      const v = dx / dt;
      const commit = dx > SWIPE_THRESHOLD || (dx > 30 && v > SWIPE_VELOCITY);
      setDragging(false);
      if (commit) setPhase("swipe");
      else setDrag(0);
    },
    [dragging],
  );

  useEffect(() => {
    if (!dragging) return;
    const mm = (e: MouseEvent) => moveDrag(e.clientX);
    const mu = (e: MouseEvent) => endDrag(e.clientX);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
    };
  }, [dragging, moveDrag, endDrag]);

  const dismiss = () => {
    setPhase("swipe");
    if (needsOnboarding) {
      // Route to onboarding after the splash slides away
      setTimeout(() => router.push("/onboarding"), 350);
    }
  };

  if (phase === "gone") return null;

  const wordmarkVisible = phase === "in" || phase === "hold";
  const showCta = phase === "reveal" || phase === "swipe";

  const w = widthRef.current || 1;
  const swipeOffset = phase === "swipe" ? w : dragging || drag !== 0 ? drag : 0;
  const swipeProgress = Math.min(1, Math.max(0, swipeOffset / w));

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="boot-title"
      onTouchStart={(e) => beginDrag(e.touches[0].clientX)}
      onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
      onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        beginDrag(e.clientX);
      }}
      className="fixed inset-0 z-[100] overflow-hidden select-none touch-pan-y bg-background text-on-background"
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: dragging ? "none" : "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        opacity: 1 - swipeProgress * 0.6,
      }}
    >
      {/* Always-available Skip in the top corner */}
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-4 right-4 z-10 px-4 h-9 rounded-full bg-on-surface/10 hover:bg-on-surface/20 text-on-surface text-xs font-bold backdrop-blur-md transition-colors"
      >
        Skip →
      </button>

      {/* Breathing aura behind the wordmark */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[460px] h-[460px] rounded-full opacity-30 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="relative h-full w-full flex flex-col items-center justify-center px-6">
        <h1
          id="boot-title"
          className={`text-7xl md:text-8xl font-bold tracking-tight transition-all duration-700 ${
            wordmarkVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 -translate-y-2"
          }`}
          style={{
            color: "var(--color-primary)",
            textShadow: "0 0 60px var(--color-primary)",
          }}
        >
          Sensory
        </h1>

        <p
          className={`mt-6 text-lg md:text-xl text-on-surface-variant text-center max-w-md transition-all duration-700 ${
            phase === "fadeout" || phase === "reveal" || phase === "swipe"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          The map for how a place <em>feels</em>.
        </p>

        <button
          type="button"
          onClick={dismiss}
          className={`mt-12 inline-flex items-center gap-2 px-8 h-14 rounded-full bg-primary text-on-primary font-bold text-lg shadow-2xl shadow-primary/30 hover:bg-primary-dim active:scale-95 transition-all ${
            showCta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
          }`}
          style={{ transitionDuration: "600ms" }}
        >
          {needsOnboarding ? "Get started" : "Try Sensory"}
          <Icon name="arrow_forward" size={22} />
        </button>
        {needsOnboarding && showCta && (
          <p className="mt-3 text-xs text-on-surface-variant">
            We&apos;ll set up your accessibility profile in a few steps.
          </p>
        )}

        <p
          className={`absolute bottom-10 text-xs text-on-surface-variant transition-opacity duration-500 ${
            showCta ? "opacity-60" : "opacity-0"
          }`}
        >
          Swipe right to enter
        </p>
      </div>
    </div>
  );
}
