"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Venue } from "@/types";

type Props = {
  venues: Venue[];
  visible?: boolean;
  onSelect?: (venue: Venue) => void;
};

/**
 * Crowd visualization — isometric 3D hex prisms rising from each venue.
 * The hex's height + color scale with crowd score, giving an "Uber HexagonLayer"
 * feel that's clearly distinct from noise heatmaps and light glow.
 */
export function CrowdHexPrisms({ venues, visible = true, onSelect }: Props) {
  if (!visible) return null;

  return (
    <>
      {venues.map((v) => {
        if (!v.location?.coordinates) return null;
        const score = v.sensory?.crowd ?? 0;
        if (score < 4) return null;

        // Score 4..10 → height 24..78 px, hex radius 10..16 px
        const height = 24 + (score - 4) * 9;
        const r = 10 + (score - 4) * 1;

        const palette =
          score >= 8.5
            ? { top: "#fda4af", side1: "#e11d48", side2: "#9f1239" }
            : score >= 7
              ? { top: "#fdba74", side1: "#ea580c", side2: "#7c2d12" }
              : score >= 5.5
                ? { top: "#fcd34d", side1: "#d97706", side2: "#78350f" }
                : { top: "#fde68a", side1: "#f59e0b", side2: "#92400e" };

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
              aria-label={`${v.name} — crowd ${score.toFixed(1)} of 10`}
              className="cursor-pointer relative"
              style={{
                width: `${r * 2 + 8}px`,
                height: `${height + r + 12}px`,
              }}
            >
              <HexPrismSvg r={r} h={height} palette={palette} />
              {score >= 7 && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white/95 text-[10px] font-bold tabular-nums shadow"
                  style={{
                    color: palette.side2,
                    top: 0,
                  }}
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

/**
 * Renders an isometric hex prism. The hex's center is at the bottom of the
 * SVG so AdvancedMarker's anchor places the base of the prism on the venue
 * point.
 *
 * Geometry — pointy-top hex with radius r, extruded up by h:
 *   Top hex:   6 vertices around (cx, cy_top)
 *   Side faces: front-right, front, front-left rectangles
 */
function HexPrismSvg({
  r,
  h,
  palette,
}: {
  r: number;
  h: number;
  palette: { top: string; side1: string; side2: string };
}) {
  const cx = r + 4; // padding
  const top_cy = 6; // top center y
  const base_cy = top_cy + h; // base center y (where prism touches the ground)

  // Pointy-top hex vertices, clockwise starting from top
  const sin60 = Math.sin(Math.PI / 3);
  const hexAt = (cy: number) => [
    [cx, cy - r], // top
    [cx + r * sin60, cy - r / 2], // upper-right
    [cx + r * sin60, cy + r / 2], // lower-right
    [cx, cy + r], // bottom
    [cx - r * sin60, cy + r / 2], // lower-left
    [cx - r * sin60, cy - r / 2], // upper-left
  ];
  const top = hexAt(top_cy);
  const bot = hexAt(base_cy);

  const poly = (pts: number[][]) => pts.map((p) => p.join(",")).join(" ");
  // Side polygons (only the three "front" faces are visible)
  const sideRight = poly([top[1], top[2], bot[2], bot[1]]);
  const sideFront = poly([top[2], top[3], bot[3], bot[2]]);
  const sideLeft = poly([top[3], top[4], bot[4], bot[3]]);
  const topHex = poly(top);

  const totalH = base_cy + r + 6;
  const totalW = r * 2 + 8;

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ display: "block", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))" }}
    >
      {/* Ground shadow */}
      <ellipse
        cx={cx}
        cy={base_cy + r + 2}
        rx={r * 0.9}
        ry={r * 0.25}
        fill="rgba(0,0,0,0.35)"
        filter="blur(1px)"
      />
      {/* Three visible side faces */}
      <polygon points={sideRight} fill={palette.side1} stroke="rgba(0,0,0,0.25)" strokeWidth={0.6} />
      <polygon points={sideFront} fill={palette.side2} stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} />
      <polygon points={sideLeft} fill={palette.side1} fillOpacity={0.85} stroke="rgba(0,0,0,0.25)" strokeWidth={0.6} />
      {/* Top hex face */}
      <polygon points={topHex} fill={palette.top} stroke="rgba(255,255,255,0.5)" strokeWidth={0.8} />
    </svg>
  );
}
