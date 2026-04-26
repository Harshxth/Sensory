import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Check, Mic, Shield, SkipForward, Sparkles, Type } from "lucide-react";
import { useSensory } from "@/context/SensoryContext";
import { NEED_META, NEED_ORDER } from "@/lib/needs";
import { cn } from "@/lib/utils";

const Step = ({ active, done }: { active: boolean; done: boolean }) => (
  <span
    className={cn(
      "h-1.5 rounded-full transition-all duration-500",
      active ? "w-10 bg-primary-glow" : done ? "w-6 bg-primary/70" : "w-6 bg-muted"
    )}
  />
);

const STEP_TITLES = [
  "What do you need to feel at ease?",
  "Add a comfort voice.",
  "Set the way you read.",
] as const;

const Onboarding = () => {
  const nav = useNavigate();
  const { prefs, setPrefs, toggleNeed } = useSensory();
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const next = () => (step < 2 ? setStep(step + 1) : nav("/map"));
  const back = () => (step > 0 ? setStep(step - 1) : nav("/"));

  // Move focus to the new step heading and announce the change.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  return (
    <div className="min-h-[100dvh] w-full bg-hero relative overflow-hidden">
      {/* Skip link */}
      <a
        href="#onboarding-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to onboarding content
      </a>

      {/* Aurora layer */}
      <div className="absolute inset-0 bg-aurora pointer-events-none" aria-hidden />
      <div className="absolute -top-32 -left-24 w-[420px] h-[420px] aura aura-calm" aria-hidden />
      <div className="absolute top-40 -right-32 w-[360px] h-[360px] aura aura-moderate opacity-60" aria-hidden />

      {/* Header */}
      <header
        role="banner"
        className="relative z-10 flex items-center justify-between px-6 pt-8 max-w-4xl mx-auto"
      >
        <button
          type="button"
          onClick={back}
          className="tap inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={step === 0 ? "Back to welcome" : `Back to step ${step}`}
        >
          <ArrowLeft className="w-5 h-5" aria-hidden />
          <span className="text-sm">Back</span>
        </button>
        <nav
          aria-label="Onboarding progress"
          className="flex items-center gap-2"
        >
          <span className="sr-only">{`Step ${step + 1} of 3: ${STEP_TITLES[step]}`}</span>
          {[0, 1, 2].map((i) => (
            <Step key={i} active={i === step} done={i < step} />
          ))}
        </nav>
        <button
          type="button"
          onClick={() => nav("/map")}
          className="tap inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm"
          aria-label="Skip onboarding and go to the map"
        >
          Skip <SkipForward className="w-4 h-4" aria-hidden />
        </button>
      </header>

      {/* Content */}
      <main
        id="onboarding-main"
        role="main"
        aria-live="polite"
        className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-32 md:pb-12"
      >
        {step === 0 && (
          <StepNeeds
            selected={prefs.needs}
            toggle={toggleNeed}
            headingRef={headingRef}
          />
        )}
        {step === 1 && (
          <StepVoice
            enabled={prefs.comfortVoice}
            onToggle={() => setPrefs({ comfortVoice: !prefs.comfortVoice })}
            headingRef={headingRef}
          />
        )}
        {step === 2 && (
          <StepReading
            language={prefs.language}
            textScale={prefs.textScale}
            lineSpacing={prefs.lineSpacing}
            contrastHigh={prefs.contrastHigh}
            dyslexiaMode={prefs.dyslexiaMode}
            setPrefs={setPrefs}
            headingRef={headingRef}
          />
        )}
      </main>

      {/* Sticky CTA */}
      <div className="fixed md:absolute bottom-0 inset-x-0 z-20 px-6 pb-8 pt-6 bg-gradient-to-t from-background via-background/85 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={next}
            aria-label={
              step < 2
                ? `Continue to step ${step + 2} of 3`
                : "Save preferences and enter Sensory"
            }
            className="tap flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-6 py-4 shadow-glow hover:bg-primary-glow transition-colors"
          >
            {step < 2 ? "Continue" : "Enter Sensory"}
            <ArrowRight className="w-5 h-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- STEP 1 — NEEDS ---------- */
const StepNeeds = ({
  selected,
  toggle,
  headingRef,
}: {
  selected: string[];
  toggle: (n: any) => void;
  headingRef?: React.RefObject<HTMLHeadingElement>;
}) => (
  <section className="animate-fade-up" aria-labelledby="step-needs-title">
    <p className="uppercase tracking-[0.22em] text-xs text-primary-glow/90 mb-4">A gentle start</p>
    <h1
      id="step-needs-title"
      ref={headingRef}
      tabIndex={-1}
      className="font-display text-4xl md:text-6xl text-balance text-gradient-forest focus:outline-none"
    >
      What do you need to feel at ease?
    </h1>
    <p className="mt-5 text-muted-foreground max-w-xl text-pretty">
      Choose any that fit. You can change these any time. Sensory uses them to shape what you see —
      never to label you.
    </p>

    <div className="mt-10 flex flex-wrap gap-3">
      {NEED_ORDER.map((n) => {
        const meta = NEED_META[n];
        const Icon = meta.icon;
        const active = selected.includes(n);
        return (
          <button
            key={n}
            onClick={() => toggle(n)}
            aria-pressed={active}
            className={cn(
              "tap group relative inline-flex items-center gap-3 rounded-full px-5 py-3.5 text-base transition-all duration-300",
              "border backdrop-blur-md",
              active
                ? "bg-primary/15 border-primary-glow/60 text-foreground shadow-glow"
                : "bg-surface/60 border-border text-foreground/85 hover:border-primary/40 hover:bg-surface-raised"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                active ? "bg-primary-glow/20 text-primary-glow" : "bg-muted/60 text-muted-foreground group-hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" aria-hidden />
            </span>
            <span className="font-medium">{meta.label}</span>
            {active && <Check className="w-4 h-4 text-primary-glow" aria-hidden />}
          </button>
        );
      })}
    </div>
  </section>
);

/* ---------- STEP 2 — COMFORT VOICE ---------- */
const StepVoice = ({
  enabled,
  onToggle,
  headingRef,
}: {
  enabled: boolean;
  onToggle: () => void;
  headingRef?: React.RefObject<HTMLHeadingElement>;
}) => (
  <section className="animate-fade-up" aria-labelledby="step-voice-title">
    <p className="uppercase tracking-[0.22em] text-xs text-primary-glow/90 mb-4">Optional</p>
    <h1
      id="step-voice-title"
      ref={headingRef}
      tabIndex={-1}
      className="font-display text-4xl md:text-6xl text-balance text-gradient-forest focus:outline-none"
    >
      Add a comfort voice.
    </h1>
    <p className="mt-5 text-muted-foreground max-w-xl text-pretty">
      Sensory can read places aloud in a voice you trust — your own, a friend's, or our calm narrator.
      Familiar voices reduce anxiety in unfamiliar spaces.
    </p>

    <div className="mt-10 grid md:grid-cols-2 gap-4">
      {/* Record */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 aura aura-calm opacity-70" aria-hidden />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 grid place-items-center text-primary-glow animate-pulse-ring">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl">Record a sample</h3>
              <p className="text-sm text-muted-foreground">About 20 seconds is plenty.</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className={cn(
              "tap mt-6 w-full rounded-full py-3.5 font-semibold transition-colors",
              enabled
                ? "bg-primary text-primary-foreground"
                : "bg-surface-raised text-foreground hover:bg-secondary"
            )}
          >
            {enabled ? "Voice added · tap to remove" : "Start recording"}
          </button>
        </div>
      </div>

      {/* Use built-in */}
      <div className="rounded-2xl p-6 border border-border bg-surface/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 grid place-items-center text-accent">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-2xl">Use Sensory's voice</h3>
            <p className="text-sm text-muted-foreground">Calm, slow, unhurried.</p>
          </div>
        </div>
        <button className="tap mt-6 w-full rounded-full py-3.5 font-semibold border border-border hover:bg-surface-raised transition-colors">
          Preview voice
        </button>
      </div>
    </div>

    {/* Privacy */}
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface-sunken/60 p-4">
      <Shield className="w-5 h-5 text-primary-glow shrink-0 mt-0.5" aria-hidden />
      <p className="text-sm text-muted-foreground">
        Your voice stays on your device. We never store, share, or train on it.
        You can delete it any time from Settings.
      </p>
    </div>
  </section>
);

/* ---------- STEP 3 — READING ---------- */
const StepReading = ({
  language, textScale, lineSpacing, contrastHigh, dyslexiaMode, setPrefs, headingRef,
}: any) => (
  <section className="animate-fade-up" aria-labelledby="step-reading-title">
    <p className="uppercase tracking-[0.22em] text-xs text-primary-glow/90 mb-4">Make it yours</p>
    <h1
      id="step-reading-title"
      ref={headingRef}
      tabIndex={-1}
      className="font-display text-4xl md:text-6xl text-balance text-gradient-forest focus:outline-none"
    >
      Set the way you read.
    </h1>
    <p className="mt-5 text-muted-foreground max-w-xl text-pretty">
      Adjust until this paragraph feels right. The whole app will follow.
    </p>

    <div className="mt-10 grid md:grid-cols-2 gap-4">
      {/* Live preview */}
      <div className="rounded-2xl p-6 glass">
        <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">Preview</p>
        <p className={cn("text-foreground", dyslexiaMode && "font-reading")} style={{
          fontSize: `${1.05 * textScale}rem`,
          lineHeight: lineSpacing,
        }}>
          The cafe on Linden Street is calm in the mornings.
          Soft jazz, warm lighting, low chatter. Step-free entrance and a quiet back room.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-2xl p-6 border border-border bg-surface/60 space-y-6">
        <Field label="Language">
          <select
            value={language}
            onChange={(e) => setPrefs({ language: e.target.value })}
            className="tap w-full rounded-xl bg-surface-raised border border-border px-4 py-3 text-foreground"
          >
            {["English", "Español", "Français", "Deutsch", "العربية", "中文", "हिन्दी"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>

        <Field label={`Text size · ${Math.round(textScale * 100)}%`}>
          <input type="range" min={0.9} max={1.4} step={0.05}
            value={textScale}
            onChange={(e) => setPrefs({ textScale: parseFloat(e.target.value) })}
            className="w-full accent-primary-glow"
          />
        </Field>

        <Field label={`Line spacing · ${lineSpacing.toFixed(2)}`}>
          <input type="range" min={1.4} max={1.9} step={0.05}
            value={lineSpacing}
            onChange={(e) => setPrefs({ lineSpacing: parseFloat(e.target.value) })}
            className="w-full accent-primary-glow"
          />
        </Field>

        <div className="flex items-center justify-between gap-4">
          <Toggle label="High contrast" value={contrastHigh}
            onChange={() => setPrefs({ contrastHigh: !contrastHigh })} />
          <Toggle label="Dyslexia-friendly" value={dyslexiaMode} icon={<Type className="w-4 h-4" />}
            onChange={() => setPrefs({ dyslexiaMode: !dyslexiaMode })} />
        </div>
      </div>
    </div>
  </section>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-sm text-muted-foreground mb-2">{label}</span>
    {children}
  </label>
);

const Toggle = ({ label, value, onChange, icon }:
  { label: string; value: boolean; onChange: () => void; icon?: React.ReactNode }
) => (
  <button
    onClick={onChange}
    aria-pressed={value}
    className={cn(
      "tap flex-1 inline-flex items-center justify-between gap-3 rounded-xl px-4 py-3 border transition-colors",
      value ? "bg-primary/15 border-primary-glow/60 text-foreground" : "bg-surface-raised border-border text-foreground/80"
    )}
  >
    <span className="inline-flex items-center gap-2 text-sm font-medium">{icon}{label}</span>
    <span className={cn(
      "w-9 h-5 rounded-full relative transition-colors",
      value ? "bg-primary-glow/70" : "bg-muted"
    )}>
      <span className={cn(
        "absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all",
        value ? "left-[18px]" : "left-0.5"
      )} />
    </span>
  </button>
);

export default Onboarding;
