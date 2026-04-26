"use client";

import { Icon } from "@/components/ui/Icon";

type Visible = {
  noise: boolean;
  crowd: boolean;
  light: boolean;
};

type Props = {
  visible: Visible;
};

const ROWS: {
  key: keyof Visible;
  label: string;
  icon: string;
  gradient: string;
  low: string;
  high: string;
}[] = [
  {
    key: "noise",
    label: "Noise",
    icon: "graphic_eq",
    gradient:
      "linear-gradient(90deg, #22c55e 0%, #fde047 30%, #f59e0b 55%, #ef4444 80%, #701a75 100%)",
    low: "Quiet",
    high: "Loud",
  },
  {
    key: "crowd",
    label: "Crowd",
    icon: "groups",
    gradient:
      "linear-gradient(90deg, #bae6fd 0%, #38bdf8 30%, #6366f1 55%, #a855f7 80%, #701a75 100%)",
    low: "Sparse",
    high: "Packed",
  },
  {
    key: "light",
    label: "Light",
    icon: "lightbulb",
    gradient:
      "linear-gradient(90deg, #fef9c3 0%, #fde047 35%, #eab308 65%, #a16207 100%)",
    low: "Soft",
    high: "Harsh",
  },
];

export function HeatmapLegend({ visible }: Props) {
  const activeRows = ROWS.filter((r) => visible[r.key]);
  if (activeRows.length === 0) return null;

  return (
    <div
      className="hidden md:flex absolute bottom-6 left-6 z-30 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-xl border border-on-surface/10 flex-col gap-3 bg-surface-container-lowest/95 text-on-surface"
      style={{ minWidth: "240px" }}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        Sensory layers
      </div>
      <div className="flex flex-col gap-2.5">
        {activeRows.map((r) => (
          <div key={r.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="flex items-center gap-1.5 font-bold">
                <Icon name={r.icon} filled size={13} />
                {r.label}
              </span>
              <span className="text-on-surface-variant text-[10px]">
                {r.low} → {r.high}
              </span>
            </div>
            <div
              className="h-2 rounded-full border border-on-surface/10"
              style={{ background: r.gradient }}
              aria-label={`${r.label} intensity gradient: ${r.low} to ${r.high}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
