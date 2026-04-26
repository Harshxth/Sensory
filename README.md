# Sensory

> The map for how a place *feels* — built for autistic, sensory-sensitive, wheelchair, deaf, blind, and ESL communities the world wasn't designed for.

Sensory layers real-time accessibility data on top of Google Maps so people with sensory or mobility needs can navigate by how a place actually feels — noise, crowd, lighting, smell, and exits — not just by ratings.

## What it does

- **Sensory heatmaps** — three differentiated palettes show noise (thermal), crowd (population density), and lighting (sunlight) on top of Google Maps.
- **Tap any place** — open a Google-Maps-style info card with rating, hours, photos, plus a sensory chip. Tap "More" for the full sensory profile.
- **Profile-aware navigation** — when you ask for directions, Sensory ranks alternative routes against your accessibility profile and picks the lowest-impact one. The route shows colored flag pins for any loud zones, crowded patches, or active alerts along the way.
- **Fullscreen turn-by-turn** — Google-Maps-style nav with disability-aware voice cues ("loud zone ahead in 100m") and your saved profile shaping each warning.
- **Confirm or correct** — every venue can be confirmed or corrected by users; submissions update the venue's sensory score in real time via a community-weighted average.
- **Camera sign reader** — point at any sign or menu, Gemini Vision extracts the text, the device speaks it aloud in your preferred language.
- **Live event alerts** — geo-bounded, time-windowed banners (e.g. "Downtown street fair, avoid 4–7 PM").
- **Time-aware** — drag a slider to see how a venue's sensory load shifts by hour and day.
- **Group mode** — share a read-only link with a caregiver to broadcast your live position and accessibility profile.
- **Haptic warnings** — phone vibrates when you approach a venue whose triggers match your profile.
- **Streetlight overlay** — OSM lamp density for night-walk planning.
- **Crowd-sourced noise** — phone microphone samples 10 seconds and uploads only the computed dB value. Audio never leaves the device.

## Tech stack

| Layer | Tool |
| --- | --- |
| Frontend | Next.js 16, TypeScript, Tailwind v4 |
| Map | Google Maps JavaScript API + Routes API |
| DB | MongoDB Atlas (geospatial 2dsphere + time-series) |
| AI — text | Gemini 2.5 (sensory dimension extraction + sign-reading vision) |
| AI — voice | ElevenLabs Instant Voice Clone + multilingual TTS |
| Sensors | Web Audio API, Geolocation API, Vibration API, Web Speech API |

## Local setup

```bash
npm install
cp .env.local.example .env.local
# fill in keys for MongoDB, Google Maps, Google Places, Gemini, ElevenLabs.
# generate FIELD_ENCRYPTION_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm run db:init          # create indexes + time-series collection
npm run seed:venues      # fetch ~30 venues from Google Places
npm run extract:sensory  # batch-call Gemini → sensory dimensions
npm run seed:reviews
npm run seed:alerts

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  (marketing)/        landing
  map/                main map experience
  onboarding/         4-step accessibility profile setup
  settings/           preferences + group mode share link
  venue/[id]/         dedicated venue detail
  share/[token]/      caregiver read-only view
  api/                venues, reviews, noise, alerts, places, vision, share
components/
  google/             GoogleMap, NoiseHeatmap, CrowdHeatmap, LightHeatmap,
                      DirectionsLayer, NavigationOverlay, StreetlightHeatmap,
                      VenueMarkers, AlertMarkers, WheelchairMarkers, RouteFlags,
                      PlaceInfoCard, SensoryDetailPanel, TimeSlider
  venue/              SensoryBars, ReviewFeed, NoiseHistory, QuickUpdate,
                      ListenButton, NoiseContribute
  camera/             SignReader (Gemini Vision)
  layout/             TopAppBar, BottomNav
lib/                  mongodb, gemini, elevenlabs, google-places, route-scoring,
                      time-aware, preferences, audio, encryption, osm
scripts/              init-indexes, seed-venues, extract-sensory, seed-alerts,
                      seed-reviews
types/                shared TypeScript types
```

## Privacy & security

- Voice IDs are AES-256-GCM field-encrypted before storage.
- Reviews use anonymous contributor IDs derived from a salted hash of `user_id + venue_id`.
- Phone microphone audio is processed entirely on-device — only the computed dB number is uploaded.
- Single endpoint cascades a delete across MongoDB and ElevenLabs.

## Powered by

- **MongoDB Atlas** — geospatial + time-series storage for venues, reviews, alerts, noise samples, and group sessions.
- **Google Maps JavaScript API + Routes API** — base map, place data, alternative routing, transit accessibility.
- **Gemini 2.5** — sensory dimension extraction from reviews; vision-based sign reading.
- **ElevenLabs** — Instant Voice Clone + multilingual TTS for the comfort-voice feature.
- **OpenStreetMap Overpass** — wheelchair access nodes and street-lamp density.
