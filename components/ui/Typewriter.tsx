"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Text to type out. Re-running the effect when this changes. */
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Delay before starting (after mount). */
  startDelay?: number;
  /** Extra className passed to the wrapper span. */
  className?: string;
  /** Show a blinking caret while/after typing. */
  caret?: boolean;
  /** Optional inline style passthrough. */
  style?: React.CSSProperties;
  /** Loop the type/erase cycle (good for screensavers). */
  loop?: boolean;
  /** How long to hold the fully-typed string before erasing (only if loop). */
  holdMs?: number;
};

/**
 * Lightweight typewriter - types text char by char, holds, optionally
 * erases, and loops. No external deps.
 */
export function Typewriter({
  text,
  speed = 55,
  startDelay = 0,
  className,
  caret = true,
  style,
  loop = false,
  holdMs = 1800,
}: Props) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let t: number | null = null;
    setShown("");
    setDone(false);

    const playOnce = (cb: () => void) => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          setDone(true);
          cb();
          return;
        }
        t = window.setTimeout(tick, speed);
      };
      t = window.setTimeout(tick, startDelay);
    };

    const eraseOnce = (cb: () => void) => {
      let i = text.length;
      const tick = () => {
        if (cancelled) return;
        i--;
        setShown(text.slice(0, Math.max(i, 0)));
        if (i <= 0) {
          setDone(false);
          cb();
          return;
        }
        t = window.setTimeout(tick, Math.max(20, speed * 0.5));
      };
      t = window.setTimeout(tick, holdMs);
    };

    const cycle = () => {
      playOnce(() => {
        if (!loop || cancelled) return;
        eraseOnce(() => {
          if (!cancelled) cycle();
        });
      });
    };

    cycle();

    return () => {
      cancelled = true;
      if (t != null) window.clearTimeout(t);
    };
  }, [text, speed, startDelay, loop, holdMs]);

  return (
    <span className={className} style={style}>
      {shown}
      {caret && (
        <span
          aria-hidden
          className="typewriter-caret"
          style={{
            display: "inline-block",
            width: "0.06em",
            height: "1em",
            marginLeft: "0.05em",
            background: "currentColor",
            transform: "translateY(0.12em)",
            animation: "typewriter-blink 0.85s steps(1) infinite",
            opacity: done ? 0.7 : 1,
          }}
        />
      )}
      <style jsx>{`
        @keyframes typewriter-blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
