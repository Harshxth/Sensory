"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { SensoryDimensions } from "@/types";

const HAZARD_TAGS = [
  { id: "construction", label: "Construction", icon: "construction" },
  { id: "music", label: "Loud music", icon: "music_note" },
  { id: "smoke", label: "Smoke / vape", icon: "smoking_rooms" },
  { id: "scent", label: "Strong scent", icon: "spa" },
  { id: "strobe", label: "Strobe / flashing", icon: "flare" },
  { id: "queue", label: "Long line", icon: "groups" },
];

type Dim = "noise" | "lighting" | "crowd";

const DIM_META: Record<Dim, { label: string; lowerIcon: string; higherIcon: string }> = {
  noise: { label: "Noise", lowerIcon: "volume_down", higherIcon: "volume_up" },
  lighting: { label: "Lighting", lowerIcon: "brightness_low", higherIcon: "brightness_high" },
  crowd: { label: "Crowd", lowerIcon: "person", higherIcon: "groups" },
};

function summarize(d: SensoryDimensions | undefined): string {
  if (!d) return "this venue is calm and accessible";
  const parts: string[] = [];
  parts.push(d.noise <= 3 ? "quiet" : d.noise <= 6 ? "moderate noise" : "loud");
  parts.push(d.lighting <= 3 ? "dim" : d.lighting <= 6 ? "soft lighting" : "bright lighting");
  parts.push(d.crowd <= 3 ? "uncrowded" : d.crowd <= 6 ? "lively" : "packed");
  return parts.join(", ");
}

type Props = {
  venueId: string;
  predicted?: SensoryDimensions;
  onSubmitted?: () => void;
};

type Stage = "ask" | "correct" | "thanks";

