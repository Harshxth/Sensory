"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

type Card = {
  vol: string;
  title: string;
  caption: string;
  /** Background image URL (Unsplash). */
  image: string;
  /** Tint color used in the bottom gradient — keeps each card visually distinct. */
  tint: string;
  /** Sensory accent color used in the corner glyph. */
  accent: string;
};

const CARDS: Card[] = [
  {
    vol: "Vol. 01",
    title: "Sense",
    caption: "Live noise, light, crowd, smell, and exit data — layered over the streets you already know.",
    // Warm books + coffee on a soft window-lit table — a quiet morning read
    image:
      "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(35,21,5,0.78)",
    accent: "#f97316",
  },
  {
    vol: "Vol. 02",
    title: "Plan",
    caption: "Profile-aware routing picks the calmest, step-free, well-lit path your body can handle.",
    // Soft golden-hour countryside road — calm planning vibe
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(35,21,5,0.78)",
    accent: "#225f1c",
  },
  {
    vol: "Vol. 03",
    title: "Walk",
    caption: "Turn-by-turn with haptic warnings before high-sensory zones and voice cues in your language.",
    // Warm cobbled street at golden hour — intimate "walking in your city" feel
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(28,14,4,0.78)",
    accent: "#fb923c",
  },
  {
    vol: "Vol. 04",
    title: "Share",
    caption: "Caregiver mode lets a trusted person follow your live journey and check in with one tap.",
    // Two pairs of hands meeting over a warm wooden table — the sharing motif
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(28,14,4,0.78)",
    accent: "#d97706",
  },
];

const SWAP_MS = 4000;

// Stack offsets — smaller on phones so the tail doesn't crowd the screen.
const SLOT = {
  desktop: { distX: 70, distY: 12, skew: 3 },
  mobile: { distX: 32, distY: 7, skew: 1.5 },
};

const slot = (i: number, total: number, isMobile: boolean) => {
  const s = isMobile ? SLOT.mobile : SLOT.desktop;
  return {
    x: i * s.distX,
    y: -i * s.distY,
    z: -i * s.distX * 1.5,
    zIndex: total - i,
    skew: s.skew,
  };
};

export function WorkflowCardSwap() {
  const [order, setOrder] = useState<number[]>(() => CARDS.map((_, i) => i));
  const [swapping, setSwapping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // Track viewport for stack-geometry tuning (small screens get tighter offsets).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const handle = () => setIsMobile(mql.matches);
    handle();
    mql.addEventListener?.("change", handle);
    return () => mql.removeEventListener?.("change", handle);
  }, []);

  const swap = () => {
    if (swapping) return;
    setSwapping(true);
    setOrder((prev) => {
      const [front, ...rest] = prev;
      return [...rest, front];
    });
    window.setTimeout(() => setSwapping(false), 1400);
  };

  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current) swap();
      timerRef.current = window.setTimeout(tick, SWAP_MS);
    };
    timerRef.current = window.setTimeout(tick, SWAP_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnter = () => {
    pausedRef.current = true;
  };
  const onLeave = () => {
    pausedRef.current = false;
  };

  return (
    <section className="w-full px-5 sm:px-6 pb-4 md:pb-32 max-w-7xl mx-auto">
      <div className="text-center mb-4 sm:mb-12 md:mb-16 max-w-2xl mx-auto px-2">
        <span className="hidden sm:block text-[10px] sm:text-[11px] uppercase tracking-[0.32em] sm:tracking-[0.4em] text-on-surface-variant/70 font-semibold">
          Product life cycle
        </span>
        <h2
          className="sm:mt-4 text-2xl sm:text-4xl md:text-6xl font-light tracking-tight leading-[1.05] text-on-surface"
          style={{ fontFamily: '"Playfair Display","Public Sans",serif' }}
        >
          One sequence,{" "}
          <span className="italic text-on-surface/45">every body.</span>
        </h2>
        <p className="hidden sm:block mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed">
          From the first tap to a shared journey — every stage of how Sensory
          learns a place and walks you through it.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div
          role="region"
          aria-label="Workflow card carousel"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={swap}
          className="relative cursor-pointer group"
          style={{
            perspective: "1500px",
            transformStyle: "preserve-3d",
            width: "min(560px, 88vw)",
            height: "clamp(220px, 56vw, 360px)",
          }}
        >
          {CARDS.map((card, idx) => {
            const pos = order.indexOf(idx);
            const s = slot(pos, CARDS.length, isMobile);
            return (
              <motion.div
                key={idx}
                initial={false}
                animate={{
                  x: s.x,
                  y: s.y,
                  z: s.z,
                  opacity: 1,
                  skewY: s.skew,
                }}
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 13,
                  mass: 0.9,
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100%",
                  height: "100%",
                  translateX: "-50%",
                  translateY: "-50%",
                  transformStyle: "preserve-3d",
                  transformOrigin: "center center",
                  zIndex: s.zIndex,
                  willChange: "transform, opacity",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow:
                    "0 24px 50px -16px rgba(15,23,42,0.25), 0 10px 24px -8px rgba(15,23,42,0.15)",
                  overflow: "hidden",
                  background: "#1f2937",
                }}
              >
                <CardBody card={card} />
              </motion.div>
            );
          })}
        </div>

        {/* Desktop-only manual cycle button — on mobile we save the vertical
            real estate so the parent's Continue button sits right under the
            card stack. Tapping the cards themselves still cycles them. */}
        <button
          type="button"
          onClick={swap}
          className="hidden sm:flex mt-10 sm:mt-12 group flex-col items-center gap-3"
          aria-label="Cycle workflow"
        >
          <span className="w-12 h-12 rounded-full border border-on-surface/20 flex items-center justify-center group-hover:bg-on-surface group-hover:text-background transition-all">
            <Icon name="play_arrow" filled size={20} />
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/70 group-hover:text-on-surface transition-colors">
            Cycle workflow
          </span>
        </button>
      </div>
    </section>
  );
}

function CardBody({ card }: { card: Card }) {
  return (
    <div className="relative w-full h-full">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.image}
        alt=""
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "saturate(1.05) contrast(1.02)",
        }}
      />
      {/* Bottom-up gradient for text legibility */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, ${card.tint} 0%, ${card.tint.replace(/[\d.]+\)$/, "0.55)")} 35%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* Top-right accent dot */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "clamp(14px, 4vw, 24px)",
          right: "clamp(14px, 4vw, 24px)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: card.accent,
          boxShadow: `0 0 14px ${card.accent}`,
        }}
      />

      {/* Bottom-left content stack */}
      <div
        style={{
          position: "absolute",
          left: "clamp(18px, 5vw, 32px)",
          right: "clamp(18px, 5vw, 32px)",
          bottom: "clamp(18px, 5vw, 32px)",
          color: "#ffffff",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          {card.vol}
        </span>
        <h3
          style={{
            fontFamily: '"Playfair Display","Public Sans",serif',
            fontWeight: 400,
            fontSize: "clamp(28px, 7vw, 56px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            marginTop: 10,
            fontSize: "clamp(11px, 2.6vw, 13px)",
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.82)",
            maxWidth: "42ch",
          }}
        >
          {card.caption}
        </p>
      </div>
    </div>
  );
}
