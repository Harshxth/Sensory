import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { MapView } from "@/components/map/MapView";
import { SensoryLayer } from "@/components/map/SensoryLayer";
import { BootSplash } from "@/components/BootSplash";
import { WorkflowCardSwap } from "@/components/marketing/WorkflowCardSwap";
import { AccessibilityCards } from "@/components/marketing/AccessibilityCards";
import { SensoryLockup, SensoryGlyph } from "@/components/brand/SensoryMark";

const STATS = [
  { label: "Venues mapped", value: "148", sub: "USF + Tampa, 5–10 mi radius" },
  { label: "Sensory dimensions", value: "5", sub: "Noise · Light · Crowd · Smell · Exits" },
  { label: "Languages", value: "3", sub: "EN · ES · 中文" },
];

export default function LandingPage() {
  return (
    <>
      <BootSplash />
      <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-xl border-b border-outline/15">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <SensoryLockup glyphSize={36} wordSize={26} />

          <nav className="hidden md:flex gap-8" aria-label="Primary">
            <a href="#features" className="font-semibold text-on-surface-variant hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how" className="font-semibold text-on-surface-variant hover:text-primary transition-colors">
              How it works
            </a>
            <Link href="/map" className="font-semibold text-on-surface-variant hover:text-primary transition-colors">
              Open map
            </Link>
          </nav>
          <Link
            href="/onboarding"
            className="bg-primary text-on-primary px-6 h-11 rounded-full font-bold text-sm flex items-center justify-center hover:bg-primary-dim active:scale-95 transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center w-full">
        <section className="w-full px-6 pt-12 md:pt-20 pb-12 md:pb-16 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-sm font-bold mb-6">
            <Icon name="auto_awesome" filled size={16} />
            Accessibility-first navigation
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-on-background tracking-tight max-w-5xl mx-auto leading-[1.05] mb-6">
            The world feels different to everyone.
            <span className="block text-primary mt-2">Maps should too.</span>
          </h1>
          <p className="text-lg md:text-2xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Navigate by how a place <em>feels</em> — noise, light, crowd, smell, exits — for autistic,
            sensory-sensitive, wheelchair, deaf, blind, and ESL communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/onboarding"
              className="bg-primary text-on-primary px-8 h-14 rounded-full font-bold text-lg hover:bg-primary-dim transition-all flex items-center justify-center min-w-[180px] shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
            <Link
              href="/map"
              className="border-2 border-on-background/15 text-on-background px-8 h-14 rounded-full font-bold text-lg hover:bg-surface-container transition-all flex items-center justify-center min-w-[180px] gap-2"
            >
              <Icon name="map" size={20} />
              Open the Map
            </Link>
          </div>
        </section>

        <section className="w-full px-6 pb-16 md:pb-24 max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-outline/10 bg-surface-container-low">
            <div className="relative h-[420px] md:h-[560px] w-full">
              <MapView interactive={false} initialZoom={12} className="absolute inset-0">
                <SensoryLayer />
              </MapView>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              <div className="pointer-events-none absolute top-6 left-6 right-6 flex items-start justify-between">
                <div className="bg-surface-bright/90 backdrop-blur-md rounded-full px-4 py-2 shadow-md border border-outline/10 flex items-center gap-2 text-sm font-bold text-on-surface">
                  <Icon name="location_on" filled size={16} className="text-primary" />
                  USF · Tampa
                </div>
                <div className="bg-surface-bright/90 backdrop-blur-md rounded-2xl px-4 py-2 shadow-md border border-outline/10 hidden sm:flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Legend
                  </span>
                  <div className="flex items-center gap-3 text-xs font-semibold mt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> Calm
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> Mod
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#aa371c]" /> Intense
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/map"
                className="absolute bottom-6 right-6 bg-primary text-on-primary px-5 h-12 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary-dim transition-colors"
              >
                Explore live map
                <Icon name="arrow_forward" size={18} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-surface-container-low rounded-2xl p-5 border border-outline/10 flex flex-col gap-1"
              >
                <span className="text-3xl font-bold text-primary tracking-tight">{s.value}</span>
                <span className="text-sm font-bold text-on-surface">{s.label}</span>
                <span className="text-xs text-on-surface-variant">{s.sub}</span>
              </div>
            ))}
          </div>
        </section>

        <WorkflowCardSwap />

        <AccessibilityCards />

        <section id="how" className="w-full px-6 pb-16 md:pb-24 max-w-5xl mx-auto">
          <div className="bg-on-background text-background rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-container/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-tertiary-container/20 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Hear venues in your comfort voice
              </h2>
              <p className="text-lg opacity-80 mb-8 max-w-2xl">
                Many autistic kids regulate better with a familiar voice. Sensory clones a
                30-second sample so venue summaries are read in the voice of someone you trust —
                in English, Spanish, or Mandarin.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 bg-background text-on-background px-6 h-12 rounded-full font-bold hover:bg-surface transition-colors"
              >
                Try it now
                <Icon name="arrow_forward" size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-highest mt-auto rounded-t-3xl border-t border-outline/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-12 max-w-7xl mx-auto w-full">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <SensoryLockup glyphSize={32} wordSize={22} tag="Maps that feel" asLink={false} />
            <p className="text-sm leading-relaxed text-on-surface-variant max-w-xs">
              Built for inclusion. © 2026 Sensory Accessibility.
            </p>
          </div>
          <FooterColumn
            title="Product"
            items={[
              { label: "Features", href: "#features" },
              { label: "Map", href: "/map" },
              { label: "Onboarding", href: "/onboarding" },
            ]}
          />
          <FooterColumn
            title="About"
            items={[
              { label: "How it works", href: "#how" },
              { label: "Privacy", href: "/settings" },
            ]}
          />
          <FooterColumn
            title="Powered by"
            items={[
              { label: "MongoDB Atlas", href: "https://mongodb.com" },
              { label: "Gemini", href: "https://ai.google.dev" },
              { label: "ElevenLabs", href: "https://elevenlabs.io" },
              { label: "Google Maps", href: "https://maps.google.com" },
            ]}
          />
        </div>
      </footer>
    </>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-on-surface">{title}</span>
      {items.map((i) => (
        <a
          key={i.href}
          href={i.href}
          className="text-sm text-on-surface-variant hover:text-primary hover:underline"
        >
          {i.label}
        </a>
      ))}
    </div>
  );
}
