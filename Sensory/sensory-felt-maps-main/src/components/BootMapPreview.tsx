import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------
 * BootMapPreview — swipeable horizontal carousel of location cards.
 * Each card shows a mini map + a primary venue caption with sensory
 * signals. The current card is centered; neighbors peek on either side.
 * Pure SVG, lightweight, WCAG-AA contrast.
 * ------------------------------------------------------------- */

export type Signal = "calm" | "moderate" | "intense";

export type SuggestedPlace = {
  name: string;
  meta: string;
  signals: { noise: Signal; light: Signal; crowd: Signal };
  status: Signal;
  /** Pin position on the mini-map (percent). */
  pin?: { x: number; y: number };
};

const DEFAULT_PLACES: SuggestedPlace[] = [
  {
    name: "Linden Street Cafe",
    meta: "Quiet · Step-free · 4 min",
    signals: { noise: "calm", light: "calm", crowd: "calm" },
    status: "calm",
    pin: { x: 58, y: 46 },
  },
  {
    name: "Riverside Library",
    meta: "Hushed · Soft light · 8 min",
    signals: { noise: "calm", light: "calm", crowd: "moderate" },
    status: "calm",
    pin: { x: 32, y: 38 },
  },
  {
    name: "Grand Market Hall",
    meta: "Lively · Bright · 12 min",
    signals: { noise: "intense", light: "moderate", crowd: "intense" },
    status: "intense",
    pin: { x: 70, y: 60 },
  },
  {
    name: "Harbor Greenhouse",
    meta: "Calm · Warm light · 16 min",
    signals: { noise: "calm", light: "moderate", crowd: "calm" },
    status: "calm",
    pin: { x: 44, y: 64 },
  },
];

const STATUS_LABEL: Record<Signal, string> = {
  calm: "CALM",
  moderate: "MIXED",
  intense: "BUSY",
};

const SIGNAL_HSL: Record<Signal, string> = {
  calm: "var(--signal-calm)",
  moderate: "var(--signal-moderate)",
  intense: "var(--signal-intense)",
};

const STATUS_FG: Record<Signal, string> = {
  calm: "150 60% 18%",
  moderate: "28 70% 22%",
  intense: "8 65% 22%",
};

interface Props {
  className?: string;
  places?: SuggestedPlace[];
  /** Optional callback whenever the active card changes. */
  onActiveChange?: (index: number, place: SuggestedPlace) => void;
}

/* ---------------- Carousel ---------------- */

