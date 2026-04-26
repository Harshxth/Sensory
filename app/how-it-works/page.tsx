"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EditorialNav } from "@/components/editorial/EditorialNav";
import {
  Eyebrow,
  SerifHeadline,
  Lede,
  PullQuote,
  EditorialButton,
  Rule,
  MetaLine,
  PaperFrame,
  SERIF,
  MONO,
} from "@/components/editorial/Editorial";

const CHAPTERS = [
  {
    number: "01",
    title: "Sense",
    italic: "Listen, look, remember.",
    body: "Every venue carries a fingerprint — how loud it is at noon, how bright the lighting is in the back, how packed the entrance gets after class. Sensory layers all of it over the streets you already know.",
    detail:
      "Five live signals: noise, lighting, crowd, smell, and exits. Each gets its own color and its own toggle, so you can see only what your body cares about today.",
    pull: "I checked the library at 8 a.m. before I walked over. It was green. I made it through finals.",
  },
  {
    number: "02",
    title: "Plan",
    italic: "Routes that respect your body.",
    body: "Tell us what you need — quieter, well-lit, step-free, signed in your language — and the routing engine ranks every candidate path against your profile, picking the lowest-impact route and explaining why.",
    detail:
      "Wheelchair users get hard-blocked from impassable segments. Noise-sensitive users get an 80-meter buffer around loud venues. The route is always faster than not arriving.",
    pull: "The calm route was nine minutes longer. It was the first time in two years I made it without leaving early.",
  },
  {
    number: "03",
    title: "Walk",
    italic: "Turn-by-turn, in your comfort voice.",
    body: "Live navigation in English, Spanish, or Mandarin. Optional haptic warnings vibrate before high-sensory zones. A camera button reads any sign aloud — for low-vision users and ESL travelers alike.",
    detail:
      "All on-device. No raw audio leaves your phone. Voice cues are short, calm, and never repeat unnecessarily.",
    pull: "My phone buzzed thirty feet before the construction. I had time to put my headphones on.",
  },
  {
    number: "04",
    title: "Share",
    italic: "A trusted person, always within tap.",
    body: "Caregiver mode generates a private read-only link. They see a dot on a map, get notified when you arrive, and can tap once to check in. No app required — just a URL.",
    detail:
      "Sharing is opt-in per journey. Stop sharing and the link goes dark in five minutes. Your data stays anonymous to everyone but you and the person you trust.",
    pull: "I shared a link with my partner. She didn't text. I didn't text. We both relaxed.",
  },
];

export default function HowItWorksPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/onboarding");
  }, [router]);

  return (
    <div style={{ background: "#fbfaf6", color: "#0f172a", minHeight: "100vh" }}>
      <EditorialNav />

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px clamp(24px, 4vw, 64px) 16px",
        }}
      >
        <MetaLine items={["Issue No. 01", "The Field Guide", "Four chapters", "≈ 4 min read"]} />
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px clamp(24px, 4vw, 64px) 96px",
        }}
      >
        <Eyebrow>How it works</Eyebrow>
        <SerifHeadline size="xl" style={{ marginTop: 28, marginBottom: 36, maxWidth: "16ch" }}>
          A short field guide to a calmer city.
        </SerifHeadline>
        <Lede>
          Four chapters. Read in the order you like. When you&apos;re done, set your
          profile and open the map — every choice you made will already be wired in.
        </Lede>
      </section>

      {CHAPTERS.map((c, i) => (
        <Chapter key={c.number} chapter={c} altRow={i % 2 === 1} />
      ))}

      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "120px clamp(24px, 4vw, 64px)",
          textAlign: "center",
        }}
      >
        <Rule label="Begin" />
        <SerifHeadline size="lg" italic style={{ marginBottom: 32 }}>
          Now make it yours.
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
          <EditorialButton href="/onboarding">Begin onboarding</EditorialButton>
          <EditorialButton href="/map" variant="ghost">
            Skip to the map
          </EditorialButton>
        </div>
      </section>
    </div>
  );
}

function Chapter({
  chapter,
  altRow,
}: {
  chapter: (typeof CHAPTERS)[number];
  altRow: boolean;
}) {
  return (
    <PaperFrame paddingY={120}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 64,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 32,
            maxWidth: 900,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(72px, 12vw, 160px)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "#225f1c",
                lineHeight: 0.85,
              }}
            >
              {chapter.number}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Chapter · {chapter.title}
            </span>
          </div>

          <SerifHeadline size="xl">
            {chapter.title}.{" "}
            <span style={{ fontStyle: "italic", color: "#475569" }}>
              {chapter.italic}
            </span>
          </SerifHeadline>

          <p
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              lineHeight: 1.55,
              color: "#1e293b",
              margin: 0,
            }}
          >
            {chapter.body}
          </p>

          <div
            style={{
              borderLeft: altRow ? "none" : "2px solid #225f1c",
              borderRight: altRow ? "2px solid #225f1c" : "none",
              padding: altRow ? "8px 24px 8px 0" : "8px 0 8px 24px",
              maxWidth: 720,
            }}
          >
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 17,
                lineHeight: 1.6,
                color: "#475569",
                margin: 0,
              }}
            >
              {chapter.detail}
            </p>
          </div>
        </div>

        <PullQuote attribution={`Field test · Chapter ${chapter.number}`}>
          {chapter.pull}
        </PullQuote>
      </div>
    </PaperFrame>
  );
}
