import Link from "next/link";
import { BootSplash } from "@/components/BootSplash";
import { EditorialNav } from "@/components/editorial/EditorialNav";
import { HeroMap } from "@/components/editorial/HeroMap";
import {
  Eyebrow,
  SerifHeadline,
  Lede,
  PullQuote,
  StatGrid,
  StoryCard,
  EditorialButton,
  Rule,
  MetaLine,
  PaperFrame,
  SERIF,
  MONO,
} from "@/components/editorial/Editorial";

export const metadata = {
  title: "Sensory · A Field Guide to How a Place Feels",
  description:
    "An accessibility-first map of Tampa, USF, and beyond — for autistic, sensory-sensitive, wheelchair, deaf, blind, and ESL communities.",
};

export default function LandingPage() {
  return (
    <>
      <BootSplash />

      <div style={{ background: "#fbfaf6", color: "#0f172a", minHeight: "100vh" }}>
        <EditorialNav />

        {/* ============ MASTHEAD ============ */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px clamp(24px, 4vw, 64px) 24px",
          }}
        >
          <MetaLine items={["Issue No. 01", "Tampa · USF Bull Country", "Spring 2026", "Free to use"]} />
        </section>

        {/* ============ HERO ============ */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(24px, 4vw, 48px) clamp(24px, 4vw, 64px) 80px",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 64,
          }}
        >
          <div>
            <Eyebrow>The map for how a place feels</Eyebrow>
            <SerifHeadline
              size="xxl"
              style={{ marginTop: 28, marginBottom: 28 }}
            >
              The world feels{" "}
              <span style={{ fontStyle: "italic", color: "#475569" }}>different</span>{" "}
              to everyone.
              <br />
              Maps should too.
            </SerifHeadline>
            <Lede style={{ marginBottom: 36 }}>
              Sensory layers real-time noise, light, crowd, smell, and exit data over
              the streets you already know — then routes you through the calmest
              path your body can handle.
            </Lede>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <EditorialButton href="/onboarding">Begin the field guide</EditorialButton>
              <EditorialButton href="/map" variant="ghost">
                Open the map
              </EditorialButton>
            </div>
          </div>

          <HeroMap />

          <StatGrid
            items={[
              { value: "148", label: "Venues mapped", sub: "USF + Tampa, 5–10 mi" },
              { value: "5", label: "Senses tracked", sub: "noise · light · crowd · smell · exits" },
              { value: "3", label: "Languages", sub: "EN · ES · 中文" },
              { value: "0", label: "Account required", sub: "anonymous from second one" },
            ]}
          />
        </section>

        {/* ============ ESSAY: WHY ============ */}
        <PaperFrame paddingY={120}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48, maxWidth: 800, margin: "0 auto" }}>
            <Eyebrow align="center">A short essay</Eyebrow>
            <SerifHeadline size="lg" italic style={{ textAlign: "center", color: "#225f1c" }}>
              Most maps tell you where things are.
              <br />
              Almost none tell you how they feel.
            </SerifHeadline>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                lineHeight: 1.65,
                color: "#1e293b",
                margin: 0,
              }}
            >
              For an autistic student, a strip mall isn&apos;t a strip mall —
              it&apos;s a strobing neon sign, three competing playlists, the smell
              of fryer oil, and a checkout line with no clear exit. For a wheelchair
              user, &ldquo;15 minutes&rdquo; and &ldquo;15 accessible minutes&rdquo;
              are not the same minute. For a parent navigating Tampa with a kid in
              sensory overload, the difference between a calm route and a fast one
              is the difference between a good day and the rest of the week.
            </p>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 20,
                lineHeight: 1.65,
                color: "#1e293b",
                margin: 0,
              }}
            >
              Sensory was built to close that gap. We don&apos;t replace Google Maps
              — we add the layer it never had: a moving picture of how it actually
              feels to be somewhere, updated by people who feel it too.
            </p>
          </div>
        </PaperFrame>

        {/* ============ FIELD GUIDE — STORY CARDS ============ */}
        <section
          id="field-guide"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "120px clamp(24px, 4vw, 64px)",
          }}
        >
          <div style={{ marginBottom: 64 }}>
            <Eyebrow>The field guide</Eyebrow>
            <SerifHeadline size="lg" style={{ marginTop: 24, maxWidth: 900 }}>
              How Sensory works,{" "}
              <span style={{ fontStyle: "italic", color: "#475569" }}>chapter by chapter.</span>
            </SerifHeadline>
          </div>

          <StoryCard
            chapter="Chapter 01 · Sense"
            title="A map that listens, watches, and remembers."
            body="Live noise, lighting, crowd, smell, and exit data — pulled from on-site readings, on-the-ground reports, and 24-hour memory of how each venue has felt. Color-coded so calm places look calm before you ever arrive."
          />
          <StoryCard
            chapter="Chapter 02 · Plan"
            title="Routes that respect your body."
            body="Tell us what your body needs — quieter, well-lit, step-free, signed in your language — and Sensory&rsquo;s routing engine ranks every alternative path against your profile, picking the lowest-impact route and explaining why."
          />
          <StoryCard
            chapter="Chapter 03 · Walk"
            title="Turn-by-turn, in your comfort voice."
            body="Live navigation with optional haptic warnings before high-sensory zones, voice cues in English, Spanish, or Mandarin, and a one-tap camera that reads any sign aloud — for low-vision users and ESL travelers alike."
          />
          <StoryCard
            chapter="Chapter 04 · Share"
            title="A trusted person, always within tap."
            body="Caregiver mode lets a parent, partner, or friend see your live journey on a private link, get notified when you arrive, and check in with one tap — no app install required."
          />
        </section>

        {/* ============ PULL QUOTE ============ */}
        <PaperFrame paddingY={96}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <PullQuote attribution="Field test, USF Tampa · Spring 2026">
              I planned a route to the library that avoided the food court. It was
              nine minutes longer. It was the first time in two years I made it
              there without leaving early.
            </PullQuote>
          </div>
        </PaperFrame>

        {/* ============ FEATURES SPREAD ============ */}
        <section
          id="features"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "120px clamp(24px, 4vw, 64px)",
          }}
        >
          <div style={{ marginBottom: 64 }}>
            <Eyebrow>Built for every body</Eyebrow>
            <SerifHeadline size="lg" style={{ marginTop: 24, maxWidth: 900 }}>
              A toolbox of accommodations, all on by default — and all off-able.
            </SerifHeadline>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 0,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCell key={f.title} feature={f} idx={i} />
            ))}
          </div>
        </section>

        {/* ============ VOICES ============ */}
        <PaperFrame paddingY={120}>
          <div id="voices">
            <Eyebrow>Voices from the field</Eyebrow>
            <SerifHeadline size="lg" style={{ marginTop: 24, marginBottom: 64, maxWidth: 900 }}>
              People we built this with.
            </SerifHeadline>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {VOICES.map((v) => (
                <VoiceCard key={v.who} voice={v} />
              ))}
            </div>
          </div>
        </PaperFrame>

        {/* ============ CTA ============ */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "120px clamp(24px, 4vw, 64px)",
            textAlign: "center",
          }}
        >
          <Rule label="Begin" />
          <SerifHeadline size="xl" italic style={{ marginBottom: 32 }}>
            Find the calm in your city.
          </SerifHeadline>
          <Lede style={{ margin: "0 auto 48px" }}>
            Three minutes of setup. No account. No tracking. Yours, anonymous, and
            yours to share.
          </Lede>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
            }}
          >
            <EditorialButton href="/onboarding">Begin the field guide</EditorialButton>
            <EditorialButton href="/map" variant="ghost">
              Open the live map
            </EditorialButton>
          </div>
        </section>

        {/* ============ MASTHEAD FOOTER ============ */}
        <footer
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            padding: "80px clamp(24px, 4vw, 64px)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 48,
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 36,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Sensory
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  display: "block",
                }}
              >
                A Field Guide · Issue No. 01
              </span>
              <p
                style={{
                  marginTop: 24,
                  fontFamily: SERIF,
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: "#cbd5e1",
                  maxWidth: "30ch",
                }}
              >
                Built in Tampa, for everyone who has ever felt a place too loudly.
                © 2026.
              </p>
            </div>

            <FooterColumn
              title="Read"
              items={[
                { label: "Field guide", href: "#field-guide" },
                { label: "Voices", href: "#voices" },
                { label: "Features", href: "#features" },
                { label: "How it works", href: "/how-it-works" },
              ]}
            />
            <FooterColumn
              title="Use"
              items={[
                { label: "Open the map", href: "/map" },
                { label: "Begin onboarding", href: "/onboarding" },
                { label: "Settings", href: "/settings" },
                { label: "Saved venues", href: "/saved" },
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
      </div>
    </>
  );
}

