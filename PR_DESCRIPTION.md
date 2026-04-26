# v2: Editorial Field Guide redesign (autonomous)

> **Open this PR at** https://github.com/Harshxth/Sensory/pull/new/autonomous/sensory-v2 and paste the body below.

---

## What this is

An **alternative aesthetic** for Sensory built autonomously while you slept. Same backend, same features, same brand color (`#225f1c`) — entirely different *voice*.

The current `main` site is direct/feature-focused with the Aura card swap. **v2** is editorial: huge serif headlines, magazine-style layout, monospace metadata, pull quotes, generous whitespace. Think: Apple Health × NYT × Stripe Press.

It is intentionally **not yet wired into production**. Review and tell me which parts (if any) to bring into `main`.

## What's new in v2

**Editorial component library** — `components/editorial/`
- `SerifHeadline`, `Lede`, `PullQuote`, `StatGrid`, `StoryCard`, `EditorialButton`, `Rule`, `MetaLine`, `PaperFrame`, `Eyebrow`
- `EditorialNav` (publication-style top bar)
- `HeroMap` (animated SVG map illustration — no Google Maps cost on the hero)

**Re-themed pages**
- **`/`** — masthead, huge serif hero ("The world feels *different* to everyone. Maps should too."), animated SVG hero map, stat grid (148 venues / 5 senses / 3 langs / 0 accounts), short essay, four story-card chapters, pull quote, feature spread, voices section, dark masthead footer.
- **`/how-it-works`** — four numbered editorial chapters (Sense, Plan, Walk, Share), each with display number, italic subdeck, body, a leftbar/rightbar detail, and a chapter-specific pull quote.
- **`/map`** — TopAppBar title now Cormorant serif with a Plex Mono "Live Field Map" tag. Otherwise identical functionality.

**Fonts added** (free, Google Fonts): Cormorant Garamond, IBM Plex Mono. Loaded in `app/layout.tsx`.

## How to preview

```bash
git checkout autonomous/sensory-v2
npm run dev
# visit /, /how-it-works, /map
```

Or trigger a Vercel preview deployment from this PR (it'll be at `sensory-git-autonomous-sensory-v2.vercel.app` or similar).

## Risks / things to verify

- Onboarding flow was **NOT** rewritten — kept original logic to avoid breaking preference-saving. If you want it editorial, that's a separate, careful pass.
- Settings/profile/saved pages untouched — still use the original Material-Design styling.
- BootSplash unchanged.
- All API routes / DB / map functionality identical to `main` (only chrome changed on `/map`).

## Decision matrix for you

- **Like all of it →** merge as-is, then I'll port settings/profile/onboarding to match.
- **Like the components but not the layout →** I'll rebuild `main`'s landing using these atoms.
- **Don't like it →** close PR, branch stays as a reference, no harm done.

## Files

- `app/(marketing)/page.tsx` — full editorial landing
- `app/how-it-works/page.tsx` — 4 editorial chapters
- `app/layout.tsx` — Cormorant + Plex Mono added
- `components/editorial/Editorial.tsx` — component library
- `components/editorial/EditorialNav.tsx` — sticky publication nav
- `components/editorial/HeroMap.tsx` — animated hero illustration
- `components/layout/TopAppBar.tsx` — serif-titled map app bar
