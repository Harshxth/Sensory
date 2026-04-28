"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/map", "/settings"];

const SQUARE_SIZE = 60;
const SPEED = 0.15;

/**
 * Animated grid background - a slow-drifting grid of squares with a
 * cursor-hover highlight and a soft radial vignette. Theme tokens come
 * from CSS variables in globals.css (`--grid-line`, `--grid-hover`,
 * `--grid-vignette-start/end`) so it adapts to system light/dark.
 *
 * Disabled on:
 *   - /map (the live map paints its own canvas + tiles fullscreen)
 *   - /settings (per user request, kept clean)
 *   - prefers-reduced-motion (we render a static grid instead of drifting)
 */
export function GridBackground() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef<{ x: number; y: number } | null>(null);

  // Hide on excluded routes (still mount the component, so page nav re-enables
  // it). Using startsWith handles nested routes like /settings/anything.
  const hidden = HIDDEN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  useEffect(() => {
    if (hidden) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const theme = {
      borderColor: "",
      hoverFillColor: "",
      vignetteStart: "",
      vignetteEnd: "",
    };

    const readTheme = () => {
      const style = getComputedStyle(document.documentElement);
      theme.borderColor = style.getPropertyValue("--grid-line").trim();
      theme.hoverFillColor = style.getPropertyValue("--grid-hover").trim();
      theme.vignetteStart = style.getPropertyValue("--grid-vignette-start").trim();
      theme.vignetteEnd = style.getPropertyValue("--grid-vignette-end").trim();
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const offsetX = offsetRef.current.x;
      const offsetY = offsetRef.current.y;
      ctx.lineWidth = 0.8;

      for (let x = -SQUARE_SIZE; x < width + SQUARE_SIZE; x += SQUARE_SIZE) {
        for (let y = -SQUARE_SIZE; y < height + SQUARE_SIZE; y += SQUARE_SIZE) {
          const sx = x - (offsetX % SQUARE_SIZE);
          const sy = y - (offsetY % SQUARE_SIZE);
          const gx = Math.floor((x + SQUARE_SIZE) / SQUARE_SIZE);
          const gy = Math.floor((y + SQUARE_SIZE) / SQUARE_SIZE);
          if (
            hoverRef.current &&
            gx === hoverRef.current.x &&
            gy === hoverRef.current.y
          ) {
            ctx.fillStyle = theme.hoverFillColor;
            ctx.fillRect(sx, sy, SQUARE_SIZE, SQUARE_SIZE);
          }
          ctx.strokeStyle = theme.borderColor;
          ctx.strokeRect(sx, sy, SQUARE_SIZE, SQUARE_SIZE);
        }
      }

      // Soft radial vignette so the edges fade into the page background.
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height),
      );
      gradient.addColorStop(0, theme.vignetteStart);
      gradient.addColorStop(1, theme.vignetteEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const tick = () => {
      offsetRef.current.x = (offsetRef.current.x + SPEED) % SQUARE_SIZE;
      offsetRef.current.y = (offsetRef.current.y + SPEED) % SQUARE_SIZE;
      draw();
      rafRef.current = window.requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const offsetX = offsetRef.current.x;
      const offsetY = offsetRef.current.y;
      hoverRef.current = {
        x: Math.floor((e.clientX + (offsetX % SQUARE_SIZE)) / SQUARE_SIZE),
        y: Math.floor((e.clientY + (offsetY % SQUARE_SIZE)) / SQUARE_SIZE),
      };
    };

    const onLeave = () => {
      hoverRef.current = null;
    };

    const onSchemeChange = () => readTheme();

    readTheme();
    resize();

    if (reduceMotion) {
      // Static render once; no rAF.
      draw();
    } else {
      rafRef.current = window.requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener?.("change", onSchemeChange);

    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      mql.removeEventListener?.("change", onSchemeChange);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
