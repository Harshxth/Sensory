"use client";

import { useEffect } from "react";
import { applyPreferences, loadPreferences } from "@/lib/preferences";

/**
 * Reads saved accessibility preferences and applies them as classes on <html>
 * before content paints. Listens for storage events so other tabs stay in sync.
 */
export function PreferencesProvider() {
  useEffect(() => {
    applyPreferences(loadPreferences());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sensory:prefs") applyPreferences(loadPreferences());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
