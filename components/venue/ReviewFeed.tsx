"use client";

// F1.7 — scrollable list of reviews with formatDistanceToNow timestamps.
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@/types";

export function ReviewFeed({ venueId }: { venueId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch(`/api/venues/${venueId}/reviews`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setReviews([]));
  }, [venueId]);

  if (reviews.length === 0) {
    return <p className="text-xs text-muted-foreground">No reviews yet.</p>;
  }

  return (
    <ul className="my-3 space-y-2">
      {reviews.map((r) => (
        <li key={r._id} className="rounded-lg bg-foreground/5 p-2 text-sm">
          <p>{r.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(r.timestamp), { addSuffix: true })}
          </p>
        </li>
      ))}
    </ul>
  );
}
