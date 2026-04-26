import {
  Accessibility, Ear, Eye, Languages, Volume2, MessageSquarePlus,
  Star, Wind, Lightbulb, Users, DoorOpen, Music2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SensoryLevel = "calm" | "moderate" | "intense";

export interface Venue {
  id: string;
  name: string;
  category: string;
  desc: string;
  sensory: { noise: number; light: number; crowd: number; smell: number; exits: number };
  accessibility: { wheelchair: boolean; blind: boolean; deaf: boolean; esl: boolean };
  reviews: { who: string; when: string; text: string; level: SensoryLevel }[];
}

const levelOf = (v: number): SensoryLevel =>
  v < 35 ? "calm" : v < 70 ? "moderate" : "intense";

const SensoryBar = ({
  label, value, icon: Icon, hint,
}: { label: string; value: number; icon: any; hint: string }) => {
  const lvl = levelOf(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium">{label}</span>
        <span className={cn(
          "ml-auto text-xs px-2 py-0.5 rounded-full capitalize border",
          lvl === "calm" && "border-signal-calm/40 text-signal-calm",
          lvl === "moderate" && "border-signal-moderate/50 text-signal-moderate",
          lvl === "intense" && "border-signal-intense/50 text-signal-intense",
        )}>{lvl}</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted/60 overflow-hidden" aria-hidden>
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
            lvl === "calm" && "bg-signal-calm",
            lvl === "moderate" && "bg-signal-moderate",
            lvl === "intense" && "bg-signal-intense",
          )}
          style={{ width: `${value}%`, boxShadow: "0 0 12px currentColor" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
};

const AccessChip = ({ ok, label, icon: Icon }: { ok: boolean; label: string; icon: any }) => (
  <span className={cn(
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border",
    ok
      ? "bg-primary/12 text-primary-glow border-primary-glow/40"
      : "bg-muted/40 text-muted-foreground border-border line-through decoration-muted-foreground/40"
  )}>
    <Icon className="w-3.5 h-3.5" aria-hidden />
    {label}
  </span>
);

const VenueDetail = ({ venue, compact = false }: { venue: Venue; compact?: boolean }) => {
  const overall = levelOf(
    (venue.sensory.noise + venue.sensory.light + venue.sensory.crowd) / 3
  );
  return (
    <div className={cn("flex flex-col", compact ? "max-h-[55dvh]" : "h-full")}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl grid place-items-center shrink-0",
            overall === "calm" && "ring-aura-calm bg-signal-calm/15 text-signal-calm",
            overall === "moderate" && "ring-aura-moderate bg-signal-moderate/15 text-signal-moderate",
            overall === "intense" && "ring-aura-intense bg-signal-intense/15 text-signal-intense",
          )}>
            <Music2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{venue.category}</p>
            <h2 className="font-display text-2xl md:text-3xl text-balance mt-0.5">{venue.name}</h2>
            <p className="text-sm text-muted-foreground mt-2 text-pretty">{venue.desc}</p>
          </div>
        </div>

        {/* Access chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <AccessChip ok={venue.accessibility.wheelchair} label="Step-free" icon={Accessibility} />
          <AccessChip ok={venue.accessibility.blind} label="Audio guide" icon={Eye} />
          <AccessChip ok={venue.accessibility.deaf} label="Visual alerts" icon={Ear} />
          <AccessChip ok={venue.accessibility.esl} label="Plain language" icon={Languages} />
        </div>
      </div>

      {/* Sensory profile */}
      <div className="px-5 pb-2 space-y-4 overflow-y-auto no-scrollbar flex-1">
        <SensoryBar label="Noise" value={venue.sensory.noise} icon={Volume2} hint="Background sound, music, voices" />
        <SensoryBar label="Lighting" value={venue.sensory.light} icon={Lightbulb} hint="Brightness and any flicker" />
        <SensoryBar label="Crowd" value={venue.sensory.crowd} icon={Users} hint="How busy it usually feels" />
        <SensoryBar label="Smell" value={venue.sensory.smell} icon={Wind} hint="Cleaning, food, perfume" />
        <SensoryBar label="Exits" value={venue.sensory.exits} icon={DoorOpen} hint="How easy to step outside" />

        {!compact && (
          <>
            {/* Reviews */}
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl">Live from people here</h3>
                <Star className="w-4 h-4 text-accent" aria-hidden />
              </div>
              <div className="mt-3 space-y-3">
                {venue.reviews.map((r, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-surface/60 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        r.level === "calm" && "bg-signal-calm",
                        r.level === "moderate" && "bg-signal-moderate",
                        r.level === "intense" && "bg-signal-intense",
                      )} />
                      <span className="font-medium text-foreground">{r.who}</span>
                      <span>· {r.when}</span>
                    </div>
                    <p className="mt-1.5 text-sm">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer actions (desktop only — mobile has its own row) */}
      {!compact && (
        <div className="p-5 border-t border-border flex gap-2">
          <button className="tap flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold py-3 hover:bg-primary-glow transition-colors">
            <Volume2 className="w-4 h-4" /> Listen
          </button>
          <button className="tap inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm hover:bg-surface-raised transition-colors">
            <MessageSquarePlus className="w-4 h-4" /> Add review
          </button>
        </div>
      )}
    </div>
  );
};

export default VenueDetail;
