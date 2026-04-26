"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VoiceCloneRecorder } from "@/components/voice/VoiceCloneRecorder";
import { loadPreferences, savePreferences } from "@/lib/preferences";
import type { AccessibilityNeed, Language } from "@/types";

type NeedOption = {
  id: AccessibilityNeed;
  icon: string;
  label: string;
  hint: string;
};

const NEED_OPTIONS: NeedOption[] = [
  { id: "noise", icon: "volume_off", label: "Noise-sensitive", hint: "Prefers quieter environments" },
  { id: "light", icon: "light_mode", label: "Light-sensitive", hint: "Reduced glare and dimming" },
  { id: "wheelchair", icon: "accessible", label: "Wheelchair user", hint: "Step-free routes and access" },
  { id: "deaf", icon: "hearing_disabled", label: "Deaf / Hard of Hearing", hint: "Visual cues and captions" },
  { id: "blind", icon: "visibility_off", label: "Blind / Low Vision", hint: "Screen reader optimization" },
  { id: "esl", icon: "translate", label: "English Second Language", hint: "Simplified phrasing" },
];

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "zh", label: "Mandarin", native: "中文" },
];

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [needs, setNeeds] = useState<Set<AccessibilityNeed>>(new Set());
  const [language, setLanguage] = useState<Language>("en");

  // Hydrate from any prior onboarding so users can adjust without losing data.
  useEffect(() => {
    const p = loadPreferences();
    if (p.needs.length > 0) setNeeds(new Set(p.needs));
    if (p.language) setLanguage(p.language);
  }, []);

  const toggleNeed = (id: AccessibilityNeed) => {
    setNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const next = () => {
    if (step === 4) {
      const current = loadPreferences();
      savePreferences({
        ...current,
        needs: Array.from(needs),
        language,
        onboardingComplete: true,
      });
      router.push("/map");
      return;
    }
    setStep((s) => ((s + 1) as Step));
  };

  const back = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((s) => ((s - 1) as Step));
  };

  return (
    <>
      <header className="w-full flex justify-between items-center px-6 py-4 fixed top-0 left-0 z-50 bg-background/80 backdrop-blur-md">
        <button
          aria-label="Go back"
          onClick={back}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <Icon name="arrow_back" size={24} className="text-on-surface-variant" />
        </button>
        <Link
          href="/map"
          className="text-sm font-semibold text-primary hover:text-primary-dim transition-colors h-11 px-4 flex items-center rounded-full hover:bg-primary/5"
        >
          Skip
        </Link>
      </header>

      <main className="flex-grow flex flex-col px-6 pt-24 pb-8 max-w-2xl mx-auto w-full">
        <div className="w-full flex items-center gap-2 mb-6 px-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? "bg-primary-container" : "bg-surface-container-high"
              }`}
            />
          ))}
          <span className="text-xs font-bold tracking-wider text-outline ml-2">
            {step} of 4
          </span>
        </div>

        {step === 1 && <Step1Needs needs={needs} onToggle={toggleNeed} />}
        {step === 2 && <Step2Voice />}
        {step === 3 && <Step3Language value={language} onChange={setLanguage} />}
        {step === 4 && <Step4VisualKey />}

        <div className="flex-grow min-h-[40px]" />
        <div className="mt-6 px-2 w-full pt-4 sticky bottom-6">
          <button
            onClick={next}
            className="w-full min-h-[56px] rounded-full bg-primary text-on-primary font-bold shadow-[0_8px_20px_rgba(24,97,21,0.15)] hover:shadow-[0_12px_24px_rgba(24,97,21,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            {step === 4 ? "Open the Map" : "Continue"}
          </button>
        </div>
      </main>
    </>
  );
}

function Step4VisualKey() {
  return (
    <>
      <div className="mb-8 px-2">
        <h1 className="text-3xl md:text-4xl font-semibold text-on-background mb-2">
          What you&apos;ll see on the map
        </h1>
        <p className="text-on-surface-variant">
          Each sense has its own visual language. You can toggle them on or off any time.
        </p>
      </div>

      <div className="space-y-3 px-2">
        <KeyCard
          icon="graphic_eq"
          accent="thermal"
          title="Noise"
          description="A thermal heatmap — cool blue for quiet, warm orange and red for loud zones."
          preview={
            <div className="w-full h-full rounded-lg bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 opacity-90" />
          }
        />
        <KeyCard
          icon="groups"
          accent="amber"
          title="Crowd"
          description="Pulsing orange dots show where people gather. The brighter and bigger, the busier."
          preview={
            <div className="w-full h-full rounded-lg bg-amber-50 flex items-center justify-center">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping w-6 h-6" />
                <span className="relative block w-4 h-4 rounded-full bg-orange-500 ring-2 ring-white" />
              </div>
            </div>
          }
        />
        <KeyCard
          icon="lightbulb"
          accent="sun"
          title="Lighting"
          description="A soft yellow glow marks bright or harsh-lit places. Stronger glow = harsher light."
          preview={
            <div className="w-full h-full rounded-lg bg-yellow-50 flex items-center justify-center">
              <span className="block w-6 h-6 rounded-full bg-yellow-300 shadow-[0_0_24px_8px_rgba(253,224,71,0.7)]" />
            </div>
          }
        />
        <KeyCard
          icon="accessible"
          accent="cyan"
          title="Wheelchair"
          description="Cyan rings highlight venues with verified step-free access. Toggle on when you need it."
          preview={
            <div className="w-full h-full rounded-lg bg-cyan-50 flex items-center justify-center">
              <span className="block w-6 h-6 rounded-full border-[3px] border-cyan-400" />
            </div>
          }
        />
        <KeyCard
          icon="campaign"
          accent="orange"
          title="Live alerts"
          description="A red badge appears for active events nearby — street fairs, construction, anything that changes the sensory profile."
          preview={
            <div className="w-full h-full rounded-lg bg-rose-50 flex items-center justify-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs">
                !
              </span>
            </div>
          }
        />
      </div>
    </>
  );
}

function KeyCard({
  icon,
  title,
  description,
  preview,
}: {
  icon: string;
  accent: string;
  title: string;
  description: string;
  preview: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-on-surface/10">
      <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-surface-container-low">
        {preview}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
          <span className="text-primary">
            <Icon name={icon} filled size={16} />
          </span>
          {title}
        </div>
        <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{description}</p>
      </div>
    </div>
  );
}

function Step1Needs({
  needs,
  onToggle,
}: {
  needs: Set<AccessibilityNeed>;
  onToggle: (id: AccessibilityNeed) => void;
}) {
  return (
    <>
      <div className="mb-10 px-2">
        <h1 className="text-3xl md:text-4xl font-semibold text-on-background mb-2">
          What do you need?
        </h1>
        <p className="text-on-surface-variant">
          Select any that apply so we can personalize your sensory sanctuary.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 px-2">
        {NEED_OPTIONS.map((opt) => {
          const selected = needs.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              aria-pressed={selected}
              className={`flex items-center gap-4 p-4 rounded-xl min-h-[72px] w-full text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                selected
                  ? "bg-primary-container text-on-primary-container border border-primary-container shadow-[0_4px_12px_rgba(24,97,21,0.1)]"
                  : "bg-surface-container text-on-surface border border-transparent hover:bg-surface-container-high hover:-translate-y-px"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selected ? "bg-on-primary-container/10" : "bg-surface-container-low"
                }`}
              >
                <Icon
                  name={opt.icon}
                  size={24}
                  className={selected ? "text-on-primary-container" : "text-primary"}
                />
              </div>
              <div>
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span
                  className={`block text-[13px] mt-1 ${
                    selected ? "text-on-primary-container/80" : "text-on-surface-variant"
                  }`}
                >
                  {opt.hint}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step2Voice() {
  return (
    <>
      <div className="mb-10 px-2">
        <h1 className="text-3xl md:text-4xl font-semibold text-on-background mb-2">
          Add a comfort voice
        </h1>
        <p className="text-on-surface-variant">
          Optional. Record 30 seconds of a voice you find calming — Sensory will read venue
          summaries in this voice, in any language.
        </p>
      </div>
      <div className="px-2 flex flex-col items-center gap-6 py-4">
        <div className="w-32 h-32 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
          <Icon name="mic" filled size={48} />
        </div>
        <VoiceCloneRecorder />
        <p className="text-xs text-on-surface-variant text-center max-w-md">
          Voice IDs are encrypted at rest. Audio is sent to ElevenLabs for cloning, then deleted.
          You can delete your voice clone any time from Settings.
        </p>
      </div>
    </>
  );
}

function Step3Language({
  value,
  onChange,
}: {
  value: Language;
  onChange: (lang: Language) => void;
}) {
  return (
    <>
      <div className="mb-10 px-2">
        <h1 className="text-3xl md:text-4xl font-semibold text-on-background mb-2">
          Preferred language
        </h1>
        <p className="text-on-surface-variant">
          The same warm voice works across all three languages.
        </p>
      </div>
      <div role="radiogroup" aria-label="Preferred language" className="flex flex-col gap-3 px-2">
        {LANGUAGES.map((l) => {
          const selected = value === l.code;
          return (
            <button
              key={l.code}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(l.code)}
              className={`flex items-center justify-between p-5 rounded-xl min-h-[72px] w-full text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                selected
                  ? "bg-primary-container text-on-primary-container border border-primary"
                  : "bg-surface-container text-on-surface border border-transparent hover:bg-surface-container-high"
              }`}
            >
              <div>
                <span className="block text-lg font-semibold">{l.label}</span>
                <span className="block text-sm opacity-70">{l.native}</span>
              </div>
              {selected && <Icon name="check_circle" filled size={28} />}
            </button>
          );
        })}
      </div>
    </>
  );
}
