"use client";

// F1.3 - five horizontal bars (noise/lighting/crowd/smell/exits) 0–10.
import type { SensoryDimensions } from "@/types";

const ROWS: { key: keyof Omit<SensoryDimensions, "composite">; label: string }[] = [
  { key: "noise", label: "Noise" },
  { key: "lighting", label: "Lighting" },
  { key: "crowd", label: "Crowd" },
  { key: "smell", label: "Smell" },
  { key: "exits", label: "Exits" },
];

export function SensoryBars({ dimensions }: { dimensions: SensoryDimensions }) {
  return (
    <div className="my-4 space-y-2">
      {ROWS.map(({ key, label }) => {
        const value = dimensions[key];
        const pct = Math.max(0, Math.min(10, value)) * 10;
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-baseline justify-between text-xs">
              <span>{label}</span>
              <span className="tabular-nums text-muted-foreground">{value.toFixed(1)}</span>
            </div>
            <div className="h-2 rounded-full bg-foreground/10">
              <div
                className="h-2 rounded-full bg-foreground/70"
                style={{ width: `${pct}%` }}
                aria-label={`${label} ${value} of 10`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
