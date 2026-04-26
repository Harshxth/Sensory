"use client";

// F1.5 — record 30s, POST to /api/voice/clone, persist returned voiceId on
// the device. Master plan §15 #3: re-auth gate must wrap this in production.
import { useRef, useState } from "react";
import { CLIENT_ID_HEADER, getOrCreateClientId } from "@/lib/identity";
import { loadPreferences, savePreferences } from "@/lib/preferences";

type Status = "idle" | "recording" | "uploading" | "done" | "error";

export function VoiceCloneRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setStatus("uploading");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("sample", blob, "sample.webm");
        form.append("name", "comfort-voice");
        try {
          const res = await fetch("/api/voice/clone", {
            method: "POST",
            headers: { [CLIENT_ID_HEADER]: getOrCreateClientId() },
            body: form,
          });
          if (!res.ok) {
            setStatus("error");
            return;
          }
          const { voiceId } = (await res.json()) as { voiceId: string };
          const prefs = loadPreferences();
          savePreferences({ ...prefs, voiceCloneId: voiceId });
          setStatus("done");
        } catch {
          setStatus("error");
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      setTimeout(() => recorder.stop(), 30_000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={status === "recording" || status === "uploading"}
      className="rounded-full border border-foreground/20 px-4 py-2 text-sm disabled:opacity-50"
    >
      {status === "idle" && "Record 30s"}
      {status === "recording" && "Recording…"}
      {status === "uploading" && "Cloning voice…"}
      {status === "done" && "Voice saved ✓"}
      {status === "error" && "Try again"}
    </button>
  );
}
