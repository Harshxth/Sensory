import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  ArrowRight,
  Ear,
  Eye,
  Languages,
  MapPin,
  Sparkles,
  Volume2,
  Sun,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BootMapPreview } from "@/components/BootMapPreview";

/** Detect a fresh handoff from the BootSplash so we can play the entry. */
const useBootHandoff = () => {
  const [justHandedOff, setJustHandedOff] = useState(false);
  useEffect(() => {
    try {
      const t = sessionStorage.getItem("sensory:boot-handoff");
      if (t && Date.now() - Number(t) < 4000) {
        setJustHandedOff(true);
        sessionStorage.removeItem("sensory:boot-handoff");
      }
    } catch {
      /* ignore */
    }
  }, []);
  return justHandedOff;
};

/* ---------------------------------------------------------------
 * Index — post-boot horizontal walkthrough.
 * Users swipe (or use arrow / dots) through 4 panels that explain
 * Sensory, then arrive at a CTA that hands off to /onboarding
 * where they tell us what they need to feel at ease.
 * ------------------------------------------------------------- */

const Index = () => {
  const nav = useNavigate();
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const handoff = useBootHandoff();

  const slides = [
    { key: "intro", node: <SlideIntro handoff={handoff} /> },
    { key: "how", node: <SlideHow /> },
    { key: "for", node: <SlideFor /> },
    { key: "cta", node: <SlideCTA onBegin={() => nav("/onboarding")} /> },
  ];

  const total = slides.length;
  const go = (i: number) => setSlide(Math.max(0, Math.min(total - 1, i)));

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(slide + 1);
      if (e.key === "ArrowLeft") go(slide - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slide]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    const threshold = 50;
    if (deltaX.current < -threshold) go(slide + 1);
    else if (deltaX.current > threshold) go(slide - 1);
    startX.current = null;
    deltaX.current = 0;
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-hero">
      {/* Aurora */}
      <div className="absolute inset-0 bg-aurora pointer-events-none" aria-hidden />
      <div
        className="absolute top-[-15%] left-[-10%] w-[520px] h-[520px] aura aura-calm"
        aria-hidden
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[520px] h-[520px] aura aura-moderate opacity-60"
        aria-hidden
      />

      {/* Tiny header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 grid place-items-center text-primary-glow ring-1 ring-primary-glow/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-display text-xl">Sensory</span>
        </div>
        <button
          onClick={() => nav("/onboarding")}
          className="tap text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip intro →
        </button>
      </header>

      {/* Swipeable track */}
      <main
        className="relative z-10 mt-6"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            {slides.map((s) => (
              <div key={s.key} className="min-w-full px-6 pb-32">
                <div className="max-w-4xl mx-auto pt-6 md:pt-12">{s.node}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots + arrow */}
        <div className="fixed md:absolute bottom-0 inset-x-0 z-20 px-6 pb-8 pt-6 bg-gradient-to-t from-background via-background/85 to-transparent">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Walkthrough progress"
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === slide}
                  aria-label={`Slide ${i + 1} of ${total}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === slide
                      ? "w-10 bg-primary-glow"
                      : i < slide
                        ? "w-6 bg-primary/70"
                        : "w-6 bg-muted"
                  )}
                />
              ))}
            </div>

            {slide < total - 1 ? (
              <button
                onClick={() => go(slide + 1)}
                className="tap inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow hover:bg-primary-glow transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => nav("/onboarding")}
                className="tap inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow hover:bg-primary-glow transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Swipe, tap a dot, or use ← →
          </p>
        </div>
      </main>
    </div>
  );
};

/* ---------- SLIDE 1 — Intro / hero ----------
 * When the user just dismissed the BootSplash (handoff=true) we play a
 * gentle, staggered entrance: the map preview rises from the position the
 * splash left it, the wordmark "echoes" smaller, then the headline + body
 * resolve. This makes the typography & map feel continuous across screens.
 */
const SlideIntro = ({ handoff = false }: { handoff?: boolean }) => {
  const [entered, setEntered] = useState(!handoff);
  useEffect(() => {
    if (!handoff) return;
    // Next frame, then commit final state to trigger the transition.
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, [handoff]);

  // Stagger helper — disabled (instant) when not handing off
  const stagger = (delay: number): React.CSSProperties =>
    handoff
      ? {
          opacity: entered ? 1 : 0,
          transform: entered ? "translateY(0)" : "translateY(14px)",
          transition: `opacity 700ms ease-out ${delay}ms, transform 700ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }
      : {};

  return (
    <section className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
      <div className="md:col-span-7 order-2 md:order-1">
        {/* Wordmark echo — typographic continuity from the splash */}
        <div
          className="mb-6 flex items-center gap-2 text-[hsl(var(--primary-deep))]"
          style={stagger(0)}
        >
          <span
            className="font-sans font-bold text-base tracking-tight"
            style={{ letterSpacing: "-0.01em" }}
          >
            Sensory
          </span>
          <span
            aria-hidden
            className="h-px w-8 bg-[hsl(var(--primary)/0.4)]"
          />
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            maps for everyone
          </span>
        </div>

        <p
          className="uppercase tracking-[0.28em] text-xs text-primary-glow/90 mb-5"
          style={stagger(120)}
        >
          The map for how a place feels
        </p>
        <h1
          className="font-display text-5xl md:text-7xl text-balance text-gradient-forest"
          style={stagger(180)}
        >
          Know how a place will feel — before you go.
        </h1>
        <p
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl text-pretty"
          style={stagger(280)}
        >
          Sensory tells you the noise, lighting, crowd and access of real places, in plain words.
          Built with — and for — people who experience the world differently.
        </p>
      </div>

      {/* Map handoff — same component as the BootSplash for visual continuity */}
      <aside className="md:col-span-5 order-1 md:order-2" style={stagger(0)}>
        <div
          style={{
            transform: handoff && !entered ? "translateY(-8px) scale(0.985)" : "translateY(0) scale(1)",
            transition:
              "transform 800ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <BootMapPreview />
        </div>
      </aside>
    </section>
  );
};

/* ---------- SLIDE 2 — How it works ---------- */
const SlideHow = () => (
  <section className="animate-fade-up">
    <p className="uppercase tracking-[0.28em] text-xs text-primary-glow/90 mb-5">
      How Sensory works
    </p>
    <h2 className="font-display text-4xl md:text-6xl text-balance text-gradient-forest max-w-3xl">
      Three honest signals. No jargon.
    </h2>
    <p className="mt-5 text-lg text-muted-foreground max-w-2xl text-pretty">
      Every place is rated on the things that actually shape your visit — described in plain
      language and cross-checked by the community.
    </p>

    <div className="mt-10 grid sm:grid-cols-3 gap-4">
      <SignalCard
        icon={Volume2}
        title="Noise"
        desc="From hushed reading rooms to live music. Know before you arrive."
        cls="bg-signal-calm"
      />
      <SignalCard
        icon={Sun}
        title="Lighting"
        desc="Dim, warm, fluorescent or sunlit — and whether it flickers."
        cls="bg-signal-moderate"
      />
      <SignalCard
        icon={Users}
        title="Crowd & access"
        desc="Step-free routes, seating, queues, and how busy it usually feels."
        cls="bg-signal-intense"
      />
    </div>
  </section>
);

/* ---------- SLIDE 3 — Built for ---------- */
const SlideFor = () => (
  <section className="animate-fade-up">
    <p className="uppercase tracking-[0.28em] text-xs text-primary-glow/90 mb-5">
      Built with people, not for them
    </p>
    <h2 className="font-display text-4xl md:text-6xl text-balance text-gradient-forest max-w-3xl">
      A map that meets you where you are.
    </h2>
    <p className="mt-5 text-lg text-muted-foreground max-w-2xl text-pretty">
      Sensory adapts to how you move, see, hear and read. Turn on what helps; ignore the rest.
    </p>

    <div className="mt-10 grid sm:grid-cols-2 gap-3">
      {[
        { icon: Accessibility, label: "Wheelchair routes", note: "Step-free paths and lift access." },
        { icon: Ear, label: "Visual alerts", note: "Captions, transcripts and signs." },
        { icon: Eye, label: "Audio descriptions", note: "Spoken layouts of every venue." },
        { icon: Languages, label: "Plain language", note: "No medical or corporate jargon." },
      ].map(({ icon: I, label, note }) => (
        <div
          key={label}
          className="flex items-start gap-3 rounded-2xl border border-border bg-surface/60 backdrop-blur-md p-4"
        >
          <span className="mt-0.5 w-10 h-10 rounded-xl bg-primary/15 grid place-items-center text-primary-glow ring-1 ring-primary-glow/30 shrink-0">
            <I className="w-5 h-5" />
          </span>
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{note}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ---------- SLIDE 4 — CTA into onboarding ---------- */
const SlideCTA = ({ onBegin }: { onBegin: () => void }) => (
  <section className="animate-fade-up text-center md:text-left max-w-3xl mx-auto md:mx-0">
    <p className="uppercase tracking-[0.28em] text-xs text-primary-glow/90 mb-5">
      A gentle start
    </p>
    <h2 className="font-display text-4xl md:text-6xl text-balance text-gradient-forest">
      Now — what do you need to feel at ease?
    </h2>
    <p className="mt-5 text-lg text-muted-foreground text-pretty">
      Tell Sensory a little about how you experience places. We'll shape the map around you —
      never to label you. You can change everything later.
    </p>

    <div className="mt-10 flex justify-center md:justify-start">
      <button
        onClick={onBegin}
        className="tap inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-8 py-4 shadow-glow hover:bg-primary-glow transition-colors"
      >
        Tell us what you need <ArrowRight className="w-5 h-5" />
      </button>
    </div>

    <div className="mt-12 inline-flex items-center gap-2 text-sm text-muted-foreground">
      <MapPin className="w-4 h-4 text-primary-glow" />
      Takes under a minute · private by default
    </div>
  </section>
);

/* ---------- helpers ---------- */

const SignalCard = ({
  icon: Icon,
  title,
  desc,
  cls,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  cls: string;
}) => (
  <div className="relative rounded-2xl p-5 glass border border-border overflow-hidden">
    <div className={cn("absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-30 blur-2xl", cls)} aria-hidden />
    <div className="relative">
      <span className="inline-flex w-10 h-10 rounded-xl bg-primary/15 text-primary-glow ring-1 ring-primary-glow/30 items-center justify-center">
        <Icon className="w-5 h-5" />
      </span>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export default Index;
