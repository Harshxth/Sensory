"use client";

/**
 * Accessibility feature cards in the same image-embedded card style as
 * WorkflowCardSwap - so the "Built for every experience" section feels
 * cohesive with the Sensory product life cycle cards above it.
 *
 * Each card: full-bleed Unsplash photo, bottom gradient tint, white text
 * with eyebrow label, serif title, and a one-line caption.
 */

type Card = {
  vol: string;
  title: string;
  caption: string;
  image: string;
  tint: string;
  accent: string;
  icon: string;
};

const CARDS: Card[] = [
  {
    vol: "Need · 01",
    title: "Mobility safe",
    caption:
      "Step-free routes, ramp locations, and verified accessible entrances - updated in real time.",
    // Warm sunlit walkway with no steps - feel of an accessible path
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(35,21,5,0.78)",
    accent: "#22c55e",
    icon: "♿",
  },
  {
    vol: "Need · 02",
    title: "Vision support",
    caption:
      "High-contrast modes, audible turn-by-turn, and a camera that reads any sign aloud in your language.",
    // Warm reading nook / soft window light - vision-as-comfort
    image:
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(28,14,4,0.78)",
    accent: "#fb923c",
    icon: "👁",
  },
  {
    vol: "Need · 03",
    title: "Hearing friendly",
    caption:
      "Visual alerts, vibration cues, and environments tagged for sign-language visibility.",
    // Warm intimate conversation - hands + faces in soft light
    image:
      "https://images.unsplash.com/photo-1454944338482-a69bb95894af?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(28,14,4,0.78)",
    accent: "#22d3ee",
    icon: "🦻",
  },
  {
    vol: "Need · 04",
    title: "Sensory calm routing",
    caption:
      "Navigate away from loud construction, heavy traffic, and crowded areas - to the quietest path that fits your body.",
    // Soft empty bench / golden-hour path - the literal calm
    image:
      "https://images.unsplash.com/photo-1437428948595-93b67d4c34a3?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(28,42,18,0.80)",
    accent: "#225f1c",
    icon: "🔇",
  },
  {
    vol: "Need · 05",
    title: "Dyslexia optimized",
    caption:
      "OpenDyslexic option, icon-first navigation, and plain-language summaries on every venue.",
    // Warm coffee + open book - reading as comfort
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(35,21,5,0.78)",
    accent: "#f59e0b",
    icon: "📖",
  },
  {
    vol: "Need · 06",
    title: "ESL ready",
    caption:
      "Map UI and live navigation in English, Spanish, and Mandarin. Sign reader translates as it speaks.",
    // Warm group of friends sharing a meal - multilingual community
    image:
      "https://images.unsplash.com/photo-1444459094717-a39f1e3e0903?q=80&w=1400&auto=format&fit=crop",
    tint: "rgba(28,14,4,0.78)",
    accent: "#a855f7",
    icon: "🌐",
  },
];

export function AccessibilityCards() {
  return (
    <section
      id="features"
      className="w-full px-5 sm:px-6 pb-16 md:pb-24 max-w-7xl mx-auto"
    >
      <div className="text-center mb-8 sm:mb-12 md:mb-16 max-w-2xl mx-auto px-2">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] sm:tracking-[0.4em] text-on-surface-variant/70 font-semibold">
          Built for every experience
        </span>
        <h2
          className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-6xl font-light tracking-tight leading-[1.05] text-on-surface"
          style={{ fontFamily: '"Playfair Display","Public Sans",serif' }}
        >
          A toolbox of accommodations,{" "}
          <span className="italic text-on-surface/45">all on by default.</span>
        </h2>
        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed">
          Tailored routing, venue details, and a map that respects how different
          bodies and minds move through space.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {CARDS.map((card) => (
          <ImageCard key={card.vol} card={card} />
        ))}
      </div>
    </section>
  );
}

function ImageCard({ card }: { card: Card }) {
  return (
    <article
      className="relative overflow-hidden group cursor-default"
      style={{
        borderRadius: 24,
        aspectRatio: "4 / 5",
        boxShadow:
          "0 20px 40px -16px rgba(15,23,42,0.20), 0 6px 18px -6px rgba(15,23,42,0.10)",
        border: "1px solid rgba(255,255,255,0.4)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ filter: "saturate(1.05) contrast(1.02)" }}
      />

      {/* gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${card.tint} 0%, ${card.tint.replace(/[\d.]+\)$/, "0.55)")} 35%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* accent dot */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "clamp(14px, 4vw, 22px)",
          right: "clamp(14px, 4vw, 22px)",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: card.accent,
          boxShadow: `0 0 14px ${card.accent}`,
        }}
      />

      {/* emoji glyph top-left for quick recognition */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "clamp(12px, 3.5vw, 18px)",
          left: "clamp(16px, 4.5vw, 24px)",
          fontSize: 20,
          lineHeight: 1,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
        }}
      >
        {card.icon}
      </span>

      {/* content */}
      <div
        style={{
          position: "absolute",
          left: "clamp(18px, 5vw, 28px)",
          right: "clamp(18px, 5vw, 28px)",
          bottom: "clamp(18px, 5vw, 28px)",
          color: "#ffffff",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          {card.vol}
        </span>
        <h3
          style={{
            fontFamily: '"Playfair Display","Public Sans",serif',
            fontWeight: 400,
            fontSize: "clamp(24px, 6vw, 36px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            marginTop: 10,
            fontSize: "clamp(11px, 2.6vw, 13px)",
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.82)",
            maxWidth: "42ch",
          }}
        >
          {card.caption}
        </p>
      </div>
    </article>
  );
}
