"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Venue } from "@/types";
import type { GooglePlaceDetails } from "@/lib/google-places";
import { formatTypes } from "@/lib/google-places";
import { Icon } from "@/components/ui/Icon";
import { SensoryBars } from "./SensoryBars";
import { ListenButton } from "./ListenButton";
import { NoiseHistory } from "./NoiseHistory";
import { ReviewFeed } from "./ReviewFeed";
import { QuickUpdate } from "./QuickUpdate";

type Props = {
  venue: Venue | null;
  google?: GooglePlaceDetails | null;
  onClose: () => void;
  onDirections?: () => void;
  onUpdated?: () => void;
  /** Called after the user creates a venue from a Google place - receives the new venue ID. */
  onVenueCreated?: (venueId: string) => void;
};

export function VenuePanel({
  venue,
  google,
  onClose,
  onDirections,
  onUpdated,
  onVenueCreated,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

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

  useEffect(() => {
    if (!venue && !google) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [venue, google, onClose]);

  if (!venue && !google) return null;

  // Resolve display values from whichever source we have.
  const name = google?.name ?? venue?.name ?? "";
  const address = google?.formatted_address ?? google?.vicinity ?? venue?.address ?? "";
  const category = formatTypes(google?.types) || (venue?.category?.replace(/_/g, " ") ?? "");
  const rating = google?.rating;
  const reviewCount = google?.user_ratings_total;
  const openNow = google?.opening_hours?.open_now ?? google?.current_opening_hours?.open_now;
  const weekdayHours =
    google?.current_opening_hours?.weekday_text ?? google?.opening_hours?.weekday_text;
  const phone = google?.formatted_phone_number;
  const website = google?.website;
  const googleMapsUrl = google?.url;
  const venueId = venue?._id ? String(venue._id) : null;

  const composite = venue?.sensory?.composite ?? null;
  const tone =
    composite == null
      ? null
      : composite <= 3
        ? { label: "Calm", className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" }
        : composite <= 6
          ? { label: "Moderate", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" }
          : { label: "Intense", className: "bg-orange-500/15 text-orange-300 border-orange-500/30" };

  return (
    <>
      <button
        aria-label="Close venue details"
        onClick={onClose}
        className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${name}`}
        className="fixed z-50 border border-on-surface/10 shadow-2xl bg-surface-container-lowest text-on-surface
                   md:right-4 md:top-20 md:bottom-4 md:w-[440px] md:rounded-2xl
                   bottom-0 left-0 right-0 max-h-[88vh] rounded-t-3xl
                   flex flex-col overflow-hidden"
      >
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <span className="w-10 h-1.5 rounded-full bg-on-surface/25" />
        </div>

        <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-on-surface/10">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {tone && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tone.className}`}
                >
                  {tone.label}
                </span>
              )}
              {category && (
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant capitalize">
                  {category}
                </span>
              )}
              {openNow != null && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    openNow ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {openNow ? "Open" : "Closed"}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold leading-tight truncate">{name}</h2>
            {address && (
              <p className="text-xs text-on-surface-variant truncate flex items-center gap-1 mt-0.5">
                <Icon name="location_on" size={12} /> {address}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-on-surface/8 text-on-surface-variant transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-on-surface">
          {/* Top stats row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {rating != null ? (
              <Stat label="Rating">
                <span className="flex items-center gap-1 text-amber-300">
                  <Icon name="star" filled size={16} />
                  <span className="font-bold">{rating.toFixed(1)}</span>
                </span>
                {reviewCount != null && (
                  <span className="text-[10px] text-on-surface-variant">({reviewCount.toLocaleString()})</span>
                )}
              </Stat>
            ) : (
              <Stat label="Rating">
                <span className="text-on-surface-variant text-sm">-</span>
              </Stat>
            )}
            <Stat label="Sensory">
              {composite != null ? (
                <span className="font-bold">{composite.toFixed(1)}</span>
              ) : (
                <span className="text-on-surface-variant text-sm">No data</span>
              )}
            </Stat>
            <Stat label="Wheelchair">
              <span className="font-semibold capitalize">
                {venue?.osm_tags?.wheelchair ?? "?"}
              </span>
            </Stat>
          </div>

          {/* Google-Maps-style circular action row */}
          <div className="grid grid-cols-4 gap-2">
            <PanelAction
              icon="directions"
              label="Directions"
              onClick={onDirections}
              primary
              disabled={!onDirections}
            />
            {website ? (
              <PanelAction icon="language" label="Website" href={website} external />
            ) : googleMapsUrl ? (
              <PanelAction icon="open_in_new" label="Google" href={googleMapsUrl} external />
            ) : (
              <PanelAction icon="bookmark_border" label="Save" />
            )}
            {phone ? (
              <PanelAction icon="call" label="Call" href={`tel:${phone}`} />
            ) : (
              <PanelAction icon="share" label="Share" />
            )}
            {venueId ? (
              <PanelAction icon="open_in_full" label="Full" href={`/venue/${venueId}`} />
            ) : (
              <PanelAction icon="more_horiz" label="More" />
            )}
          </div>

          {venue?.summary && <ListenButton text={venue.summary} />}

          {/* Hours */}
          {weekdayHours && weekdayHours.length > 0 && (
            <details className="bg-on-surface/5 rounded-xl">
              <summary className="px-3 py-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-on-surface-variant select-none flex items-center gap-2">
                <Icon name="schedule" size={14} /> Hours
              </summary>
              <ul className="px-4 pb-3 space-y-0.5 text-xs text-on-surface">
                {weekdayHours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          )}

          {/* Sensory profile (only when we have data) */}
          {venue?.sensory && (
            <>
              {venue.summary && (
                <p className="text-sm leading-relaxed text-on-surface bg-on-surface/5 rounded-xl p-3">
                  {venue.summary}
                </p>
              )}
              <SensoryBars dimensions={venue.sensory} />
            </>
          )}

          {/* No-data prompt for Google-only places - actionable */}
          {!venue && google && (
            <div className="bg-primary/15 border border-primary/30 rounded-xl p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                  <Icon name="add_circle" filled size={18} />
                  Be the first to score this venue
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Sensory hasn&apos;t mapped this place yet. Share what it&apos;s like -
                  your input creates the sensory profile other people rely on.
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

          {/* Live noise history (only for our scored venues) */}
          {venueId && venue?.sensory && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                24-hour noise
              </h3>
              <NoiseHistory venueId={venueId} />
            </section>
          )}

          {/* Quick update - confirm/correct cascades to a real-time refresh */}
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
          {!venueId && google && (
            <section>
              <p className="text-[11px] text-on-surface-variant">
                Posting reviews for unmapped places needs a sign-in. Coming next.
              </p>
            </section>
          )}

          {/* Reviews feed (only for scored venues) */}
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
    </>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-on-surface/5 rounded-xl py-2 px-1 flex flex-col items-center justify-center min-h-[58px]">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">{label}</div>
      <div className="text-base mt-0.5">{children}</div>
    </div>
  );
}

function PanelAction({
  icon,
  label,
  onClick,
  href,
  external,
  primary,
  disabled,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  primary?: boolean;
  disabled?: boolean;
}) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-1 py-1">
      <span
        className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${
          primary
            ? "bg-primary text-on-primary shadow-md shadow-primary/30"
            : "bg-on-surface/8 text-on-surface"
        } ${disabled ? "opacity-40" : "hover:bg-on-surface/12"}`}
      >
        <Icon name={icon} filled={primary} size={20} />
      </span>
      <span className="text-[11px] font-bold text-on-surface">{label}</span>
    </div>
  );
  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="block"
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="block disabled:cursor-not-allowed"
    >
      {inner}
    </button>
  );
}
