"use client";

// F1.10 - recharts sparkline of 24h hourly avg dB from time-series collection.
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

type Bucket = { _id: string; avg_db: number; n: number };

export function NoiseHistory({ venueId }: { venueId: string }) {
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  useEffect(() => {
    fetch(`/api/venues/${venueId}/noise/history`)
      .then((r) => r.json())
      .then((d) => setBuckets(d.buckets ?? []))
      .catch(() => setBuckets([]));
  }, [venueId]);

  if (buckets.length === 0) {
    return <p className="text-xs text-muted-foreground">No noise samples in the last 24h.</p>;
  }

  return (
    <div className="my-3 h-16">
      <ResponsiveContainer>
        <LineChart data={buckets}>
          <YAxis hide domain={[0, 100]} />
          <Line type="monotone" dataKey="avg_db" stroke="currentColor" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
