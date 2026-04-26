"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SensoryBars } from "@/components/venue/SensoryBars";
import { ListenButton } from "@/components/venue/ListenButton";
import { NoiseHistory } from "@/components/venue/NoiseHistory";
import { ReviewFeed } from "@/components/venue/ReviewFeed";
import { QuickUpdate } from "@/components/venue/QuickUpdate";
import type { Venue } from "@/types";
import type { GooglePlaceDetails } from "@/lib/google-places";

type Props = {
  venue: Venue | null;
  google?: GooglePlaceDetails | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  onVenueCreated?: (venueId: string) => void;
};

/**
 * The detailed sensory panel that slides in alongside the PlaceInfoCard.
 * Has the deep sensory data: bars, listen button, noise history, quick
 * confirm/correct, recent reviews. For unmapped Google places, shows the
 * "Score this venue" CTA that creates a venue from the Google place.
 */
export function SensoryDetailPanel({
  venue,
  google,
  open,
  onClose,
  onUpdated,
  onVenueCreated,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (!venue && !google) return null;

  const venueId = venue?._id ? String(venue._id) : null;

  const createVenueFromGoogle = async () => {
    if (!google || !google.geometry?.location) return;
    setCreating(true);
    try {
      const res = await fetch("/api/venues/from-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_place_id: google.place_id,
          name: google.name,
          address: google.formatted_address ?? google.vicinity ?? "",
          lat: google.geometry.location.lat,
          lng: google.geometry.location.lng,
          types: google.types,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { id: string };
      onVenueCreated?.(data.id);
    } catch {
      alert("Couldn't create the venue. Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label={`Sensory details for ${venue?.name ?? google?.name ?? ""}`}
      className="fixed z-40 bg-surface-container-lowest text-on-surface border border-on-surface/10 shadow-2xl
                 md:left-[392px] md:top-20 md:bottom-4 md:w-[380px] md:rounded-2xl
                 inset-0 md:inset-auto rounded-none md:rounded-2xl
                 flex flex-col overflow-hidden"
    >
      <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-on-surface/10">
        <div className="flex items-center gap-2">
          <Icon name="analytics" filled size={20} className="text-primary" />
          <h2 className="text-base font-bold">Sensory profile</h2>
        </div>
        <button
          type="button"
          aria-label="Close detail panel"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-on-surface/8 text-on-surface-variant"
        >
          <Icon name="close" size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {venue?.summary && (
          <p className="text-sm leading-relaxed text-on-surface bg-on-surface/5 rounded-xl p-3">
            {venue.summary}
          </p>
        )}

        {venue?.sensory ? (
          <>
            <SensoryBars dimensions={venue.sensory} />
            {venueId && (
              <div className="flex flex-wrap gap-2">
                <ListenButton text={venue.summary || venue.name} />
              </div>
            )}
            {venueId && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  24-hour noise
                </h3>
                <NoiseHistory venueId={venueId} />
              </section>
            )}
          </>
        ) : (
          <div className="bg-primary/15 border border-primary/30 rounded-xl p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                <Icon name="add_circle" filled size={18} />
                Be the first to score this venue
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sensory hasn&apos;t mapped this place yet. Share what it&apos;s like — your input
                creates the sensory profile other people rely on.
              </p>
            </div>
            <button
              type="button"
              onClick={createVenueFromGoogle}
              disabled={creating}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-primary text-on-primary text-sm font-bold hover:bg-primary-dim disabled:opacity-50 transition-colors shadow-sm"
            >
              {creating ? (
                "Adding…"
              ) : (
                <>
                  <Icon name="bolt" filled size={16} />
                  Score this venue
                </>
              )}
            </button>
          </div>
        )}

        {venueId && (
          <section>
            <QuickUpdate
              venueId={venueId}
              predicted={venue?.sensory}
              onSubmitted={() => {
                setReviewsRefreshKey((k) => k + 1);
                onUpdated?.();
              }}
            />
          </section>
        )}

        {venueId && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Recent reviews
            </h3>
            <ReviewFeed venueId={venueId} refreshKey={reviewsRefreshKey} />
          </section>
        )}
      </div>
    </aside>
  );
}