/* ---------- helper components ---------- */

const FEATURES = [
  {
    icon: "♿",
    title: "Mobility safe",
    body: "Step-free routes, ramp locations, verified accessible entrances. Wheelchair-blocked segments are removed entirely from candidate paths.",
  },
  {
    icon: "👁",
    title: "Vision support",
    body: "High-contrast modes, audible turn-by-turn, point-and-read camera that speaks any sign aloud in your language.",
  },
  {
    icon: "🦻",
    title: "Hearing-friendly",
    body: "Visual alerts, vibration cues for nearby hazards, environments tagged for sign-language visibility.",
  },
  {
    icon: "📚",
    title: "Dyslexia-optimized",
    body: "OpenDyslexic option, icon-first navigation, plain-language summaries on every venue.",
  },
  {
    icon: "🌐",
    title: "ESL ready",
    body: "Map UI and turn-by-turn voice in English, Spanish, and Mandarin. Sign reader translates as it speaks.",
  },
  {
    icon: "🤝",
    title: "Caregiver mode",
    body: "Share a private read-only link of your live journey. They see where you are, you stay in control.",
  },
];

function FeatureCell({
  feature,
  idx,
}: {
  feature: { icon: string; title: string; body: string };
  idx: number;
}) {
  return (
    <article
      style={{
        padding: "40px 32px",
        borderTop: "1px solid #cbd5e1",
        borderRight: idx % 3 === 2 ? "none" : "1px solid #cbd5e1",
        minHeight: 240,
        background: "#fbfaf6",
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: 28,
          display: "block",
          marginBottom: 24,
          color: "#225f1c",
        }}
      >
        {feature.icon}
      </span>
      <h3
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          fontWeight: 500,
          margin: 0,
          marginBottom: 12,
          letterSpacing: "-0.015em",
          color: "#0f172a",
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 16,
          lineHeight: 1.55,
          color: "#475569",
          margin: 0,
        }}
      >
        {feature.body}
      </p>
    </article>
  );
}

