"use client";

import { useEffect, useState } from "react";
import { MONO, SERIF } from "./Editorial";

const KEY = "sensory:map-tour-seen:v1";

type Step = {
  title: string;
  body: string;
  /** Approximate target zone — anchors a soft outline + arrow on screen. */
  target: "toggles" | "legend" | "infocard" | "recenter" | "time" | "camera";
};

const STEPS: Step[] = [
  {
    title: "Welcome to the field map.",
    body: "Tap any venue or any spot on the map to see how that place feels — noise, light, crowd, smell, exits.",
    target: "infocard",
  },
  {
    title: "Toggle what your body cares about.",
    body: "Each chip on the right turns a sensory layer on or off. Try lowering your eye to the noise chip — it&rsquo;s often what matters most.",
    target: "toggles",
  },
  {
    title: "The legend reads the map.",
    body: "Bottom-left shows the gradient for each active layer. Green is calm, red is intense.",
    target: "legend",
  },
  {
    title: "Find your way home.",
    body: "Bottom-right re-centers on your live location. The blue dot pulses where you are.",
    target: "recenter",
  },
  {
    title: "Time-travel the city.",
    body: "Tap the clock chip to scrub the map forward to any hour over the next 24 — see how the same street will feel after dinner.",
    target: "time",
  },
  {
    title: "Read any sign, in any language.",
    body: "Floating camera button reads any sign aloud in your comfort voice — try it on a parking sign or a menu.",
    target: "camera",
  },
];

export function MapTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(KEY)) return;
    // start the tour after a short delay so the map can settle
    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  if (!open) return null;
  const s = STEPS[step];
  const isFinal = step === STEPS.length - 1;

  return (
    <>
      {/* Dim backdrop with a soft cutout near the highlighted area */}
      <div
        onClick={dismiss}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(2px)",
          zIndex: 60,
          animation: "tour-fade 200ms ease-out",
        }}
      />

      {/* Pointer ring, anchored to a rough screen target. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          ...positionFor(s.target),
          width: ringSizeFor(s.target),
          height: ringSizeFor(s.target),
          borderRadius: "50%",
          border: "2px solid #ffffff",
          boxShadow: "0 0 0 9999px rgba(15,23,42,0.0), 0 0 30px rgba(255,255,255,0.5)",
          pointerEvents: "none",
          zIndex: 61,
          animation: "tour-pulse 1.6s ease-out infinite",
        }}
      />

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={s.title}
        style={{
          position: "fixed",
          ...cardPositionFor(s.target),
          width: "min(360px, 92vw)",
          background: "#fbfaf6",
          color: "#0f172a",
          padding: 24,
          zIndex: 62,
          boxShadow: "0 20px 50px -10px rgba(15,23,42,0.4)",
          borderRadius: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Tour · {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={dismiss}
            type="button"
            aria-label="Skip tour"
            style={{
              background: "transparent",
              border: "none",
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#64748b",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Skip
          </button>
        </div>
        <h3
          style={{
            fontFamily: SERIF,
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            margin: "0 0 12px",
            color: "#0f172a",
          }}
        >
          {s.title}
        </h3>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 15,
            lineHeight: 1.55,
            color: "#334155",
            margin: "0 0 20px",
          }}
          dangerouslySetInnerHTML={{ __html: s.body }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                flex: 1,
                height: 2,
                background: i <= step ? "#225f1c" : "#cbd5e1",
                transition: "background 200ms",
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={next}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "12px 24px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isFinal ? "Begin" : "Next"}
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes tour-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes tour-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.75;
          }
        }
      `}</style>
    </>
  );
}

function positionFor(target: Step["target"]) {
  // Approx coordinates for known UI elements.
  switch (target) {
    case "toggles":
      return { right: 16, top: 96 };
    case "legend":
      return { left: 16, bottom: 96 };
    case "recenter":
      return { right: 16, bottom: 96 };
    case "time":
      return { right: 16, top: 380 };
    case "camera":
      return { right: 16, bottom: 180 };
    case "infocard":
    default:
      return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  }
}

function ringSizeFor(target: Step["target"]) {
  switch (target) {
    case "infocard":
      return 200;
    case "toggles":
      return 220;
    case "time":
      return 80;
    default:
      return 80;
  }
}

function cardPositionFor(target: Step["target"]) {
  switch (target) {
    case "toggles":
    case "time":
      return { right: 24, top: "50%", transform: "translateY(-50%)" };
    case "legend":
      return { left: 24, top: "50%", transform: "translateY(-50%)" };
    case "recenter":
    case "camera":
      return { right: 24, top: "50%", transform: "translateY(-50%)" };
    case "infocard":
    default:
      return { left: "50%", top: "20%", transform: "translateX(-50%)" };
  }
}
