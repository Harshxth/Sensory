"use client";

import { Icon } from "@/components/ui/Icon";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export type TimeKey = {
  day: (typeof DAY_KEYS)[number];
  hour: number; // 0..23
};

type Props = {
  value: TimeKey;
  onChange: (next: TimeKey) => void;
  onReset?: () => void;
  isLive: boolean;
};

/**
 * Floating time slider that lets the user scrub through days/hours and see
 * how venue sensory load changes ("this venue at 8pm Tuesday").
 */
export function TimeSlider({ value, onChange, onReset, isLive }: Props) {
  const dayIdx = DAY_KEYS.indexOf(value.day);

  const formatHour = (h: number) => {
    const period = h < 12 ? "AM" : "PM";
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ${period}`;
  };

  return (
    <div className="absolute top-36 md:top-40 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-lg border border-on-surface/8 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
            <Icon name="schedule" size={14} className="text-primary" />
            {isLive ? "Now" : `${DAY_LABELS[dayIdx]} · ${formatHour(value.hour)}`}
          </div>
          {!isLive && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Back to now
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
          {DAY_KEYS.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ ...value, day: d })}
              className={`px-2 py-1 rounded-full text-[11px] font-bold flex-shrink-0 transition-colors ${
                value.day === d
                  ? "bg-primary text-on-primary"
                  : "bg-on-surface/8 text-on-surface-variant hover:bg-on-surface/12"
              }`}
            >
              {DAY_LABELS[i]}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={23}
          value={value.hour}
          onChange={(e) => onChange({ ...value, hour: parseInt(e.target.value, 10) })}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-on-surface/8"
          aria-label="Hour of day"
        />
        <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </div>
    </div>
  );
}
