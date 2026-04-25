"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Venue } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { SensoryBars } from "./SensoryBars";
import { ListenButton } from "./ListenButton";
import { NoiseHistory } from "./NoiseHistory";
import { ReviewFeed } from "./ReviewFeed";

type Props = {
  venue: Venue | null;
  onClose: () => void;
};

/**
 * Bottom sheet on mobile, right side panel on desktop.
 * Uses ESC + backdrop click to close. Body scroll lock on mobile when open.
 */
export function VenuePanel({ venue, onClose }: Props) {
  useEffect(() => {
    if (!venue) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [venue, onClose]);

  if (!venue) return null;

  const composite = venue.sensory?.composite ?? 5;
  const tone =
    composite <= 3
      ? { label: "Calm", className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" }
      : composite <= 6
        ? { label: "Moderate", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" }
        : { label: "Intense", className: "bg-orange-500/15 text-orange-300 border-orange-500/30" };

  return (
    <>
      {/* Backdrop — only on mobile, click to close */}
      <button
        aria-label="Close venue details"
        onClick={onClose}
        className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Venue details for ${venue.name}`}
        className="fixed z-50 bg-on-background text-background border border-white/10 shadow-2xl
                   md:right-4 md:top-20 md:bottom-4 md:w-[420px] md:rounded-2xl
                   bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl
                   flex flex-col overflow-hidden"
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <span className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>

        <header className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tone.className}`}
              >
                {tone.label}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/50 capitalize">
                {venue.category.replace(/_/g, " ")}
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight truncate">{venue.name}</h2>
            <p className="text-xs text-white/50 truncate flex items-center gap-1 mt-0.5">
              <Icon name="location_on" size={12} /> {venue.address || "—"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-white/90">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Composite" value={composite.toFixed(1)} />
            <Stat
              label="Wheelchair"
              value={venue.osm_tags?.wheelchair ?? "—"}
              capitalize
            />
            <Stat label="Best Time" value="9-11 AM" />
          </div>

          {venue.summary && (
            <p className="text-sm leading-relaxed text-white/80 bg-white/5 rounded-xl p-3">
              {venue.summary}
            </p>
          )}

          <SensoryBars dimensions={venue.sensory} />

          <div className="flex flex-wrap gap-2">
            <ListenButton text={venue.summary || venue.name} />
            <Link
              href={`/venue/${venue._id}`}
              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white transition-colors"
            >
              Full details <Icon name="arrow_forward" size={14} />
            </Link>
          </div>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
              24-hour noise
            </h3>
            <NoiseHistory venueId={String(venue._id)} />
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
              Recent reviews
            </h3>
            <ReviewFeed venueId={String(venue._id)} />
          </section>
        </div>
      </aside>
    </>
  );
}

function Stat({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string | number;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-white/5 rounded-xl py-2 px-1">
      <div className="text-[10px] uppercase tracking-wider text-white/50 font-bold">{label}</div>
      <div className={`text-base font-bold mt-0.5 ${capitalize ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}
