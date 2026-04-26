"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatTypes } from "@/lib/google-places";
import type { GooglePlaceDetails } from "@/lib/google-places";
import type { Venue } from "@/types";

type Props = {
  venue: Venue | null;
  google?: GooglePlaceDetails | null;
  onMore: () => void;
  onDirections?: () => void;
  onClose: () => void;
};

/**
 * Lightweight Google-Maps-style mini card. Always shows Google's place data
 * with a small sensory chip overlay. Does NOT contain detailed sensory bars
 * or reviews — those live in SensoryDetailPanel which slides in beside this
 * card when the user clicks "More".
 */
export function PlaceInfoCard({ venue, google, onMore, onDirections, onClose }: Props) {
  if (!venue && !google) return null;

  const name = google?.name ?? venue?.name ?? "";
  const address = google?.formatted_address ?? google?.vicinity ?? venue?.address ?? "";
  const category = formatTypes(google?.types) || (venue?.category?.replace(/_/g, " ") ?? "");
  const rating = google?.rating;
  const reviewCount = google?.user_ratings_total;
  const openNow = google?.opening_hours?.open_now ?? google?.current_opening_hours?.open_now;
  const phone = google?.formatted_phone_number;
  const website = google?.website;
  const googleMapsUrl = google?.url;

  const composite = venue?.sensory?.composite ?? null;
  const sensoryChip =
    composite == null
      ? { label: "No sensory data yet", className: "bg-on-surface/8 text-on-surface-variant", swatch: "#9ca3af" }
      : composite <= 3
        ? { label: `Calm · ${composite.toFixed(1)}`, className: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300", swatch: "#06b6d4" }
        : composite <= 6
          ? { label: `Moderate · ${composite.toFixed(1)}`, className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", swatch: "#f59e0b" }
          : { label: `Intense · ${composite.toFixed(1)}`, className: "bg-orange-500/15 text-orange-700 dark:text-orange-300", swatch: "#ea580c" };

  return (
    <aside
      role="dialog"
      aria-label={`Place card for ${name}`}
      className="fixed z-40 bg-surface-container-lowest text-on-surface border border-on-surface/10 shadow-2xl
                 md:left-4 md:top-20 md:bottom-auto md:w-[360px] md:rounded-2xl md:max-h-[calc(100vh-6rem)]
                 bottom-20 left-0 right-0 rounded-t-3xl max-h-[72vh]
                 flex flex-col overflow-hidden"
    >
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <span className="w-10 h-1.5 rounded-full bg-on-surface/25" />
      </div>

      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {category && (
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant capitalize">
                {category}
              </span>
            )}
            {openNow != null && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  openNow
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                }`}
              >
                {openNow ? "Open" : "Closed"}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold leading-tight truncate">{name}</h2>
          {rating != null && (
            <div className="flex items-center gap-1.5 mt-1 text-sm">
              <Icon name="star" filled size={16} className="text-amber-500" />
              <span className="font-bold tabular-nums">{rating.toFixed(1)}</span>
              {reviewCount != null && (
                <span className="text-on-surface-variant text-xs">
                  ({reviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}
          {address && (
            <p className="text-xs text-on-surface-variant truncate flex items-center gap-1 mt-1">
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

      {/* Sensory chip — the headline sensory insight */}
      <div className="px-5 pb-3">
        <button
          type="button"
          onClick={onMore}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-on-surface/10 hover:border-on-surface/20 transition-colors ${sensoryChip.className}`}
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: sensoryChip.swatch, boxShadow: `0 0 8px ${sensoryChip.swatch}66` }}
            />
            {sensoryChip.label}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider opacity-80">
            More
            <Icon name="arrow_forward" size={14} />
          </span>
        </button>
      </div>

      {/* Action row — Google-Maps-style circular icons */}
      <div className="grid grid-cols-4 gap-1 px-5 pb-4">
        <Action icon="directions" label="Directions" onClick={onDirections} primary disabled={!onDirections} />
        {website ? (
          <Action icon="language" label="Website" href={website} external />
        ) : googleMapsUrl ? (
          <Action icon="open_in_new" label="Google" href={googleMapsUrl} external />
        ) : (
          <Action icon="bookmark_border" label="Save" />
        )}
        {phone ? (
          <Action icon="call" label="Call" href={`tel:${phone}`} />
        ) : (
          <Action icon="share" label="Share" />
        )}
        {venue?._id ? (
          <Link
            href={`/venue/${String(venue._id)}`}
            className="flex flex-col items-center justify-center gap-1 py-1"
          >
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-on-surface/8 text-on-surface hover:bg-on-surface/12 transition-colors">
              <Icon name="open_in_full" size={20} />
            </span>
            <span className="text-[11px] font-bold text-on-surface">Full</span>
          </Link>
        ) : (
          <Action icon="more_horiz" label="More" />
        )}
      </div>
    </aside>
  );
}

function Action({
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
            ? "bg-primary text-on-primary shadow-md shadow-primary/30 hover:bg-primary-dim"
            : "bg-on-surface/8 text-on-surface hover:bg-on-surface/12"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <Icon name={icon} filled={primary} size={20} />
      </span>
      <span className="text-[11px] font-bold text-on-surface">{label}</span>
    </div>
  );
  if (href) {
    return (
      <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="block disabled:cursor-not-allowed">
      {inner}
    </button>
  );
}