export function QuickUpdate({ venueId, predicted, onSubmitted }: Props) {
  const [stage, setStage] = useState<Stage>("ask");
  const [submitting, setSubmitting] = useState(false);

  // Per-dimension correction: "ok" = matches, "lower" or "higher" = correction
  const [corrections, setCorrections] = useState<Partial<Record<Dim, "lower" | "higher">>>({});
  const [hazards, setHazards] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const recogRef = useRef<unknown>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    setStage("ask");
  }, [venueId]);

  const toggleHazard = (id: string) => {
    setHazards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setDim = (dim: Dim, dir: "lower" | "higher") => {
    setCorrections((prev) => ({
      ...prev,
      [dim]: prev[dim] === dir ? undefined : dir,
    }));
  };

  const post = async (text: string, sensory_tags: Record<Dim, number | null>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/venues/${venueId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sensory_tags }),
      });
      if (!res.ok) throw new Error(String(res.status));
      onSubmitted?.();
      setStage("thanks");
      setTimeout(() => {
        setStage("ask");
        setCorrections({});
        setHazards(new Set());
        setNote("");
      }, 1600);
    } catch {
      alert("Couldn't post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirm = async () => {
    const text = `Confirmed conditions match — ${summarize(predicted)}.`;
    const tags: Record<Dim, number | null> = {
      noise: predicted?.noise ?? null,
      lighting: predicted?.lighting ?? null,
      crowd: predicted?.crowd ?? null,
    };
    await post(text, tags);
  };

  const correct = async () => {
    const adjusted: Record<Dim, number | null> = {
      noise: predicted?.noise ?? null,
      lighting: predicted?.lighting ?? null,
      crowd: predicted?.crowd ?? null,
    };
    const phrasings: string[] = [];
    (Object.entries(corrections) as [Dim, "lower" | "higher" | undefined][]).forEach(([dim, dir]) => {
      if (!dir) return;
      const base = adjusted[dim] ?? 5;
      adjusted[dim] = Math.max(0, Math.min(10, base + (dir === "higher" ? 2 : -2)));
      phrasings.push(`${DIM_META[dim].label.toLowerCase()} actually ${dir}`);
    });
    if (hazards.size) phrasings.push(`watch out for ${Array.from(hazards).join(", ")}`);
    if (note.trim()) phrasings.push(note.trim());
    const text = phrasings.length
      ? `Correction — ${phrasings.join("; ")}.`
      : `Conditions don't quite match the profile.`;
    await post(text, adjusted);
  };

  const startSpeech = () => {
    type SR = new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    };
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Speech recognition not supported here. Try Chrome on desktop.");
      return;
    }
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const transcript = Array.from({ length: e.results.length }, (_, i) =>
        e.results[i][0].transcript,
      ).join(" ");
      setNote((prev) => (prev ? `${prev} ${transcript}` : transcript).trim());
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    setListening(true);
    r.start();
  };

  const stopSpeech = () => {
    type Stoppable = { stop: () => void };
    (recogRef.current as Stoppable | null)?.stop();
    setListening(false);
  };

  if (stage === "thanks") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary-container/40 p-4 flex items-center gap-3 text-on-surface">
        <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center">
          <Icon name="check" filled size={20} />
        </div>
        <div>
          <div className="text-sm font-bold">Thanks for the update</div>
          <div className="text-xs text-on-surface-variant">
            Your input is now part of the live feed for this venue.
          </div>
        </div>
      </div>
    );
  }

  if (stage === "ask") {
    return (
      <div className="rounded-2xl border border-on-surface/10 bg-surface-container-low p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
            <Icon name="bolt" filled size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-on-surface">Does this match what you see?</div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              We say it&apos;s currently <strong className="text-on-surface">{summarize(predicted)}</strong>.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 h-11 rounded-full bg-primary text-on-primary text-sm font-bold hover:bg-primary-dim disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            <Icon name="check_circle" filled size={18} />
            Yes, accurate
          </button>
          <button
            type="button"
            onClick={() => setStage("correct")}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 h-11 rounded-full bg-surface-bright text-on-surface border border-on-surface/15 text-sm font-bold hover:bg-surface-container transition-all active:scale-95"
          >
            <Icon name="edit" size={18} />
            Not quite
          </button>
        </div>
      </div>
    );
  }

  // stage === "correct"
  return (
    <div className="rounded-2xl border border-on-surface/10 bg-surface-container-low p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Icon name="edit" size={16} className="text-primary" />
          Tell us what&apos;s different
        </h3>
        <button
          type="button"
          aria-label="Back"
          onClick={() => setStage("ask")}
          className="p-1 rounded-full hover:bg-on-surface/5 text-on-surface-variant"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {(Object.keys(DIM_META) as Dim[]).map((dim) => (
          <DimRow
            key={dim}
            dim={dim}
            value={corrections[dim]}
            onChange={(dir) => setDim(dim, dir)}
          />
        ))}
      </div>

      <Field label="Anything else to watch out for?">
        <div className="flex flex-wrap gap-2">
          {HAZARD_TAGS.map((h) => (
            <Chip
              key={h.id}
              active={hazards.has(h.id)}
              onClick={() => toggleHazard(h.id)}
              label={h.label}
              icon={h.icon}
            />
          ))}
        </div>
      </Field>

      <Field label="Add a note (optional)">
        <div className="flex items-start gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. construction blocking the side entrance"
            className="flex-1 min-h-[60px] rounded-xl border border-on-surface/15 bg-surface-bright p-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            aria-label={listening ? "Stop dictation" : "Dictate"}
            onClick={listening ? stopSpeech : startSpeech}
            className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors flex-shrink-0 ${
              listening
                ? "bg-primary text-on-primary border-primary animate-pulse"
                : "bg-surface-bright text-primary border-on-surface/15 hover:bg-surface-container"
            }`}
          >
            <Icon name={listening ? "stop_circle" : "mic"} filled={listening} size={20} />
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={correct}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-primary text-on-primary text-sm font-bold hover:bg-primary-dim disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? "Sending…" : "Submit correction"}
        </button>
      </div>
    </div>
  );
}

function DimRow({
  dim,
  value,
  onChange,
}: {
  dim: Dim;
  value: "lower" | "higher" | undefined;
  onChange: (dir: "lower" | "higher") => void;
}) {
  const meta = DIM_META[dim];
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-on-surface">{meta.label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("lower")}
          aria-pressed={value === "lower"}
          className={`inline-flex items-center gap-1 px-3 h-9 rounded-full text-xs font-bold border transition-all active:scale-95 ${
            value === "lower"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-bright text-on-surface border-on-surface/15 hover:bg-surface-container"
          }`}
        >
          <Icon name={meta.lowerIcon} size={14} />
          Less
        </button>
        <button
          type="button"
          onClick={() => onChange("higher")}
          aria-pressed={value === "higher"}
          className={`inline-flex items-center gap-1 px-3 h-9 rounded-full text-xs font-bold border transition-all active:scale-95 ${
            value === "higher"
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface-bright text-on-surface border-on-surface/15 hover:bg-surface-container"
          }`}
        >
          <Icon name={meta.higherIcon} size={14} />
          More
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold border transition-all active:scale-95 ${
        active
          ? "bg-primary text-on-primary border-primary shadow-sm"
          : "bg-surface-bright text-on-surface border-on-surface/15 hover:bg-surface-container"
      }`}
    >
      {icon && <Icon name={icon} size={14} />}
      {label}
    </button>
  );
}
