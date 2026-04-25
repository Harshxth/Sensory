"use client";

// F1.9 — 10s capture using lib/audio.ts, posts only the average dB.
import { useState } from "react";
import { startDbCapture } from "@/lib/audio";

export function NoiseContribute({ venueId }: { venueId: string }) {
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState<number | null>(null);

  async function go() {
    setRunning(true);
    try {
      const { avgDb } = await startDbCapture(10_000, (s) => setLive(s.db));
      await fetch(`/api/venues/${venueId}/noise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ db_level: avgDb }),
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={running}
      className="rounded-full border border-foreground/20 px-3 py-1 text-xs disabled:opacity-50"
    >
      {running ? `Listening… ${live?.toFixed(0) ?? ""} dB` : "Contribute noise reading"}
    </button>
  );
}
