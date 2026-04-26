/**
 * Trip Journal — local-only journey log.
 *
 * Stores completed navigation sessions in localStorage so the user can review
 * past trips as editorial-styled "field notes". No server roundtrip; no PII
 * leaves the device.
 *
 * Schema is versioned so we can evolve it without wiping existing entries.
 */

const KEY = "sensory:journal:v1";

export type JournalEntry = {
  id: string;
  startedAt: number;
  endedAt: number;
  fromName: string;
  toName: string;
  /** "calm" if the calm route was taken, "faster" if the loud-but-faster path */
  routeKind: "calm" | "faster";
  distanceMeters: number;
  durationSec: number;
  /** Tag list of sensory zones the route passed through. */
  encountered: Array<{ kind: "noise" | "light" | "crowd" | "smell" | "alert"; label: string }>;
  /** Free-text reflection the user can add post-hoc. */
  reflection?: string;
};

export function loadJournal(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.endedAt - a.endedAt) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: Omit<JournalEntry, "id">) {
  if (typeof window === "undefined") return;
  const id = `${entry.endedAt}-${Math.random().toString(36).slice(2, 8)}`;
  const all = loadJournal();
  all.unshift({ ...entry, id });
  // keep last 200
  const trimmed = all.slice(0, 200);
  window.localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function updateReflection(id: string, reflection: string) {
  if (typeof window === "undefined") return;
  const all = loadJournal();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], reflection };
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteEntry(id: string) {
  if (typeof window === "undefined") return;
  const all = loadJournal().filter((e) => e.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

/** Seed a few demo entries so the journal isn't empty during demos. */
export function seedDemoEntries(): JournalEntry[] {
  const now = Date.now();
  const demos: JournalEntry[] = [
    {
      id: "demo-1",
      startedAt: now - 1000 * 60 * 60 * 24 * 1 - 1000 * 60 * 18,
      endedAt: now - 1000 * 60 * 60 * 24 * 1,
      fromName: "USF Maple Hall",
      toName: "USF Tampa Library",
      routeKind: "calm",
      distanceMeters: 980,
      durationSec: 1080,
      encountered: [
        { kind: "noise", label: "Avoided MOSI loud zone" },
        { kind: "alert", label: "Construction near Engineering II" },
      ],
      reflection: "Quieter than Tuesday. Got two hours of focus before lunch.",
    },
    {
      id: "demo-2",
      startedAt: now - 1000 * 60 * 60 * 24 * 3 - 1000 * 60 * 22,
      endedAt: now - 1000 * 60 * 60 * 24 * 3,
      fromName: "USF Marshall Center",
      toName: "Tampa Riverwalk",
      routeKind: "calm",
      distanceMeters: 14200,
      durationSec: 2880,
      encountered: [
        { kind: "crowd", label: "Bypassed Centro Ybor" },
        { kind: "light", label: "Soft afternoon shade along Bayshore" },
      ],
      reflection: "First time walking the Riverwalk solo. Took the longer path. Worth it.",
    },
    {
      id: "demo-3",
      startedAt: now - 1000 * 60 * 60 * 24 * 5,
      endedAt: now - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 8,
      fromName: "USF Library",
      toName: "Foundation Coffee Co.",
      routeKind: "faster",
      distanceMeters: 520,
      durationSec: 480,
      encountered: [{ kind: "noise", label: "Through Fowler intersection" }],
    },
  ];
  return demos;
}