export const BootMapPreview = ({
  className,
  places = DEFAULT_PLACES,
  onActiveChange,
}: Props) => {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startT = useRef(0);

  const total = places.length;

  const goTo = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(total - 1, i));
      setActive(next);
      onActiveChange?.(next, places[next]);
    },
    [places, total, onActiveChange],
  );

  /* drag handlers (touch + mouse) */
  const beginDrag = (clientX: number) => {
    startX.current = clientX;
    startT.current = performance.now();
    setDragging(true);
  };
  const moveDrag = (clientX: number) => {
    if (!dragging) return;
    setDrag(clientX - startX.current);
  };
  const endDrag = (clientX: number) => {
    if (!dragging) return;
    const dx = clientX - startX.current;
    const dt = Math.max(1, performance.now() - startT.current);
    const v = dx / dt; // px/ms
    const w = trackRef.current?.offsetWidth ?? 320;
    const threshold = w * 0.18;
    setDragging(false);
    setDrag(0);
    if (dx < -threshold || v < -0.4) goTo(active + 1);
    else if (dx > threshold || v > 0.4) goTo(active - 1);
  };

  /* mouse listeners while dragging */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, active]);

  /* keyboard arrows */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(active + 1);
      if (e.key === "ArrowLeft") goTo(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  // Each card occupies 86% of the viewport, with 7% peek on each side.
  const cardPct = 86;
  const gapPct = 4;
  const slotPct = cardPct + gapPct;
  const trackW = trackRef.current?.offsetWidth ?? 320;
  const dragPct = (drag / Math.max(1, trackW)) * 100;
  const offsetPct = -active * slotPct + (100 - cardPct) / 2 + dragPct;

  return (
    <section
      className={cn("relative w-full select-none", className)}
      aria-roledescription="carousel"
      aria-label="Suggested calm places near you"
    >
      <div
        ref={trackRef}
        className={cn(
          "relative w-full overflow-hidden",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onTouchStart={(e) => beginDrag(e.touches[0].clientX)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
        onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          beginDrag(e.clientX);
        }}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${offsetPct}%)`,
            transition: dragging
              ? "none"
              : "transform 600ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {places.map((p, i) => {
            const isActive = i === active;
            return (
              <div
                key={p.name}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}: ${p.name}`}
                aria-hidden={!isActive}
                className="shrink-0 px-1"
                style={{ width: `${cardPct}%`, marginRight: `${gapPct}%` }}
              >
                <div
                  className="transition-all duration-500"
                  style={{
                    transform: isActive ? "scale(1)" : "scale(0.94)",
                    opacity: isActive ? 1 : 0.55,
                    filter: isActive ? "none" : "saturate(0.85)",
                  }}
                >
                  <Card place={p} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots */}
      <div
        className="mt-3 flex items-center justify-center gap-1.5"
        role="tablist"
        aria-label="Select location card"
      >
        {places.map((p, i) => (
          <button
            key={p.name}
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ${p.name}`}
            onClick={() => goTo(i)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === active ? 22 : 8,
              background:
                i === active
                  ? "hsl(var(--primary))"
                  : "hsl(var(--primary) / 0.25)",
            }}
          />
        ))}
      </div>
    </section>
  );
};

/* ---------------- Card ---------------- */

const Card = ({ place }: { place: SuggestedPlace }) => {
  const pin = place.pin ?? { x: 58, y: 46 };
  return (
    <article
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        boxShadow:
          "0 1px 0 hsl(var(--surface-raised) / 0.9) inset," +
          "0 14px 32px -16px hsl(var(--primary-deep) / 0.32)," +
          "0 2px 6px -2px hsl(var(--primary-deep) / 0.10)",
        border: "1px solid hsl(var(--border))",
        background:
          "linear-gradient(160deg, hsl(var(--surface)) 0%, hsl(var(--surface-sunken)) 100%)",
      }}
    >
      {/* Map body */}
      <div className="relative aspect-[16/10] w-full">
        {/* tile grid + vignette */}
        <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
          <defs>
            <pattern id={`grid-${place.name}`} width="28" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="hsl(var(--primary) / 0.09)"
                strokeWidth="1"
              />
            </pattern>
            <radialGradient id={`vig-${place.name}`} cx="50%" cy="55%" r="65%">
              <stop offset="65%" stopColor="hsl(var(--surface-sunken) / 0)" />
              <stop offset="100%" stopColor="hsl(var(--primary-deep) / 0.10)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${place.name})`} />
          <rect width="100%" height="100%" fill={`url(#vig-${place.name})`} />
        </svg>

        {/* park, river, route */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 320 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M -10 30 C 40 50, 80 20, 130 40 L 130 90 C 80 80, 40 100, -10 90 Z"
            fill="hsl(var(--primary) / 0.10)"
          />
          <path
            d="M -10 140 C 60 110, 120 170, 200 120 S 320 80, 340 60"
            fill="none"
            stroke="hsl(200 55% 70% / 0.55)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M -10 140 C 60 110, 120 170, 200 120 S 320 80, 340 60"
            fill="none"
            stroke="hsl(200 60% 88% / 0.6)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 20 30 C 80 60, 140 40, 220 80 S 300 150, 330 170"
            fill="none"
            stroke="hsl(var(--primary) / 0.55)"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />
        </svg>

        {/* primary pin (animated) + supporting dots */}
        <Pin x={pin.x} y={pin.y} status={place.status} primary />
        <Pin x={(pin.x + 30) % 90} y={(pin.y + 22) % 80} status="moderate" />
        <Pin x={(pin.x + 60) % 90} y={(pin.y + 44) % 75} status="intense" />

        {/* "You are here" chip */}
        <div
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{
            background: "hsl(var(--surface-raised) / 0.92)",
            border: "1px solid hsl(var(--border))",
            backdropFilter: "blur(6px)",
          }}
        >
          <Navigation
            className="h-3 w-3"
            style={{ color: "hsl(var(--primary))" }}
            strokeWidth={2.4}
          />
          <span
            className="text-[10px] font-semibold tracking-wide"
            style={{
              color: "hsl(var(--primary-deep))",
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            YOU ARE HERE
          </span>
        </div>
      </div>

      {/* Caption */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{
          background: "hsl(var(--surface-raised))",
          borderTop: "1px solid hsl(var(--border))",
        }}
      >
        <div className="min-w-0">
          <p
            className="truncate text-[14px] font-semibold leading-tight"
            style={{
              color: "hsl(var(--primary-deep))",
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "-0.01em",
            }}
          >
            {place.name}
          </p>
          <p
            className="text-[11px] leading-tight mt-0.5 truncate"
            style={{
              color: "hsl(var(--muted-foreground))",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {place.meta}
          </p>
        </div>
        <SignalRow signals={place.signals} />
        <StatusPill status={place.status} />
      </div>
    </article>
  );
};

/* ---------------- Pieces ---------------- */

const Pin = ({
  x,
  y,
  status,
  primary,
}: {
  x: number;
  y: number;
  status: Signal;
  primary?: boolean;
}) => (
  <div
    className="absolute -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    {primary && (
      <div
        className="absolute inset-0 -m-7 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary-glow) / 0.45), transparent 70%)",
          animation: "aura-breathe 3.2s ease-in-out infinite",
        }}
      />
    )}
    <div
      className={cn(
        "relative grid place-items-center rounded-full",
        primary ? "h-10 w-10" : "h-7 w-7",
      )}
      style={{
        background: "hsl(var(--surface-raised))",
        boxShadow: primary
          ? "0 0 0 1px hsl(var(--primary) / 0.25)," +
            "0 6px 14px -6px hsl(var(--primary-deep) / 0.4)"
          : "0 0 0 1px hsl(var(--border))," +
            "0 3px 8px -4px hsl(var(--primary-deep) / 0.25)",
      }}
    >
      {primary ? (
        <MapPin
          className="h-4 w-4"
          style={{ color: "hsl(var(--primary))" }}
          strokeWidth={2.4}
        />
      ) : (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: `hsl(${SIGNAL_HSL[status]})` }}
        />
      )}
    </div>
  </div>
);

