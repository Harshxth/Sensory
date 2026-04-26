import type { AccessibilityNeed, Language } from "@/types";

export type Preferences = {
  textSize: 1 | 2 | 3 | 4 | 5;
  highContrast: boolean;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  // Profile from onboarding
  needs: AccessibilityNeed[];
  language: Language;
  voiceCloneId: string | null;
  onboardingComplete: boolean;
};

const STORAGE_KEY = "sensory:prefs";

export const DEFAULT_PREFERENCES: Preferences = {
  textSize: 3,
  highContrast: false,
  dyslexiaFont: false,
  reducedMotion: false,
  needs: [],
  language: "en",
  voiceCloneId: null,
  onboardingComplete: false,
};

export function loadPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Preferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota / private mode
  }
}

// Apply preferences as classes on <html> so CSS in globals.css can target them.
export function applyPreferences(prefs: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("a11y-dyslexic", prefs.dyslexiaFont);
  root.classList.toggle("a11y-contrast", prefs.highContrast);
  root.classList.toggle("a11y-reduced-motion", prefs.reducedMotion);
  root.classList.remove("a11y-text-1", "a11y-text-2", "a11y-text-3", "a11y-text-4", "a11y-text-5");
  root.classList.add(`a11y-text-${prefs.textSize}`);
}

export const TEXT_SIZE_LABELS = ["Small", "Compact", "Standard", "Large", "X-Large"] as const;
