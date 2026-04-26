import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Type, Sun, Sparkles, Languages, Accessibility, Eye, Ear,
  EarOff, SunMedium, Shield, Lock, Trash2,
} from "lucide-react";
import { useSensory } from "@/context/SensoryContext";
import { cn } from "@/lib/utils";

const Section = ({ title, subtitle, children }:
  { title: string; subtitle?: string; children: React.ReactNode }
) => (
  <section className="rounded-3xl border border-border bg-surface/60 p-5 md:p-6">
    <h2 className="font-display text-2xl">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-1 text-pretty">{subtitle}</p>}
    <div className="mt-5 space-y-4">{children}</div>
  </section>
);

const Row = ({ icon: Icon, label, hint, children }:
  { icon: any; label: string; hint?: string; children: React.ReactNode }
) => (
  <div className="flex items-start gap-4 py-3">
    <div className="w-10 h-10 rounded-xl bg-muted/50 grid place-items-center text-foreground/80 shrink-0">
      <Icon className="w-4 h-4" aria-hidden />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium">{label}</p>
      {hint && <p className="text-sm text-muted-foreground text-pretty">{hint}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Switch = ({ value, onChange, label }:
  { value: boolean; onChange: () => void; label: string }
) => (
  <button
    onClick={onChange}
    aria-pressed={value}
    aria-label={label}
    className={cn(
      "tap relative w-14 h-8 rounded-full border transition-colors",
      value ? "bg-primary border-primary-glow" : "bg-muted border-border"
    )}
  >
    <span className={cn(
      "absolute top-1 w-6 h-6 rounded-full bg-foreground transition-all duration-300",
      value ? "left-7" : "left-1"
    )} />
  </button>
);

const Settings = () => {
  const nav = useNavigate();
  const { prefs, setPrefs, toggleNeed } = useSensory();

  return (
    <div className="min-h-[100dvh] bg-hero">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-strong border-b border-border">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => nav("/map")}
            className="tap w-10 h-10 grid place-items-center rounded-full hover:bg-surface-raised"
            aria-label="Back to map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Yours, only yours</p>
            <h1 className="font-display text-2xl">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 space-y-6 pb-24">
        {/* Reading */}
        <Section title="Reading" subtitle="Adjust until words feel calm.">
          <Row icon={Type} label="Dyslexia-friendly mode" hint="Lexend font, more space between letters and words.">
            <Switch value={prefs.dyslexiaMode} onChange={() => setPrefs({ dyslexiaMode: !prefs.dyslexiaMode })} label="Dyslexia mode" />
          </Row>

          <div className="pt-2">
            <p className="font-medium mb-2">Text size · {Math.round(prefs.textScale * 100)}%</p>
            <input type="range" min={0.9} max={1.4} step={0.05}
              value={prefs.textScale}
              onChange={(e) => setPrefs({ textScale: parseFloat(e.target.value) })}
              className="w-full accent-primary-glow"
              aria-label="Text size"
            />
          </div>

          <div>
            <p className="font-medium mb-2">Line spacing · {prefs.lineSpacing.toFixed(2)}</p>
            <input type="range" min={1.4} max={1.9} step={0.05}
              value={prefs.lineSpacing}
              onChange={(e) => setPrefs({ lineSpacing: parseFloat(e.target.value) })}
              className="w-full accent-primary-glow"
              aria-label="Line spacing"
            />
          </div>

          <Row icon={Sun} label="High contrast" hint="Boosts contrast for AAA-level readability.">
            <Switch value={prefs.contrastHigh} onChange={() => setPrefs({ contrastHigh: !prefs.contrastHigh })} label="High contrast" />
          </Row>

          <Row icon={Languages} label="Language" hint="Used for plain-language summaries.">
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ language: e.target.value })}
              className="tap rounded-xl bg-surface-raised border border-border px-3 py-2 text-sm"
            >
              {["English", "Español", "Français", "Deutsch", "العربية", "中文", "हिन्दी"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Row>
        </Section>

        {/* Movement & motion */}
        <Section title="Movement" subtitle="Set your default route style and motion.">
          <Row icon={Sparkles} label="Reduce motion" hint="Pause subtle animations across the app.">
            <Switch value={prefs.reduceMotion} onChange={() => setPrefs({ reduceMotion: !prefs.reduceMotion })} label="Reduce motion" />
          </Row>
          <Row icon={Accessibility} label="Wheelchair routes by default" hint="We'll always start with step-free directions.">
            <Switch value={prefs.wheelchairDefault} onChange={() => setPrefs({ wheelchairDefault: !prefs.wheelchairDefault })} label="Wheelchair default" />
          </Row>
        </Section>

        {/* Sensory needs */}
        <Section title="Your sensory profile" subtitle="What we should watch for. Tap to add or remove.">
          <div className="flex flex-wrap gap-2 pt-1">
            {([
              { id: "blind", label: "Blind / low vision", icon: Eye },
              { id: "deaf", label: "Deaf / hard-of-hearing", icon: Ear },
              { id: "noise", label: "Noise-sensitive", icon: EarOff },
              { id: "light", label: "Light-sensitive", icon: SunMedium },
              { id: "esl", label: "Plain language", icon: Languages },
            ] as const).map(({ id, label, icon: Icon }) => {
              const on = prefs.needs.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleNeed(id)}
                  aria-pressed={on}
                  className={cn(
                    "tap inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm border transition-colors",
                    on
                      ? "bg-primary/15 border-primary-glow/60 text-foreground"
                      : "bg-surface-raised border-border text-foreground/85 hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Privacy */}
        <Section
          title="Privacy"
          subtitle="Plain-English controls. No dark patterns, no tracking surprises."
        >
          <Row icon={Shield} label="On-device by default" hint="Your needs and voice stay on your phone unless you choose to back them up.">
            <span className="text-xs text-primary-glow font-semibold">On</span>
          </Row>
          <Row icon={Lock} label="Anonymous reviews" hint="Your contributions show a friendly name, never your real one.">
            <Switch value={true} onChange={() => {}} label="Anonymous reviews" />
          </Row>
          <button className="tap w-full inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 text-destructive py-3 hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete my data
          </button>
        </Section>
      </main>
    </div>
  );
};

export default Settings;
