import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type SensoryNeed =
  | "noise" | "light" | "wheelchair" | "deaf" | "blind" | "esl" | "dyslexia";

export interface SensoryPrefs {
  needs: SensoryNeed[];
  language: string;
  textScale: number;       // 0.9 .. 1.4
  lineSpacing: number;     // 1.4 .. 1.9
  contrastHigh: boolean;
  reduceMotion: boolean;
  dyslexiaMode: boolean;
  wheelchairDefault: boolean;
  comfortVoice: boolean;
}

const defaultPrefs: SensoryPrefs = {
  needs: [],
  language: "English",
  textScale: 1,
  lineSpacing: 1.55,
  contrastHigh: false,
  reduceMotion: false,
  dyslexiaMode: false,
  wheelchairDefault: false,
  comfortVoice: false,
};

interface Ctx {
  prefs: SensoryPrefs;
  setPrefs: (p: Partial<SensoryPrefs>) => void;
  toggleNeed: (n: SensoryNeed) => void;
}

const SensoryCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "sensory.prefs.v1";

export const SensoryProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefsState] = useState<SensoryPrefs>(() => {
    if (typeof window === "undefined") return defaultPrefs;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
    } catch { return defaultPrefs; }
  });

  const setPrefs = (p: Partial<SensoryPrefs>) =>
    setPrefsState((prev) => ({ ...prev, ...p }));

  const toggleNeed = (n: SensoryNeed) =>
    setPrefsState((prev) => ({
      ...prev,
      needs: prev.needs.includes(n) ? prev.needs.filter((x) => x !== n) : [...prev.needs, n],
    }));

  // Persist + apply to <html>
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
    const root = document.documentElement;
    root.classList.toggle("contrast-high", prefs.contrastHigh);
    root.classList.toggle("reduce-motion", prefs.reduceMotion);
    root.classList.toggle("reading-dyslexia", prefs.dyslexiaMode);
    root.style.setProperty("--reading-scale", String(prefs.textScale));
    root.style.setProperty("--reading-leading", String(prefs.lineSpacing));
  }, [prefs]);

  const value = useMemo(() => ({ prefs, setPrefs, toggleNeed }), [prefs]);
  return <SensoryCtx.Provider value={value}>{children}</SensoryCtx.Provider>;
};

export const useSensory = () => {
  const ctx = useContext(SensoryCtx);
  if (!ctx) throw new Error("useSensory must be used inside SensoryProvider");
  return ctx;
};
