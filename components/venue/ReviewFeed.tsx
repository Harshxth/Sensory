"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@/types";

type Props = {
  venueId: string;
  /** Bump this number to force a refetch (e.g. after a new submission). */
  refreshKey?: number;
};

export function ReviewFeed({ venueId, refreshKey = 0 }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch(`/api/venues/${venueId}/reviews`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]));
  }, [venueId, refreshKey]);

  if (reviews.length === 0) {
    return <p className="text-xs text-on-surface-variant">No reviews yet.</p>;
  }

  return (
    <ul className="my-2 space-y-2">
      {reviews.map((r) => (
        <li key={r._id} className="rounded-lg bg-on-surface/5 p-2.5 text-sm">
          <p className="text-on-surface leading-snug">{r.text}</p>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            {formatDistanceToNow(new Date(r.timestamp), { addSuffix: true })}
          </p>
        </li>
      ))}
    </ul>
  );
}
