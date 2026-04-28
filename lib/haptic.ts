/**
 * Centralized haptic helpers.
 *
 * One entry point so every callsite respects:
 *   - User's `hapticWarnings` preference
 *   - `prefers-reduced-motion`
 *   - The browser supporting `navigator.vibrate` (iOS Safari does not).
 *
 * iOS note: Safari deliberately disables the Vibration API. We silently
 * no-op there. On Android Chrome / PWA, vibrations fire. The wrapper
 * makes it safe to sprinkle haptics throughout the UI without checking
 * support at every callsite.
 */

import { loadPreferences } from "@/lib/preferences";

function canVibrate(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  // Reduced-motion users opt out of all haptics.
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  } catch {
    /* ignore */
  }
  // User preference toggle from /settings.
  try {
    if (!loadPreferences().hapticWarnings) return false;
  } catch {
    /* ignore */
  }
  return true;
}

/** Force-fire bypassing the user preference (only for explicit user actions like a button press). */
function forceVibrate(pattern: number | number[]) {
  if (typeof window === "undefined" || typeof navigator?.vibrate !== "function") return;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch {
    /* ignore */
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

/** A tiny tap (UI feedback - button press, marker select). */
export function tap() {
  if (canVibrate()) forceVibrate(15);
}

/** A medium pulse (step advance during navigation). */
export function pulse() {
  if (canVibrate()) forceVibrate(50);
}

/** A two-pulse heads-up (entering a flagged zone). */
export function warn() {
  if (canVibrate()) forceVibrate([60, 80, 60]);
}

/** A short triple buzz for success (arrived, sign matched). */
export function success() {
  if (canVibrate()) forceVibrate([40, 60, 40]);
}

/** A long off-track pattern (course correction needed). */
export function offTrack() {
  if (canVibrate()) forceVibrate([200, 100, 200, 100, 200]);
}

/** Bypasses the user-pref gate - only call from explicit user gestures. */
export function tapAlwaysOn() {
  forceVibrate(15);
}

/** True if vibration is actually possible on this device (for UI hints). */
export function hapticsAvailable(): boolean {
  return typeof window !== "undefined" && typeof navigator?.vibrate === "function";
}
