"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { loadPreferences } from "@/lib/preferences";

const STORAGE_KEY = "sensory:share-token";

export function ShareJourneyButton() {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
      startPinging(saved, watchRef);
    }
    return () => {
      if (watchRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  const start = async () => {
    setBusy(true);
    try {
      const newToken = randomToken();
      const prefs = loadPreferences();
      const res = await fetch(`/api/share/${newToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prefs.needs.length > 0 ? "A Sensory user" : "A friend",
          needs: prefs.needs,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      localStorage.setItem(STORAGE_KEY, newToken);
      setToken(newToken);
      startPinging(newToken, watchRef);
    } catch {
      alert("Couldn't start sharing. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const stop = () => {
    if (watchRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setCopied(false);
  };

  const copy = async () => {
    if (!token) return;
    const url = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      alert(`Copy this link manually: ${url}`);
    }
  };

  if (!token) {
    return (
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dim disabled:opacity-50 transition-colors"
      >
        <Icon name="share_location" filled size={18} />
        {busy ? "Starting…" : "Share my journey"}
      </button>
    );
  }

  const url = typeof window !== "undefined" ? `${window.location.origin}/share/${token}` : "";

  return (
    <div className="flex flex-col gap-2 bg-surface-container-low rounded-xl p-3 border border-on-surface/10">
      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        Share link active
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-xs text-on-surface truncate font-mono">{url}</span>
        <button
          type="button"
          onClick={copy}
          className="px-3 h-8 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1"
        >
          {copied ? (
            <>
              <Icon name="check" size={14} /> Copied
            </>
          ) : (
            <>
              <Icon name="content_copy" size={14} /> Copy
            </>
          )}
        </button>
        <button
          type="button"
          onClick={stop}
          className="px-3 h-8 rounded-full border border-error/40 text-error text-xs font-bold"
        >
          Stop
        </button>
      </div>
      <p className="text-[11px] text-on-surface-variant">
        Caregivers tapping this link see your live position + accessibility profile in read-only.
      </p>
    </div>
  );
}

function randomToken(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function startPinging(token: string, ref: React.MutableRefObject<number | null>) {
  if (typeof window === "undefined" || !navigator.geolocation) return;
  ref.current = navigator.geolocation.watchPosition(
    (pos) => {
      fetch(`/api/share/${token}/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      }).catch(() => {
        /* ignore network errors — next tick will retry */
      });
    },
    () => {
      /* ignore */
    },
    { enableHighAccuracy: false, maximumAge: 30_000 },
  );
}
