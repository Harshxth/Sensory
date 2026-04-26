import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const BRAND = "#225f1c";

type GlyphProps = {
  size?: number;
  /** Use white strokes for placement on dark backgrounds */
  reversed?: boolean;
  className?: string;
  title?: string;
};

/**
 * The Sensory glyph: a folded map tile with a calm route + sensory pin.
 * Adapts detail to size — at 16-24px we drop the grid/secondary route so
 * it stays legible as a favicon. From 32px+ we layer more in.
 */
export function SensoryGlyph({
  size = 28,
  reversed = false,
  className,
  title = "Sensory",
}: GlyphProps) {
  const ink = reversed ? "#ffffff" : BRAND;
  const tile = reversed ? "transparent" : "#ffffff";

  // Detail tiers
  const showGrid = size >= 28;
  const showSecondary = size >= 36;
  const showPinRings = size >= 36;

  // Stroke widths scale a bit with size for crispness at small sizes.
  const tileStroke = size <= 18 ? 5 : size <= 28 ? 3.5 : 2.5;
  const routeStroke = size <= 18 ? 6 : size <= 28 ? 4.5 : 3.5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="68"
        height="68"
        rx="18"
        fill={tile}
        stroke={ink}
        strokeWidth={tileStroke}
      />

      {showGrid && (
        <g stroke={ink} strokeOpacity="0.10" strokeWidth="1">
          <path d="M24 4 V68" />
          <path d="M48 4 V68" />
          <path d="M4 26 H68" />
          <path d="M4 50 H68" />
        </g>
      )}

      {showSecondary && (
        <path
          d="M10 50 Q 22 44, 28 36 T 46 22 T 62 18"
          stroke={ink}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.30"
        />
      )}

      {/* Primary route */}
      <path
        d="M14 56 Q 26 50, 32 40 T 50 28"
        stroke={ink}
        strokeWidth={routeStroke}
        strokeLinecap="round"
        fill="none"
      />

      {/* Sensory pin */}
      <g transform="translate(46 22)">
        {showPinRings && (
          <>
            <circle r="13" fill={ink} fillOpacity="0.08" />
            <circle r="8.5" fill={ink} fillOpacity="0.16" />
          </>
        )}
        {size >= 28 ? (
          <>
            <path
              d="M0 -10 C 5.5 -10, 10 -5.5, 10 0 C 10 7, 0 14, 0 14 C 0 14, -10 7, -10 0 C -10 -5.5, -5.5 -10, 0 -10 Z"
              fill={ink}
            />
            <circle r="3.2" fill={reversed ? BRAND : "#ffffff"} />
          </>
        ) : (
          <circle r="9" fill={ink} />
        )}
      </g>
    </svg>
  );
}

type WordmarkProps = {
  size?: number;
  reversed?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function SensoryWordmark({
  size = 24,
  reversed = false,
  className,
  style,
}: WordmarkProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: '"Public Sans", system-ui, sans-serif',
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.025em",
        color: reversed ? "#ffffff" : BRAND,
        ...style,
      }}
    >
      Sensory
    </span>
  );
}

type LockupProps = {
  /** Height of the glyph in px. Wordmark scales relative to it. */
  glyphSize?: number;
  /** Wordmark size; defaults to ~92% of glyphSize. */
  wordSize?: number;
  reversed?: boolean;
  tag?: string;
  href?: string;
  className?: string;
  /** Render as a Link to "/" by default; pass false to render a plain span. */
  asLink?: boolean;
};

/**
 * Glyph + wordmark side by side. Default render is a Link to "/" so any
 * header that drops in <SensoryLockup /> automatically becomes a home link.
 */
export function SensoryLockup({
  glyphSize = 32,
  wordSize,
  reversed = false,
  tag,
  href = "/",
  asLink = true,
  className,
}: LockupProps) {
  const w = wordSize ?? Math.round(glyphSize * 0.92);
  const tagSize = Math.max(9, Math.round(glyphSize * 0.32));

  const inner: ReactNode = (
    <>
      <SensoryGlyph size={glyphSize} reversed={reversed} />
      <span className="flex flex-col" style={{ gap: tag ? 4 : 0 }}>
        <SensoryWordmark size={w} reversed={reversed} />
        {tag && (
          <span
            style={{
              fontFamily: '"Public Sans", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: tagSize,
              lineHeight: 1,
              color: reversed ? "rgba(255,255,255,0.65)" : "#64748b",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {tag}
          </span>
        )}
      </span>
    </>
  );

  const baseClass = `inline-flex items-center gap-3 ${className ?? ""}`.trim();

  if (asLink) {
    return (
      <Link href={href} className={baseClass} aria-label="Sensory home">
        {inner}
      </Link>
    );
  }
  return <span className={baseClass}>{inner}</span>;
}
