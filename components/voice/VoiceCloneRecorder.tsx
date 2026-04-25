"use client";

// F1.5 — record 30s, POST to /api/voice/clone.
// Master plan §15 #3: re-auth gate must wrap this in production.
import { useRef, useState } from "react";

export function VoiceCloneRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<"idle" | "recording" | "uploading" | "done">("idle");

  async function start() {
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
      await fetch("/api/voice/clone", { method: "POST", body: form });
      setStatus("done");
    };
    recorderRef.current = recorder;
    recorder.start();
    setStatus("recording");
    setTimeout(() => recorder.stop(), 30_000);
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={status !== "idle"}
      className="rounded-full border border-foreground/20 px-4 py-2 text-sm disabled:opacity-50"
    >
      {status === "idle" && "Record 30s"}
      {status === "recording" && "Recording…"}
      {status === "uploading" && "Cloning voice…"}
      {status === "done" && "Voice saved ✓"}
    </button>
  );
}
