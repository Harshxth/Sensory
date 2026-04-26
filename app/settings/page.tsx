"use client";

import { useEffect, useState } from "react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Icon } from "@/components/ui/Icon";
import {
  applyPreferences,
  loadPreferences,
  savePreferences,
  TEXT_SIZE_LABELS,
  type Preferences,
} from "@/lib/preferences";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);
  const [screenReader, setScreenReader] = useState(true);
  const [audioDesc, setAudioDesc] = useState(false);
  const [haptics, setHaptics] = useState<"strong" | "subtle" | "off">("subtle");

  const [savedFlash, setSavedFlash] = useState(false);

  // Live-apply + persist on every change. Flash a "Saved" indicator briefly.
  useEffect(() => {
    applyPreferences(prefs);
    savePreferences(prefs);
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1200);
    return () => clearTimeout(t);
  }, [prefs]);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const textSize = prefs.textSize;
  const highContrast = prefs.highContrast;
  const dyslexiaFont = prefs.dyslexiaFont;
  const reducedMotion = prefs.reducedMotion;

  return (
    <>
      <TopAppBar
        title="Accessibility"
        leading={{ icon: "arrow_back", label: "Back", href: "/map" }}
      />

      <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 md:gap-8 pb-24 md:pb-8">
        <header className="mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
            Accessibility Settings
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl">
            Customize your visual, auditory, and haptic experience for maximum comfort.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-6 flex flex-col gap-8">
            <SectionHeader icon="visibility" container="bg-primary-container text-on-primary-container" title="Visual Preferences" />

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-on-surface" htmlFor="textSize">
                  Text Size
                </label>
                <span className="text-sm font-bold bg-surface-container px-3 py-1 rounded-full text-on-surface-variant">
                  {TEXT_SIZE_LABELS[textSize - 1]}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-on-surface-variant">A</span>
                <input
                  id="textSize"
                  type="range"
                  min={1}
                  max={5}
                  value={textSize}
                  onChange={(e) => update("textSize", Number(e.target.value) as Preferences["textSize"])}
                  className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xl font-bold text-on-surface">A</span>
              </div>
              <p className="text-sm text-on-surface-variant">
                Adjust the global text size for better readability.
              </p>
            </div>

            <ToggleRow
              label="High Contrast Mode"
              hint="Increase color contrast for easier reading."
              checked={highContrast}
              onChange={(v) => update("highContrast", v)}
            />

            <ToggleRow
              label="Dyslexia Friendly Font"
              hint="Switch to OpenDyslexic, a typeface optimized for dyslexia."
              checked={dyslexiaFont}
              onChange={(v) => update("dyslexiaFont", v)}
            />

            <ToggleRow
              label="Reduce Motion"
              hint="Disable pulses, slides, and other animations across the app."
              checked={reducedMotion}
              onChange={(v) => update("reducedMotion", v)}
            />
          </section>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-6 flex flex-col gap-6">
              <SectionHeader icon="hearing" container="bg-secondary-container text-on-secondary-container" title="Auditory" />
              <ToggleRow compact label="Screen Reader Support" checked={screenReader} onChange={setScreenReader} />
              <ToggleRow compact label="Audio Descriptions" checked={audioDesc} onChange={setAudioDesc} />
            </section>

            <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-6 flex flex-col gap-6">
              <SectionHeader icon="vibration" container="bg-tertiary-container text-on-tertiary-container" title="Haptics" />
              <div className="flex flex-col gap-3">
                {[
                  { v: "strong", label: "Strong Vibrations" },
                  { v: "subtle", label: "Subtle Haptics" },
                  { v: "off", label: "Off" },
                ].map((opt) => {
                  const selected = haptics === opt.v;
                  return (
                    <label
                      key={opt.v}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selected
                          ? "bg-surface-container border border-primary-container"
                          : "hover:bg-surface-container border border-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="haptics"
                        checked={selected}
                        onChange={() => setHaptics(opt.v as typeof haptics)}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="font-medium text-on-surface">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="lg:col-span-12 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-6 flex flex-col gap-4">
            <SectionHeader icon="shield_lock" container="bg-secondary-container text-on-secondary-container" title="Privacy & Voice" />
            <p className="text-sm text-on-surface-variant">
              Voice IDs are AES-256-GCM encrypted at rest. Audio captured by the noise sampler
              never leaves your device — only the computed dB number is uploaded.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 h-12 rounded-lg border border-outline text-on-surface font-bold hover:bg-surface-container transition-colors">
                Delete my voice clone
              </button>
              <button className="px-5 h-12 rounded-lg border border-error text-error font-bold hover:bg-error-container/30 transition-colors">
                Delete my account
              </button>
            </div>
          </section>

          <div className="lg:col-span-12 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 mt-2 border-t border-surface-container pt-6">
            <span
              role="status"
              aria-live="polite"
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition-opacity ${
                savedFlash ? "opacity-100 text-primary" : "opacity-0 text-transparent"
              }`}
            >
              <Icon name="check_circle" filled size={16} /> Saved automatically
            </span>
            <button
              type="button"
              onClick={() =>
                setPrefs({
                  textSize: 3,
                  highContrast: false,
                  dyslexiaFont: false,
                  reducedMotion: false,
                  needs: prefs.needs,
                  language: prefs.language,
                  voiceCloneId: prefs.voiceCloneId,
                  onboardingComplete: prefs.onboardingComplete,
                })
              }
              className="px-6 py-3 rounded-lg border border-outline text-on-surface font-bold hover:bg-surface-container transition-colors min-h-[48px]"
            >
              Reset Defaults
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

function SectionHeader({
  icon,
  container,
  title,
}: {
  icon: string;
  container: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-surface-container pb-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${container}`}>
        <Icon name={icon} size={22} />
      </div>
      <h2 className="text-xl font-bold text-on-surface">{title}</h2>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  badge,
  checked,
  onChange,
  compact,
}: {
  label: string;
  hint?: string;
  badge?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex items-center justify-between"
          : "flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-surface-container-high"
      }
    >
      <div className="flex flex-col gap-1 pr-4">
        <span className="font-semibold text-on-surface flex items-center gap-2">
          {label}
          {badge && (
            <span className="bg-tertiary-container text-on-tertiary-container text-xs px-2 py-0.5 rounded-full font-bold">
              {badge}
            </span>
          )}
        </span>
        {hint && <span className="text-sm text-on-surface-variant">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-primary" : "bg-surface-variant"
        }`}
      >
        <span
          className={`absolute top-[2px] h-6 w-6 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-[30px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  );
}
