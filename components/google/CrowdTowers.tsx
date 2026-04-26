"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
  onSelect?: (venue: Venue) => void;
};

/**
 * Crowd visualization — vertical 3D-styled towers rising from each venue.
 * Tower height scales with crowd score. Inspired by population-density
 * choropleths where peaks rise out of the surface.
 */
export function CrowdTowers({ venues, visible = true, onSelect }: Props) {
  if (!visible) return null;

  return (
    <>
      {venues.map((v) => {
        if (!v.location?.coordinates) return null;
        const score = v.sensory?.crowd ?? 0;
        if (score < 4) return null;

        // Score 4..10 → 32..120 px tall
        const height = 32 + (score - 4) * 14.5;
        const width = 18;

        const fill =
          score >= 8.5
            ? { top: "#fda4af", mid: "#e11d48", bottom: "#881337" }
            : score >= 7
              ? { top: "#fdba74", mid: "#ea580c", bottom: "#7c2d12" }
              : score >= 5.5
                ? { top: "#fcd34d", mid: "#d97706", bottom: "#78350f" }
                : { top: "#fef3c7", mid: "#f59e0b", bottom: "#92400e" };

        return (
          <AdvancedMarker
            key={String(v._id)}
            position={{
              lat: v.location.coordinates[1],
              lng: v.location.coordinates[0],
            }}
            onClick={() => onSelect?.(v)}
          >
            {/* AdvancedMarker anchors the bottom-center of this content to
                the lat/lng. So we just stack the tower upward from here. */}
            <div
              role="button"
              aria-label={`${v.name} — crowd ${score.toFixed(1)} of 10`}
              className="cursor-pointer flex flex-col items-center"
              style={{ width: `${width + 16}px` }}
            >
              {/* Tower body — rises from baseline */}
              <div
                aria-hidden
                className="relative"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  background: `linear-gradient(180deg, ${fill.top} 0%, ${fill.mid} 50%, ${fill.bottom} 100%)`,
                  borderRadius: "4px 4px 2px 2px",
                  boxShadow: `
                    inset -2px 0 4px rgba(0,0,0,0.35),
                    inset 2px 0 3px rgba(255,255,255,0.25),
                    0 6px 10px -2px rgba(0,0,0,0.45)
                  `,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {/* Glowing top cap */}
                <span
                  className="absolute left-0 right-0 top-0 rounded-t-md"
                  style={{
                    height: "5px",
                    background: `linear-gradient(180deg, rgba(255,255,255,0.8), ${fill.top})`,
                    filter: "blur(0.4px)",
                  }}
                />
                {/* Score badge floating above */}
                {score >= 7 && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -top-5 px-1.5 py-0.5 rounded-full bg-white/95 text-[10px] font-bold tabular-nums shadow"
                    style={{ color: fill.bottom }}
                  >
                    {score.toFixed(0)}
                  </span>
                )}
              </div>
              {/* Ground shadow puddle */}
              <div
                aria-hidden
                className="rounded-full"
                style={{
                  marginTop: "1px",
                  width: `${width + 8}px`,
                  height: "5px",
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.45), transparent 75%)",
                  filter: "blur(1.5px)",
                }}
              />
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
