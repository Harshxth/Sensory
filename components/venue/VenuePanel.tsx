"use client";

// F1.3 — bottom sheet (mobile) / side panel (desktop) with sensory bars + reviews + listen.
import type { Venue } from "@/types";
import { SensoryBars } from "./SensoryBars";
import { ReviewFeed } from "./ReviewFeed";
import { NoiseHistory } from "./NoiseHistory";
import { ListenButton } from "./ListenButton";

export function VenuePanel({ venue }: { venue: Venue | null }) {
  if (!venue) return null;
  return (
    <aside className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-background/95 p-4 shadow-2xl backdrop-blur sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-2xl">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">{venue.name}</h2>
        <p className="text-sm text-muted-foreground">{venue.summary}</p>
      </header>
      <SensoryBars dimensions={venue.sensory} />
      <ListenButton text={venue.summary} />
      <NoiseHistory venueId={venue._id} />
      <ReviewFeed venueId={venue._id} />
    </aside>
  );
}
