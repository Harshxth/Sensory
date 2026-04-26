"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

type Card = {
  vol: string;
  title: string;
  body: string;
  icon: string;
  bg: string;
  ink: string;
  accent: string;
};

const CARDS: Card[] = [
  {
    vol: "Vol. 01",
    title: "Sense",
    body: "Live noise, light, crowd, smell and exit data layered over the map you already know.",
    icon: "graphic_eq",
    bg: "linear-gradient(140deg,#f5f7f9 0%,#e7eaef 100%)",
    ink: "#0f172a",
    accent: "#1d72f5",
  },
  {
    vol: "Vol. 02",
    title: "Plan",
    body: "Profile-aware routing picks the calmest, step-free, well-lit path your body can handle.",
    icon: "route",
    bg: "linear-gradient(140deg,#e6efe2 0%,#cfdcc6 100%)",
    ink: "#0f1c11",
    accent: "#225f1c",
  },
  {
    vol: "Vol. 03",
    title: "Walk",
    body: "Turn-by-turn with haptic warnings before high-sensory zones and voice in your language.",
    icon: "directions_walk",
    bg: "linear-gradient(140deg,#fff4e0 0%,#f4d8a2 100%)",
    ink: "#231505",
    accent: "#aa371c",
  },
  {
    vol: "Vol. 04",
    title: "Share",
    body: "Caregiver mode lets a trusted person follow your live journey and check in with one tap.",
    icon: "ios_share",
    bg: "linear-gradient(140deg,#0f172a 0%,#1e293b 100%)",
    ink: "#f8fafc",
    accent: "#22d3ee",
  },
];

const SWAP_MS = 4000;
const CARD_DIST_X = 70;
const CARD_DIST_Y = 12;
const SKEW = 3;

const slot = (i: number) => ({
  x: i * CARD_DIST_X,
  y: -i * CARD_DIST_Y,
  z: -i * CARD_DIST_X * 1.5,
  zIndex: CARDS.length - i,
});

export function WorkflowCardSwap() {
  const [order, setOrder] = useState<number[]>(() => CARDS.map((_, i) => i));
  const [swapping, setSwapping] = useState(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

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
    <section className="w-full px-6 pb-20 md:pb-32 max-w-7xl mx-auto">
      <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.4em] text-on-surface-variant/70 font-semibold">
          Product life cycle
        </span>
        <h2
          className="mt-4 text-4xl md:text-6xl font-light tracking-tight leading-[1.05] text-on-surface"
          style={{ fontFamily: '"Playfair Display","Public Sans",serif' }}
        >
          One sequence,{" "}
          <span className="italic text-on-surface/45">every body.</span>
        </h2>
        <p className="mt-6 text-base md:text-lg text-on-surface-variant leading-relaxed">
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
            width: "min(560px, 92vw)",
            height: "360px",
          }}
        >
          {CARDS.map((card, idx) => {
            const pos = order.indexOf(idx);
            const s = slot(pos);
            return (
              <motion.div
                key={idx}
                initial={false}
                animate={{
                  x: s.x,
                  y: s.y,
                  z: s.z,
                  opacity: 1,
                  skewY: SKEW,
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
                  background: card.bg,
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  boxShadow:
                    "0 30px 60px -20px rgba(15,23,42,0.25), 0 12px 30px -10px rgba(15,23,42,0.15)",
                  overflow: "hidden",
                }}
              >
                <CardBody card={card} />
              </motion.div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={swap}
          className="mt-16 group flex flex-col items-center gap-3"
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
  const onDark = card.ink !== "#0f172a" && card.ink !== "#0f1c11" && card.ink !== "#231505";
  return (
    <div className="relative w-full h-full p-8 md:p-10 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.25em] opacity-60"
          style={{ color: card.ink }}
        >
          {card.vol}
        </span>
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: onDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
            color: card.accent,
          }}
        >
          <Icon name={card.icon} filled size={22} />
        </span>
      </div>

      <div>
        <h3
          className="text-4xl md:text-5xl font-light tracking-tight leading-none"
          style={{
            fontFamily: '"Playfair Display","Public Sans",serif',
            color: card.ink,
          }}
        >
          {card.title}
        </h3>
        <p
          className="mt-3 text-sm md:text-base leading-relaxed max-w-[34ch] opacity-65"
          style={{ color: card.ink }}
        >
          {card.body}
        </p>
      </div>
    </div>
  );
}
