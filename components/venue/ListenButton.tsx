"use client";

// F1.5 — sends summary text + voice_id + lang to /api/voice/speak, plays via <audio>.
import { useState } from "react";

export function ListenButton({ text }: { text: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function speak() {
    setBusy(true);
    try {
      // TODO: pull voice_id + lang from authenticated user profile.
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice_id: "default", lang: "en" }),
      });
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="my-3 flex items-center gap-2">
      <button
        type="button"
        onClick={speak}
        disabled={busy}
        className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background disabled:opacity-50"
      >
        {busy ? "Loading…" : "Listen"}
      </button>
      {audioUrl ? <audio src={audioUrl} controls autoPlay /> : null}
    </div>
  );
}
