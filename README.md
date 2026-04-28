# Sensory

> The map for how a place *feels* - built for autistic, sensory-sensitive, wheelchair, deaf, blind, and ESL communities the world wasn't designed for.

**Live demo:** [https://sensorymap.vercel.app](https://sensorymap.vercel.app)
**Standby screensaver:** [https://sensorymap.vercel.app/standby](https://sensorymap.vercel.app/standby) - open on a laptop while demoing on the phone.

Sensory layers real-time accessibility data on top of Google Maps so people with sensory or mobility needs can navigate by how a place actually feels - noise, crowd, lighting, smell, and exits - not just by ratings.

## What's in the app

### Map experience
- **Sensory heatmaps** - three differentiated palettes show noise (thermal), crowd (population density), and lighting (sunlight) on top of Google Maps.
- **Live "you are here" GPS** - pulsing blue dot with accuracy ring, auto-centers on first fix, recenter button bottom-right.
- **Place search** - Google Places autocomplete biased to the USF Tampa area; selecting a result pans + zooms the map and opens the directions panel.
- **Tap any place** - Google-Maps-style info card with rating, hours, photos, plus a sensory chip. Tap "More" for the full sensory profile. Action row (Directions / Website / Call / Full) sits above the bottom nav so it stays reachable on phones.
- **Profile-aware navigation** - Routes API alternative routes are scored against your accessibility profile (noise / light / wheelchair / deaf / blind / ESL); we pick the lowest-impact route and explain *why*.
- **Fullscreen turn-by-turn** - disability-aware voice cues ("loud zone ahead in 100 m") spoken in your cloned voice or stock Bella. Public transit steps surface line, headsign, board-at / off-at stops, and stop count. Wheelchair users opt into Google's `WHEELCHAIR_ACCESSIBLE` transit preference.
- **Photo-of-sign wayfinding** - point your camera at any sign; Gemini Vision transcribes + extracts a place name; we cross-reference your GPS + active destination and speak guidance: *"yes, you're heading toward Mr. Dunderbak's"* / *"that sign reads X - your destination is to your northeast."*
- **Time-aware sensory** - slider scrubs through the next 24 hours and re-renders heatmaps + scores using day-of-week / hour-of-day buckets.
- **Live event alerts** - geo-bounded, time-windowed banners ("Downtown street fair, avoid 4 – 7 PM").
- **Confirm or correct** - every venue can be confirmed or corrected by users; submissions update the venue's sensory score in real time via a community-weighted average.
- **Group mode** - share a read-only link with a caregiver to broadcast your live position and accessibility profile.
- **Haptic warnings** - phone vibrates as you approach a venue whose triggers match your profile, and on every nav step / sign-reader verdict.
- **Streetlight overlay** - OSM lamp density for night-walk planning.

### Voice + sensory agent
- **Sensory Guide ElevenLabs agent** (ID injected at build time via `ELEVENLABS_AGENT_ID`) - spoken Q&A about Tampa / USF venues, grounded on a 10-venue knowledge base with structured key/value entries. Drops into ESL "simple English" mode on request, switches to Spanish when prompted, refuses to invent venue data, and fails gracefully with a single useful next step.
- **Cloned comfort voice** - record 30 s of a parent / friend, the cloned voice ID is field-encrypted (AES-256-GCM) before storage, and replaces Bella for every spoken cue (nav, sign reader, summaries).
- **Multilingual TTS** - every spoken line goes through ElevenLabs `eleven_multilingual_v2`, so EN / ES / 中文 sound right out of the box.

### App chrome
- **Boot splash** - masked slide-reveal "Sensory" wordmark, types-in tagline, animated map drift behind. Plays on every visit, routes to `/how-it-works → /onboarding → /map`.
- **How-it-works** - 4 image-embedded "Vol. 0X" cards (Sense / Plan / Walk / Share) with auto-cycling 3D stack and warm art-photo backdrops.
- **Accessibility cards** - six warm photo cards covering Mobility / Vision / Hearing / Sensory routing / Dyslexia / ESL.
- **Spotlight bottom nav** - dark glass with an LED bar above the active tab, soft halo glows that fade by distance.
- **User dropdown** - radix-based menu on the profile avatar with profile / saved / settings / standby links.
- **Animated grid background** - slow-drifting square grid with cursor halo + radial vignette, on every page except `/map` and `/settings`.
- **Standby screensaver** at `/standby` - full-screen GSAP cinematic with auto-scroll, typewriter taglines, 5 s dwell at top + bottom, dark grid background. Drop it on a laptop and walk away.

## Tech stack

| Layer | Tool |
| --- | --- |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind v4 |
| Map | Google Maps JavaScript API + Routes API + Places Autocomplete |
| Animation | Framer Motion (3D card swap), GSAP + ScrollTrigger (standby cinematic), Remotion (text reveal primitives) |
| DB | MongoDB Atlas (geospatial 2dsphere + time-series) |
| AI - text | Gemini 2.5 Flash (sensory dimension extraction + sign-reading vision) |
| AI - voice | ElevenLabs Conversational AI (Sensory Guide agent) + IVC + multilingual TTS |
| Sensors | Web Audio API, Geolocation API, Vibration API, Web Speech API |
| OSM | Overpass for wheelchair-access nodes + streetlight density |

## Local setup

```bash
npm install
cp .env.local.example .env.local
# fill in: MONGODB_URI, MONGODB_DB, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
#          GOOGLE_PLACES_API_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY,
#          ELEVENLABS_AGENT_ID, FIELD_ENCRYPTION_KEY, ANON_SALT
# generate keys: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm run db:init          # create indexes + time-series collection + unique users.supabase_id
npm run seed:usf         # 148 USF + greater Tampa venues with simulated sensory data
# Optional alternate seeds:
npm run seed:venues      # ~30 venues fetched live from Google Places
npm run extract:sensory  # batch-call Gemini → sensory dimensions
npm run seed:reviews
npm run seed:alerts

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required Google Cloud APIs

The `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` needs all four of these enabled in Google Cloud Console:

1. **Maps JavaScript API** - base map + tiles
2. **Places API** - autocomplete in the search box
3. **Routes API** - alternative routes + transit details
4. **Geocoding API** - fallback address lookups

If autocomplete shows *"This page can't load Google Maps correctly"*, enable Places API for the key.

## Project structure

```
app/
  (marketing)/        boot splash + onboarding (4-step accessibility profile)
  how-it-works/       Aura-style auto-cycling card swap
  map/                main map experience (heatmaps + nav + search + sign reader)
  standby/            full-screen cinematic screensaver (GSAP)
  settings/           preferences + group mode share link
  profile/            user profile
  saved/              saved venues
  venue/[id]/         dedicated venue detail
  share/[token]/      caregiver read-only view
  api/                venues, reviews, noise, alerts, places, vision, voice,
                      wayfinding, share
components/
  google/             GoogleMap, NoiseHeatmap, CrowdHeatmap, LightHeatmap,
                      DirectionsLayer, NavigationOverlay, StreetlightHeatmap,
                      VenueMarkers, AlertMarkers, WheelchairMarkers, RouteFlags,
                      PlaceInfoCard, SensoryDetailPanel, TimeSlider,
                      UserLocationLayer, PlaceSearchBox
  venue/              SensoryBars, ReviewFeed, NoiseHistory, QuickUpdate,
                      ListenButton, NoiseContribute
  camera/             SignReader (Gemini Vision + wayfinding)
  marketing/          WorkflowCardSwap, AccessibilityCards
  brand/              SensoryMark (lockup + glyph + wordmark)
  layout/             TopAppBar, BottomNav (spotlight)
  ui/                 cinematic-landing-hero, masked-slide-reveal, Typewriter,
                      UserDropdown, Icon
  BootSplash, GridBackground, HapticWatcher, ServiceWorkerRegister,
  PreferencesProvider, ShareJourneyButton
lib/                  mongodb, gemini, elevenlabs, google-places, route-scoring,
                      time-aware, preferences, audio, encryption, osm, identity,
                      haptic, journal, utils
scripts/              init-indexes, seed-venues, seed-usf-tampa, extract-sensory,
                      seed-alerts, seed-reviews, push-vercel-env
elevenlabs/           voice-agent knowledge base, system prompt, 8 test cases
types/                shared TypeScript types
```

## Privacy & security

- Voice IDs are AES-256-GCM field-encrypted before storage; the agent token is per-device anonymous client ID via `X-Sensory-Client-Id`.
- Reviews use anonymous contributor IDs derived from a salted hash of `user_id + venue_id`.
- Phone microphone audio is processed entirely on-device - only the computed dB number is uploaded.
- `DELETE /api/voice/clone` cascades across MongoDB; an ElevenLabs-side delete is on the post-hackathon hardening list.
- Trip Journal is **local-only** (`localStorage`) - past walks never leave the device.

## Demo data

`npm run seed:usf` plants **148 venues** across:
- All of USF Tampa campus (libraries, dining, dorms, gyms, academic buildings, stadiums, gardens)
- Temple Terrace + New Tampa (3 – 6 mi NE)
- Carrollwood (5 – 7 mi W)
- Westshore + Tampa International Airport (8 – 10 mi W)
- Downtown Tampa (Riverwalk, Channelside, Amalie, Tampa Theatre)
- Hyde Park / Bayshore / Ybor City (8 – 10 mi S)
- Brandon (10 mi E)
- Davis Islands + University of Tampa
- Lutz / Wesley Chapel outliers (10 mi N)

Each venue is upserted with a profile-driven sensory baseline, 3 – 6 mock reviews dated within the last 5 days, and 24 hourly noise samples in the time-series collection.

## Powered by

- **MongoDB Atlas** - geospatial + time-series storage for venues, reviews, alerts, noise samples, and group sessions.
- **Google Maps JavaScript API + Routes API + Places API** - base map, place data, alternative routing, transit accessibility, autocomplete.
- **Gemini 2.5 Flash** - sensory dimension extraction from reviews; vision-based sign reading + place-name detection.
- **ElevenLabs** - Conversational AI agent + Instant Voice Clone + multilingual TTS for the comfort-voice feature.
- **OpenStreetMap Overpass** - wheelchair access nodes and street-lamp density.
- **Vercel** - hosting + deploy preview previews.
