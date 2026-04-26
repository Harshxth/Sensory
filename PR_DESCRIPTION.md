# v2: Editorial Field Guide redesign (autonomous)

> **Live preview:** https://sensory-v2.vercel.app
>
> **Open the PR at** https://github.com/Harshxth/Sensory/pull/new/autonomous/sensory-v2 and paste the body below.

---

## What this is

An **alternative aesthetic + two new features** for Sensory built autonomously while you slept. Same backend, same brand color (`#225f1c`), entirely different *voice* + extras.

The current `main` site is direct/feature-focused with the Aura card swap. **v2** is editorial: huge serif headlines, magazine-style layout, monospace metadata, pull quotes, generous whitespace. Think: Apple Health × NYT × Stripe Press.

It is intentionally **not yet wired into production**. Review at https://sensory-v2.vercel.app and tell me which parts (if any) to bring into `main`.

## What's new in v2

### A. Editorial component library
`components/editorial/Editorial.tsx`:
- `SerifHeadline`, `Lede`, `PullQuote`, `StatGrid`, `StoryCard`, `EditorialButton`, `Rule`, `MetaLine`, `PaperFrame`, `Eyebrow`

`components/editorial/EditorialNav.tsx` — sticky publication-style nav with masthead + journal link.

`components/editorial/HeroMap.tsx` — animated SVG map illustration (no Google Maps cost on the hero, draws in over 3.5s).

`components/editorial/SensoryForecast.tsx` — **NEW FEATURE**: a 12-hour bar chart of predicted sensory load for Tampa/USF, sourced live from the venue API with a diurnal-pattern fallback.

### B. Re-themed pages
- **`/`** — masthead, huge serif hero, animated SVG hero map, stat grid (148 venues / 5 senses / 3 langs / 0 accounts), **Sensory Forecast strip** (dark, 12-hour bar chart), short essay, four story-card chapters, pull quote, feature spread, voices section, dark masthead footer.
- **`/how-it-works`** — four numbered editorial chapters (Sense, Plan, Walk, Share), each with display number, italic subdeck, body, leftbar/rightbar detail, and a chapter-specific pull quote.
- **`/map`** — TopAppBar title now Cormorant serif with a Plex Mono "Live Field Map" tag. Otherwise identical functionality.
- **`/journal`** — **NEW FEATURE**: editorial trip journal. Each completed navigation gets logged locally as a field note with date, route kind (calm/faster), distance, time, sensory tags encountered, and a free-text reflection field. Stats header shows total trips, calm-route count, total km, total time. Demo entries seeded so the page never looks empty.

### C. Trip Journal wiring
`lib/journal.ts` — versioned localStorage schema, CRUD helpers, demo seed.

`app/map/page.tsx` — `NavigationOverlay onEnd` now calls `saveJournalEntry` with route kind, distance, duration, and the sensory flags the route passed through.

### D. Fonts added
Cormorant Garamond (display serif) + IBM Plex Mono (metadata) — both free Google Fonts. Loaded in `app/layout.tsx`.

## How to preview

Already live: https://sensory-v2.vercel.app — pages to check:
- `/` — full editorial landing with the Sensory Forecast in the middle
- `/how-it-works` — 4 chapter spreads
- `/journal` — pre-seeded with 3 demo entries
- `/map` — same map, new app bar

Local:
```bash
git checkout autonomous/sensory-v2
npm run dev
```

## Risks / things to verify

- **Onboarding flow was NOT rewritten** — kept original logic to avoid breaking preference-saving. If you want it editorial, that's a separate, careful pass.
- **Settings/profile/saved pages untouched** — still original Material-Design styling.
- **BootSplash unchanged** — still the white wordmark splash.
- All API routes / DB / map functionality identical to `main` (only chrome changed on `/map`).
- Trip Journal is **local-only** by design (no DB writes, no PII leaves the device). Good for privacy story; bad if you want cross-device sync.

## Decision matrix for you

- **Like all of it →** merge as-is, then I'll port settings/profile/onboarding to match.
- **Like the components but not the layout →** I'll rebuild `main`'s landing using these atoms.
- **Like only the Trip Journal →** cherry-pick `lib/journal.ts` + `app/journal/page.tsx` + the `NavigationOverlay onEnd` wiring.
- **Like only the Sensory Forecast →** cherry-pick `components/editorial/SensoryForecast.tsx` and drop it into the existing landing as a section.
- **Don't like any of it →** close PR, branch stays as a reference, no harm done.

## Files touched

- `app/(marketing)/page.tsx` — full editorial landing (with Forecast)
- `app/how-it-works/page.tsx` — 4 editorial chapters
- `app/journal/page.tsx` — NEW Trip Journal page
- `app/map/page.tsx` — wires journal save into nav end
- `app/layout.tsx` — Cormorant + Plex Mono added
- `components/editorial/Editorial.tsx` — component library
- `components/editorial/EditorialNav.tsx` — sticky publication nav
- `components/editorial/HeroMap.tsx` — animated hero illustration
- `components/editorial/SensoryForecast.tsx` — NEW 12-hour forecast widget
- `components/layout/TopAppBar.tsx` — serif-titled map app bar
- `lib/journal.ts` — journal storage helpers
