"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VoiceCloneRecorder } from "@/components/voice/VoiceCloneRecorder";
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [needs, setNeeds] = useState<Set<AccessibilityNeed>>(new Set());
  const [language, setLanguage] = useState<Language>("en");

  const toggleNeed = (id: AccessibilityNeed) => {
    setNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const next = () => {
    if (step === 3) {
      // TODO: persist profile to Supabase + Mongo before redirect
      router.push("/map");
      return;
    }
    setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const back = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((s) => (s - 1) as 1 | 2 | 3);
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
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? "bg-primary-container" : "bg-surface-container-high"
              }`}
            />
          ))}
          <span className="text-xs font-bold tracking-wider text-outline ml-2">
            {step} of 3
          </span>
        </div>

        {step === 1 && (
          <Step1Needs needs={needs} onToggle={toggleNeed} />
        )}
        {step === 2 && <Step2Voice />}
        {step === 3 && <Step3Language value={language} onChange={setLanguage} />}

        <div className="flex-grow min-h-[40px]" />
        <div className="mt-6 px-2 w-full pt-4 sticky bottom-6">
          <button
            onClick={next}
            className="w-full min-h-[56px] rounded-full bg-primary text-on-primary font-bold shadow-[0_8px_20px_rgba(24,97,21,0.15)] hover:shadow-[0_12px_24px_rgba(24,97,21,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            {step === 3 ? "Open the Map" : "Continue"}
          </button>
        </div>
      </main>
    </>
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
