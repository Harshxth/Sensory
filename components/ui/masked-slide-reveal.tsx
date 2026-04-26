"use client";

import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface MaskedSlideRevealProps {
  text: string;
  staggerDelay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  speed?: number;
  className?: string;
  /** Override letter-spacing (default: -0.03em — tight display setting). */
  letterSpacing?: string;
  /** Override font-family (default: app's display sans). */
  fontFamily?: string;
}

/**
 * Word-by-word slide-up reveal driven by Remotion's frame timeline.
 *
 * Each word sits inside an `overflow: hidden` mask. When the spring crosses
 * its rest point, the inner span translates from translateY(100%) → 0,
 * so the word appears to rise into view from below the mask.
 *
 * Renders inside a <Player /> from @remotion/player.
 */
export function MaskedSlideReveal({
  text,
  staggerDelay = 3,
  fontSize = 72,
  color = "#171717",
  fontWeight = 700,
  speed = 1,
  className,
  letterSpacing = "-0.03em",
  fontFamily,
}: MaskedSlideRevealProps) {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();

  const words = text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <span
        className={className}
        style={{
          fontSize,
          fontWeight,
          color,
          letterSpacing,
          fontFamily:
            fontFamily ??
            'var(--font-public-sans), -apple-system, BlinkMacSystemFont, "Public Sans", sans-serif',
        }}
      >
        {words.map((word, i) => {
          const t = spring({
            frame: frame - i * staggerDelay,
            fps,
            config: { damping: 14 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
                lineHeight: 1,
                marginRight: "0.25em",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transform: `translateY(${(1 - t) * 100}%)`,
                }}
              >
                {word}
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
}
