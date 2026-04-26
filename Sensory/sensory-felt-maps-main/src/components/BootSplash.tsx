import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { BootMapPreview } from "./BootMapPreview";

/**
 * BootSplash — cinematic app bootup.
 *
 * Timeline:
 *  1. "Sensory" pops in centered, breathing aura behind it.
 *  2. Wordmark fades away.
 *  3. Map carousel of nearby places reveals (un-blurs in).
 *  4. Fixed bottom "Try Sensory" button dismisses with a right-swipe transition.
 *
 * Users can also swipe the entire splash to the right to dismiss.
 */
type Phase = "in" | "hold" | "fadeout" | "reveal" | "swipe" | "gone";

const SWIPE_THRESHOLD = 90;
const SWIPE_VELOCITY = 0.45;

export const BootSplash = ({ onDone }: { onDone?: () => void }) => {
  const [phase, setPhase] = useState<Phase>("in");
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startT = useRef(0);
  const widthRef = useRef(0);

  /* ---------- Animation timeline ---------- */
  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("hold"), 700);
    const t2 = window.setTimeout(() => setPhase("fadeout"), 1500);
    const t3 = window.setTimeout(() => setPhase("reveal"), 2100);
    return () => {
      [t1, t2, t3].forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (phase !== "swipe") return;
    try {
      sessionStorage.setItem("sensory:boot-handoff", String(Date.now()));
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      setPhase("gone");
      onDone?.();
    }, 600);
    return () => window.clearTimeout(t);
  }, [phase, onDone]);

  /* ---------- Swipe / drag ---------- */
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

  if (phase === "gone") return null;

  const wordmarkVisible = phase === "in" || phase === "hold";
  const showMap = phase === "reveal" || phase === "swipe";

  const w = widthRef.current || 1;
  const swipeOffset =
    phase === "swipe" ? w : dragging || drag !== 0 ? drag : 0;
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
      className={[
        "fixed inset-0 z-[100] overflow-hidden select-none touch-pan-y",
        "bg-[hsl(var(--background))]",
      ].join(" ")}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: dragging
          ? "none"
          : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        opacity: 1 - swipeProgress * 0.25,
        willChange: "transform, opacity",
      }}
    >
      {/* Ambient aura */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            opacity: wordmarkVisible ? 0.65 : 0.35,
            background:
              "radial-gradient(closest-side, hsl(var(--primary-glow) / 0.35), hsl(var(--accent-soft) / 0.18) 55%, transparent 75%)",
            animation: "aura-breathe 4s ease-in-out infinite",
            transition: "opacity 800ms ease-out",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{
            opacity: wordmarkVisible ? 0.7 : 0.4,
            background:
              "radial-gradient(closest-side, hsl(var(--primary) / 0.22), transparent 70%)",
            animation: "aura-breathe 5s ease-in-out infinite",
            transition: "opacity 800ms ease-out",
          }}
        />
      </div>

      {/* === STAGE 1 — Wordmark, centered, fades away after the hold === */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        aria-hidden={!wordmarkVisible}
        style={{
          opacity: phase === "fadeout" ? 0 : wordmarkVisible ? 1 : 0,
          transform:
            phase === "fadeout"
              ? "scale(1.04)"
              : wordmarkVisible
                ? "scale(1)"
                : "scale(0.96)",
          transition:
            "opacity 600ms ease-out, transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <h1
          id="boot-title"
          className="leading-none tracking-tight text-[hsl(var(--primary-deep))] text-center shadow-float text-7xl font-sans font-bold"
          style={{
            opacity: phase === "in" ? 0 : 1,
            transform: phase === "in" ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 700ms ease-out, transform 700ms ease-out",
            letterSpacing: "-0.02em",
          }}
        >
          Sensory
        </h1>
        <div
          aria-hidden
          className="mt-5 h-px bg-[hsl(var(--primary)/0.45)] origin-center"
          style={{
            width: phase === "in" ? "0px" : "120px",
            transition:
              "width 700ms cubic-bezier(0.22, 1, 0.36, 1) 200ms",
          }}
        />
        <p
          className="mt-4 text-[hsl(var(--muted-foreground))] text-sm tracking-wide"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            opacity: phase === "in" ? 0 : 0.9,
            transition: "opacity 700ms ease-out 250ms",
          }}
        >
          maps for everyone
        </p>
      </div>

      {/* === STAGE 2 — Map carousel reveals === */}
      <div
        className="absolute inset-x-0 top-0 px-5 pt-10"
        aria-hidden={!showMap}
        style={{
          opacity: showMap ? 1 : 0,
          filter: showMap ? "blur(0px)" : "blur(18px)",
          transform: showMap
            ? "translateY(0)"
            : "translateY(-10px) scale(0.985)",
          transition:
            "opacity 1000ms ease-out, filter 1000ms ease-out, transform 1000ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <header className="mx-auto max-w-md mb-4 flex items-center justify-between">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              Calm places near you
            </p>
            <p
              className="mt-0.5 text-base font-semibold text-[hsl(var(--primary-deep))]"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Find a place that feels right
            </p>
          </div>
        </header>
        <div className="mx-auto max-w-md">
          <BootMapPreview />
        </div>
        <p
          className="mt-3 text-center text-[11px] text-[hsl(var(--muted-foreground))] tracking-wide"
          aria-hidden
        >
          Swipe the cards to explore
        </p>
      </div>

      {/* === STAGE 3 — Bottom CTA === */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 px-5"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
        }}
      >
        <div
          className="mx-auto max-w-md flex flex-col items-center gap-2"
          style={{
            opacity: showMap ? 1 : 0,
            filter: showMap ? "blur(0px)" : "blur(14px)",
            transform: showMap ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 800ms ease-out 200ms, filter 800ms ease-out 200ms, transform 800ms ease-out 200ms",
          }}
        >
          <button
            type="button"
            onClick={() => showMap && setPhase("swipe")}
            disabled={!showMap}
            aria-label="Try Sensory — open the welcome screen"
            className="tap group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-7 py-4 text-base font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_14px_44px_-14px_hsl(var(--primary)/0.7)] hover:bg-[hsl(var(--primary-glow))] active:scale-[0.99] transition-all duration-200"
          >
            Try Sensory
            <ArrowRight
              className="w-5 h-5 transition-transform group-hover:translate-x-0.5"
              style={{
                transform: `translateX(${Math.min(8, swipeProgress * 16)}px)`,
              }}
            />
          </button>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] tracking-wide flex items-center gap-1.5">
            <span aria-hidden>👉</span> Or swipe right to begin
          </p>
        </div>
      </div>
    </div>
  );
};

export default BootSplash;
