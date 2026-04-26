"use client";

import { useEffect, useState } from "react";
import { MONO, SERIF } from "./Editorial";

/**
 * A static, illustrated "map cover" for the hero — animates a calm route
 * drawing in over a sketched USF map. Pure SVG, no Google Maps required,
 * so the hero is fast and beautiful even with no API key.
 */
export function HeroMap() {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(true), 250);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure
      style={{
        margin: 0,
        position: "relative",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: 0,
        padding: 0,
        overflow: "hidden",
        aspectRatio: "16/10",
      }}
    >
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-hidden
      >
        <defs>
          <pattern id="paper" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
          </pattern>
          <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbfaf6" stopOpacity="0" />
            <stop offset="1" stopColor="#fbfaf6" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <rect width="800" height="500" fill="#ffffff" />
        <rect width="800" height="500" fill="url(#paper)" />

        {/* park blobs */}
        <path
          d="M 60 80 Q 160 50 240 110 Q 280 170 220 220 Q 130 240 80 190 Q 30 130 60 80 Z"
          fill="#dcebd6"
          opacity="0.55"
        />
        <path
          d="M 540 320 Q 660 290 720 360 Q 760 430 660 450 Q 560 460 520 410 Q 490 360 540 320 Z"
          fill="#dcebd6"
          opacity="0.55"
        />

        {/* roads (light grey base) */}
        <g stroke="#cbd5e1" fill="none" strokeLinecap="round" strokeWidth="14" opacity="0.55">
          <path d="M 0 240 L 800 240" />
          <path d="M 0 360 L 800 360" />
          <path d="M 240 0 L 240 500" />
          <path d="M 540 0 L 540 500" />
        </g>
        {/* roads (white inner) */}
        <g stroke="#fff" fill="none" strokeLinecap="round" strokeWidth="9">
          <path d="M 0 240 L 800 240" />
          <path d="M 0 360 L 800 360" />
          <path d="M 240 0 L 240 500" />
          <path d="M 540 0 L 540 500" />
        </g>

        {/* sensory zones (faint) */}
        <circle cx="540" cy="240" r="80" fill="#fde68a" opacity="0.35" />
        <circle cx="660" cy="180" r="60" fill="#fca5a5" opacity="0.35" />
        <circle cx="180" cy="360" r="70" fill="#bef264" opacity="0.35" />

        {/* primary calm route */}
        <path
          d="M 80 440 Q 180 380 240 360 Q 320 340 380 280 Q 440 220 540 200 Q 620 180 700 110"
          stroke="#225f1c"
          strokeWidth="22"
          opacity="0.18"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 80 440 Q 180 380 240 360 Q 320 340 380 280 Q 440 220 540 200 Q 620 180 700 110"
          stroke="#225f1c"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset="1"
          pathLength="1"
          style={{
            transition: "stroke-dashoffset 3500ms cubic-bezier(0.65,0,0.35,1)",
            strokeDashoffset: drawn ? 0 : 1,
          }}
        />

        {/* faster but louder alternative (dotted) */}
        <path
          d="M 80 440 Q 240 280 380 220 Q 520 160 700 110"
          stroke="#aa371c"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity="0.6"
          pathLength="1"
          style={{
            transition: "opacity 1200ms ease 1500ms",
            opacity: drawn ? 0.6 : 0,
          }}
        />

        {/* origin */}
        <circle cx="80" cy="440" r="9" fill="#fff" stroke="#225f1c" strokeWidth="3" />
        <circle cx="80" cy="440" r="3.5" fill="#225f1c" />

        {/* destination pin */}
        <g
          transform="translate(700 110)"
          style={{
            transformOrigin: "0 0",
            transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1) 1800ms",
            transform: drawn ? "translate(700px, 110px) scale(1)" : "translate(700px, 130px) scale(0.4)",
            opacity: drawn ? 1 : 0,
          }}
        >
          <circle r="14" fill="#225f1c" opacity="0.18" />
          <path
            d="M0 -11 C 6 -11, 11 -6, 11 0 C 11 8, 0 16, 0 16 C 0 16, -11 8, -11 0 C -11 -6, -6 -11, 0 -11 Z"
            fill="#225f1c"
          />
          <circle r="3.6" fill="#fff" />
        </g>

        {/* labels */}
        <g
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontWeight="500"
          fontSize="11"
          fill="#475569"
        >
          <text x="320" y="364" letterSpacing="2">
            FOWLER AVE
          </text>
          <text x="555" y="232" letterSpacing="2">
            BRUCE B DOWNS
          </text>
        </g>

        {/* paper vignette */}
        <rect width="800" height="500" fill="url(#vignette)" />
      </svg>

      {/* metadata caption — newspaper style */}
      <figcaption
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "16px 24px",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(6px)",
          color: "#f8fafc",
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>Tampa · USF · 0.9 mi</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#22c55e" }} />
          Calm route · 14 min
        </span>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>
          Avoids 1 loud zone, 1 active alert
        </span>
      </figcaption>
    </figure>
  );
}
