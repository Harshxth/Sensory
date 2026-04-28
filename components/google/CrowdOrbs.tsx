"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
  onSelect?: (venue: Venue) => void;
};

/**
 * Crowd visualization - 3D glowing orbs at each crowded venue. Diameter and
 * color intensity scale with crowd density. The shading + radial highlight
 * give the spheres a polished volumetric look that reads as distinct from
 * the noise heatmap (smooth blob) and lighting halo (yellow glow).
 */
export function CrowdOrbs({ venues, visible = true, onSelect }: Props) {
  if (!visible) return null;

  return (
    <>
      {venues.map((v) => {
        if (!v.location?.coordinates) return null;
        const score = v.sensory?.crowd ?? 0;
        if (score < 4) return null;

        // Score 4..10 → 18..52 px diameter
        const size = 18 + (score - 4) * 5.7;

        const palette =
          score >= 8.5
            ? { core: "#fda4af", mid: "#e11d48", edge: "#881337" }
            : score >= 7
              ? { core: "#fdba74", mid: "#ea580c", edge: "#7c2d12" }
              : score >= 5.5
                ? { core: "#fcd34d", mid: "#d97706", edge: "#78350f" }
                : { core: "#fef3c7", mid: "#f59e0b", edge: "#92400e" };

        return (
          <AdvancedMarker
            key={String(v._id)}
            position={{
              lat: v.location.coordinates[1],
              lng: v.location.coordinates[0],
            }}
            onClick={() => onSelect?.(v)}
          >
            <div
              role="button"
              aria-label={`${v.name} - crowd ${score.toFixed(1)} of 10`}
              className="cursor-pointer relative"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              {/* Outer pulsing aura */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: palette.mid,
                  opacity: 0.22,
                  filter: "blur(6px)",
                  transform: "scale(1.4)",
                }}
              />
              {/* The orb itself - radial gradient creates the 3D ball look */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 32% 28%, ${palette.core} 0%, ${palette.mid} 55%, ${palette.edge} 100%)`,
                  boxShadow: `
                    inset -2px -3px 6px rgba(0,0,0,0.35),
                    inset 2px 2px 4px rgba(255,255,255,0.45),
                    0 4px 10px rgba(0,0,0,0.35)
                  `,
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
              {/* Specular highlight (shine) */}
              <span
                aria-hidden
                className="absolute rounded-full"
                style={{
                  top: "16%",
                  left: "22%",
                  width: `${size * 0.32}px`,
                  height: `${size * 0.22}px`,
                  background: "rgba(255,255,255,0.55)",
                  filter: "blur(1px)",
                }}
              />
              {/* Score badge for high-density orbs */}
              {score >= 7 && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 -bottom-1 px-1.5 py-0.5 rounded-full bg-white/95 text-[10px] font-bold tabular-nums shadow"
                  style={{ color: palette.edge }}
                >
                  {score.toFixed(0)}
                </span>
              )}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