const SignalRow = ({
  signals,
}: {
  signals: SuggestedPlace["signals"];
}) => {
  const items: Array<[string, Signal]> = [
    ["N", signals.noise],
    ["L", signals.light],
    ["C", signals.crowd],
  ];
  return (
    <div
      className="shrink-0 flex items-center gap-1.5 rounded-full px-2 py-1"
      aria-label={`Noise ${signals.noise}, light ${signals.light}, crowd ${signals.crowd}`}
      style={{
        background: "hsl(var(--surface-sunken))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      {items.map(([label, s]) => (
        <span key={label} className="inline-flex items-center gap-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: `hsl(${SIGNAL_HSL[s]})` }}
            aria-hidden
          />
          <span
            className="text-[9px] font-semibold tracking-wider"
            style={{ color: "hsl(var(--muted-foreground))" }}
            aria-hidden
          >
            {label}
          </span>
        </span>
      ))}
    </div>
  );
};

const StatusPill = ({ status }: { status: Signal }) => (
  <span
    className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide"
    style={{
      background: `hsl(${SIGNAL_HSL[status]} / 0.18)`,
      color: `hsl(${STATUS_FG[status]})`,
      letterSpacing: "0.04em",
    }}
  >
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ background: `hsl(${SIGNAL_HSL[status]})` }}
      aria-hidden
    />
    {STATUS_LABEL[status]}
  </span>
);

export default BootMapPreview;
