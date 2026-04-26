"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SensoryGlyph } from "@/components/brand/SensoryMark";
import { MONO } from "./Editorial";

export function EditorialNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(251,250,246,0.92)" : "rgba(251,250,246,0)",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        transition: "background 200ms ease, border-color 200ms ease",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px clamp(24px, 4vw, 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <Link
          href="/"
          aria-label="Sensory home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          <SensoryGlyph size={28} />
          <span
            style={{
              fontFamily: '"Cormorant Garamond","Playfair Display",serif',
              fontWeight: 500,
              fontSize: 24,
              letterSpacing: "-0.02em",
              color: "#0f172a",
              lineHeight: 1,
            }}
          >
            Sensory
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#64748b",
              borderLeft: "1px solid #cbd5e1",
              paddingLeft: 12,
              marginLeft: 4,
            }}
          >
            A Field Guide
          </span>
        </Link>

        <nav
          aria-label="Primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
          className="hidden md:flex"
        >
          <Link href="#features" style={{ color: "#475569", textDecoration: "none" }}>
            Features
          </Link>
          <Link href="#field-guide" style={{ color: "#475569", textDecoration: "none" }}>
            Field guide
          </Link>
          <Link href="#voices" style={{ color: "#475569", textDecoration: "none" }}>
            Voices
          </Link>
          <Link href="/journal" style={{ color: "#475569", textDecoration: "none" }}>
            Journal
          </Link>
          <Link href="/map" style={{ color: "#475569", textDecoration: "none" }}>
            Open map
          </Link>
        </nav>

        <Link
          href="/onboarding"
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "10px 20px",
            background: "#0f172a",
            color: "#ffffff",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Begin
          <span aria-hidden>→</span>
        </Link>
      </div>
    </header>
  );
}
