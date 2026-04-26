"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const SLIDES = [
  {
    eyebrow: "Step 1 of 3",
    title: "A map that knows how a place feels.",
    body: "Sensory layers real-time noise, crowd, light, and smell data over the streets you already know — so you can see calm before you arrive.",
  },
  {
    eyebrow: "Step 2 of 3",
    title: "Five senses, three colors.",
    body: "Noise, light, crowd, smell, and exits each have their own visual language — calm green, moderate amber, intense red. Toggle layers any time.",
  },
  {
    eyebrow: "Step 3 of 3",
    title: "Routes that respect your body.",
    body: "Sensory Calm Routing finds the lowest-impact path — step-free, quieter, well-lit — and offers a faster alternative if you'd rather take it.",
  },
];

const AUTO_MS = 4500;

export default function HowItWorksPage() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  const advance = () => {
    if (idx < SLIDES.length - 1) setIdx(idx + 1);
    else router.push("/onboarding");
  };

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(advance, AUTO_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const slide = SLIDES[idx];

  return (
    <main className="min-h-screen flex flex-col bg-background text-on-surface">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-bold text-on-surface tracking-tight">
          <span className="w-7 h-7 rounded-md bg-primary text-on-primary flex items-center justify-center">
            <Icon name="visibility" filled size={16} />
          </span>
          Sensory
        </div>
        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="text-sm font-semibold text-on-surface-variant hover:text-on-surface px-4 h-10 rounded-full hover:bg-on-surface/5 transition-colors"
        >
          Skip
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-6 gap-9">
        <div className="flex items-center gap-1.5" aria-hidden>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === idx
                  ? "w-14 bg-primary"
                  : i < idx
                    ? "w-9 bg-primary"
                    : "w-9 bg-on-surface/15"
              }`}
            />
          ))}
        </div>

        <Illustration idx={idx} />

        <div className="text-center max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {slide.eyebrow}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            {slide.title}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            {slide.body}
          </p>
        </div>
      </section>

      <footer className="flex items-center justify-between max-w-3xl mx-auto w-full px-6 py-7">
        <button
          type="button"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className={`inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface px-3 h-10 rounded-full hover:bg-on-surface/5 transition-colors ${
            idx === 0 ? "invisible" : ""
          }`}
        >
          <Icon name="arrow_back" size={18} />
          Back
        </button>
        <button
          type="button"
          onClick={advance}
          className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dim transition-colors shadow-sm"
        >
          {idx === SLIDES.length - 1 ? "Get started" : "Continue"}
          <Icon name="arrow_forward" size={18} />
        </button>
      </footer>
    </main>
  );
}

function Illustration({ idx }: { idx: number }) {
  const className =
    "w-full max-w-[640px] h-[260px] rounded-3xl bg-white border border-on-surface/8 shadow-md overflow-hidden";

  if (idx === 0) {
    return (
      <div className={className}>
        <svg viewBox="0 0 640 280" className="w-full h-full">
          <defs>
            <pattern id="hgrid1" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e6efe2" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="640" height="280" fill="#fff" />
          <rect width="640" height="280" fill="url(#hgrid1)" />
          <g stroke="#e6efe2" fill="none" strokeLinecap="round">
            <path d="M 0 90 L 640 90" strokeWidth="8" />
            <path d="M 0 200 L 640 200" strokeWidth="6" />
            <path d="M 200 0 L 200 280" strokeWidth="6" />
            <path d="M 440 0 L 440 280" strokeWidth="6" />
          </g>
          <g stroke="#fff" fill="none" strokeLinecap="round">
            <path d="M 0 90 L 640 90" strokeWidth="5" />
            <path d="M 200 0 L 200 280" strokeWidth="3.5" />
          </g>
          <path
            d="M 60 220 Q 160 180 220 150 Q 300 120 360 130 Q 460 150 560 90"
            stroke="#225f1c"
            strokeWidth="18"
            opacity="0.18"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 60 220 Q 160 180 220 150 Q 300 120 360 130 Q 460 150 560 90"
            stroke="#225f1c"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="60" cy="220" r="9" fill="#fff" stroke="#225f1c" strokeWidth="3" />
          <circle cx="60" cy="220" r="3.5" fill="#225f1c" />
          <circle cx="560" cy="90" r="11" fill="#225f1c" />
          <circle cx="560" cy="90" r="4" fill="#fff" />
        </svg>
      </div>
    );
  }

  if (idx === 1) {
    return (
      <div className={className}>
        <svg viewBox="0 0 640 280" className="w-full h-full">
          <rect width="640" height="280" fill="#fff" />
          <g style={{ filter: "blur(18px)" }}>
            <circle cx="160" cy="140" r="80" fill="#22c55e" opacity="0.55" />
            <circle cx="320" cy="140" r="90" fill="#fbbf24" opacity="0.55" />
            <circle cx="470" cy="140" r="80" fill="#f59e0b" opacity="0.55" />
            <circle cx="560" cy="140" r="65" fill="#ef4444" opacity="0.55" />
          </g>
          <g fontFamily="Public Sans, sans-serif" fontWeight="700" fontSize="12" fill="#0f172a">
            <g transform="translate(60 220)">
              <rect width="86" height="32" rx="16" fill="#fff" stroke="#e6efe2" />
              <circle cx="14" cy="16" r="5" fill="#22c55e" />
              <text x="28" y="20">Calm</text>
            </g>
            <g transform="translate(160 220)">
              <rect width="92" height="32" rx="16" fill="#fff" stroke="#e6efe2" />
              <circle cx="14" cy="16" r="5" fill="#f59e0b" />
              <text x="28" y="20">Moderate</text>
            </g>
            <g transform="translate(266 220)">
              <rect width="92" height="32" rx="16" fill="#fff" stroke="#e6efe2" />
              <circle cx="14" cy="16" r="5" fill="#aa371c" />
              <text x="28" y="20">Intense</text>
            </g>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={className}>
      <svg viewBox="0 0 640 280" className="w-full h-full">
        <rect width="640" height="280" fill="#fff" />
        <path
          d="M 60 200 Q 200 100 320 110 Q 440 120 580 60"
          stroke="#aa371c"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="10 8"
          opacity="0.5"
        />
        <path
          d="M 60 200 Q 180 220 280 200 Q 380 180 460 140 Q 520 110 580 60"
          stroke="#225f1c"
          strokeWidth="18"
          opacity="0.18"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 60 200 Q 180 220 280 200 Q 380 180 460 140 Q 520 110 580 60"
          stroke="#225f1c"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="60" cy="200" r="9" fill="#fff" stroke="#225f1c" strokeWidth="3" />
        <circle cx="60" cy="200" r="3.5" fill="#225f1c" />
        <circle cx="580" cy="60" r="11" fill="#225f1c" />
        <circle cx="580" cy="60" r="4" fill="#fff" />
        <g fontFamily="Public Sans, sans-serif" fontWeight="700" fontSize="11">
          <g transform="translate(310 230)">
            <rect width="138" height="28" rx="14" fill="#fff" stroke="#e6efe2" />
            <circle cx="14" cy="14" r="5" fill="#225f1c" />
            <text x="28" y="18" fill="#0f172a">
              Calm route · 14 min
            </text>
          </g>
          <g transform="translate(310 84)">
            <rect width="138" height="28" rx="14" fill="#fff" stroke="#e6efe2" />
            <circle cx="14" cy="14" r="5" fill="#aa371c" />
            <text x="28" y="18" fill="#0f172a">
              Faster · loud zone
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
