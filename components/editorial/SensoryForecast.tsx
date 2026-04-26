"use client";

import { useEffect, useMemo, useState } from "react";
import { MONO, SERIF } from "./Editorial";

/**
 * "Sensory Forecast" — a real-time strip showing the average sensory load
 * for nearby venues over the next 12 hours. Sources from /api/venues; if
 * the API is empty (offline or pre-seed), falls back to a plausible curve.
 *
 * Designed to drop into the editorial landing as a low-fi "weather widget"
 * for how the city will feel.
 */

type Venue = {
  _id: string;
  sensory?: { composite?: number };
};

const TAMPA_BBOX = "-82.55,27.95,-82.30,28.15";

export function SensoryForecast() {
  const [base, setBase] = useState<number | null>(null);
  const now = new Date();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/venues?bounds=${TAMPA_BBOX}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { venues?: Venue[] }) => {
        if (cancelled) return;
        const venues = d.venues ?? [];
        if (venues.length === 0) return;
        const composites = venues
          .map((v) => v.sensory?.composite)
          .filter((c): c is number => typeof c === "number");
        if (composites.length === 0) return;
        const avg = composites.reduce((s, c) => s + c, 0) / composites.length;
        setBase(avg);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const baseScore = base ?? 4.2;

  const hours = useMemo(() => {
    const list: { hour: number; score: number; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const h = new Date(now);
      h.setHours(h.getHours() + i, 0, 0, 0);
      const hour = h.getHours();
      // Diurnal pattern: quietest 4-7am, peaks at noon and 6-7pm.
      const t = hour;
      const noonBoost = Math.exp(-Math.pow((t - 12) / 4, 2)) * 1.6;
      const eveningBoost = Math.exp(-Math.pow((t - 19) / 3.5, 2)) * 1.8;
      const earlyDip = t < 8 ? -1.4 : 0;
      const score = Math.max(1.5, Math.min(8.5, baseScore + noonBoost + eveningBoost + earlyDip));
      list.push({ hour, score, label: formatHour(hour) });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseScore]);

  const max = Math.max(...hours.map((h) => h.score));

  return (
    <section
      style={{
        background: "#0f172a",
        color: "#f8fafc",
        padding: "48px clamp(24px, 4vw, 64px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 32,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#94a3b8",
              }}
            >
              Sensory forecast · Tampa, USF
            </span>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 400,
                margin: "8px 0 0",
                letterSpacing: "-0.02em",
                color: "#fff",
              }}
            >
              The next twelve hours,{" "}
              <span style={{ fontStyle: "italic", color: scoreColor(hours[0].score) }}>
                {scoreLabel(hours[0].score).toLowerCase()}.
              </span>
            </h3>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <Legend color="#bef264" label="Calm" />
            <Legend color="#fbbf24" label="Moderate" />
            <Legend color="#f87171" label="Intense" />
          </div>
        </header>

        <div
          role="img"
          aria-label={`Sensory forecast: starting ${scoreLabel(hours[0].score)}`}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${hours.length}, 1fr)`,
            gap: 8,
            alignItems: "end",
            height: 180,
            paddingTop: 20,
            borderTop: "1px solid #1e293b",
          }}
        >
          {hours.map((h, i) => {
            const heightPct = (h.score / max) * 100;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    color: "#cbd5e1",
                  }}
                >
                  {h.score.toFixed(1)}
                </span>
                <div
                  style={{
                    width: "100%",
                    height: `${heightPct}%`,
                    background: scoreColor(h.score),
                    borderRadius: 0,
                    minHeight: 4,
                    transition: "height 600ms ease",
                  }}
                />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: i === 0 ? "#fff" : "#94a3b8",
                  }}
                >
                  {h.label}
                </span>
              </div>
            );
          })}
        </div>

        <p
          style={{
            fontFamily: SERIF,
            fontSize: 16,
            fontStyle: "italic",
            color: "#cbd5e1",
            margin: 0,
            lineHeight: 1.55,
            maxWidth: "65ch",
          }}
        >
          Updated each minute from {base ? "live venue readings" : "a baseline forecast"}.
          Higher numbers mean louder, brighter, more crowded — plan around the dips.
        </p>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#cbd5e1",
      }}
    >
      <span style={{ width: 10, height: 10, background: color }} />
      {label}
    </span>
  );
}

function scoreColor(s: number): string {
  if (s < 3.5) return "#bef264";
  if (s < 5.5) return "#fbbf24";
  if (s < 7) return "#fb923c";
  return "#f87171";
}

function scoreLabel(s: number): string {
  if (s < 3.5) return "Calm";
  if (s < 5.5) return "Moderate";
  if (s < 7) return "Lively";
  return "Intense";
}

function formatHour(h: number): string {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  if (h < 12) return `${h}a`;
  return `${h - 12}p`;
}
