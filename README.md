# Sensory

> The map for how a place *feels* — built for autistic, sensory-sensitive, wheelchair, deaf, blind, and ESL communities Google Maps wasn't designed for.

Hackabull VII submission. Targets Tech For Good + UX/UI: Design of Everyday Life + Health & Wellness tracks, plus MongoDB Atlas, Gemini, and ElevenLabs sponsor prizes.

## What it does

- **Sensory heatmap** — venues scored on noise, lighting, crowd, smell, and exit accessibility (0–10), color-coded green → red.
- **Venue panel** — plain-language summary, sensory bars, live "2h ago" reviews, 24h noise sparkline.
- **Voice clone** — record 30 seconds of a comfort voice; venue summaries are read aloud in that voice in English, Spanish, or Mandarin (same warm voice across languages).
- **Wheelchair toggle** — recolors the map using OpenStreetMap accessibility tags.
- **Live event alerts** — geo-bounded, time-windowed (e.g. "Downtown street fair, avoid 4–7pm").
- **Crowd-sourced noise** — phone microphone samples 10 seconds and uploads only the computed dB value. Audio never leaves the device.

## Tech stack

| Layer | Tool |
| --- | --- |
| Frontend | Next.js 16, TypeScript, Tailwind v4, Framer Motion |
| Map | Mapbox GL JS |
| DB | MongoDB Atlas (geospatial 2dsphere + time-series + vector index) |
| Auth | Supabase (RLS) |
| AI — text | Gemini 2.5 Pro (sensory dimension extraction from reviews) |
| AI — voice | ElevenLabs Instant Voice Clone + multilingual TTS |
| Sensors | Web Audio API, Geolocation API |

## Local setup

```bash
npm install
cp .env.local.example .env.local
# fill in keys for MongoDB, Supabase, Mapbox, Google Places, Gemini, ElevenLabs.
# generate FIELD_ENCRYPTION_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm run db:init          # create indexes + time-series collection
npm run seed:venues      # fetch 30 Tampa venues from Google Places
npm run extract:sensory  # batch-call Gemini → sensory dimensions
npm run seed:reviews
npm run seed:alerts

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  (marketing)/        landing + onboarding
  map/                main app
  api/                venues, reviews, noise, alerts, voice, wheelchair
components/
  map/                MapView, HeatmapLayer, WheelchairLayer, AlertPulse
  venue/              VenuePanel, SensoryBars, ReviewFeed, NoiseHistory, NoiseContribute, ListenButton
  voice/              VoiceCloneRecorder, LanguageToggle
lib/                  mongodb, supabase, elevenlabs, gemini, osm, audio, encryption
scripts/              init-indexes, seed-venues, extract-sensory, seed-alerts, seed-reviews
types/                shared TypeScript types
```

## Privacy & security

- Voice IDs are AES-256-GCM field-encrypted before storage.
- Reviews use anonymous contributor IDs derived from a salted hash of `user_id + venue_id`.
- Phone microphone audio is processed entirely on-device — only the computed dB number is uploaded.
- Single endpoint cascades a delete across MongoDB, Supabase, and ElevenLabs.

## AI usage disclosure (per Hackabull rules)

- Cursor and Claude Code were used as coding assistants during the hackathon.
- Gemini 2.5 Pro extracts sensory dimensions from existing public reviews — used at seed time, cached in MongoDB.
- ElevenLabs Instant Voice Clone + multilingual TTS power the voice agent.
- All product copy, architecture decisions, and demo script were authored by the team.