const VOICES = [
  {
    who: "Maya, 21 · USF student",
    role: "Autistic · ESL",
    quote:
      "I&rsquo;ve started picking my study spots by checking the map five minutes before I leave. The library is greener at 8 a.m. than at 2 p.m. — I never knew that, but my body did.",
  },
  {
    who: "Ben, 34 · Caregiver",
    role: "Parent of an autistic child",
    quote:
      "I share a link with my partner whenever I take our son to the dentist. She gets a little dot on her phone, and I get the calmer route. We don&rsquo;t talk about it — we just both relax.",
  },
  {
    who: "Dr. Liang · Audiologist",
    role: "Tampa General Hospital",
    quote:
      "What&rsquo;s remarkable isn&rsquo;t the data, it&rsquo;s that the data is asked for. The act of being asked &lsquo;was this loud for you?&rsquo; is itself accommodating.",
  },
];

function VoiceCard({ voice }: { voice: { who: string; role: string; quote: string } }) {
  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <span
        aria-hidden
        style={{
          fontFamily: SERIF,
          fontSize: 64,
          fontStyle: "italic",
          color: "#225f1c",
          lineHeight: 0.5,
          height: 32,
          display: "block",
        }}
      >
        &ldquo;
      </span>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 18,
          lineHeight: 1.5,
          color: "#1e293b",
          margin: 0,
        }}
        dangerouslySetInnerHTML={{ __html: voice.quote }}
      />
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#0f172a",
            display: "block",
            fontWeight: 500,
          }}
        >
          {voice.who}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#64748b",
            display: "block",
            marginTop: 4,
          }}
        >
          {voice.role}
        </span>
      </div>
    </article>
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
    <div>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#94a3b8",
          display: "block",
          marginBottom: 20,
        }}
      >
        {title}
      </span>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                color: "#e2e8f0",
                textDecoration: "none",
                borderBottom: "1px solid transparent",
                transition: "border-color 200ms ease",
              }}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
