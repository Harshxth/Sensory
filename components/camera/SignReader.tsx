"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { loadPreferences } from "@/lib/preferences";

type Stage = "idle" | "live" | "capturing" | "result" | "error";

/**
 * Floating camera button + camera-capture flow that uses Gemini Vision to
 * read signs/menus/boards and reads them aloud via SpeechSynthesis (or via
 * ElevenLabs TTS in the user's cloned voice — TODO once voice agent is wired).
 */
export function SignReader() {
  const [stage, setStage] = useState<Stage>("idle");
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const open = async () => {
    setStage("live");
    setText("");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setError((e as Error).message ?? "Camera access denied");
      setStage("error");
    }
  };

  const close = () => {
    stopStream();
    setStage("idle");
    setText("");
    setError(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const capture = async () => {
    if (!videoRef.current) return;
    setStage("capturing");
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    const lang = loadPreferences().language ?? "en";
    try {
      const res = await fetch("/api/vision/read-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64: dataUrl, language: lang }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { text: string };
      setText(data.text);
      setStage("result");
      speak(data.text, lang);
    } catch (e) {
      setError((e as Error).message ?? "Couldn't read the sign");
      setStage("error");
    }
  };

  if (stage === "idle") {
    return (
      <button
        type="button"
        aria-label="Read a sign with the camera"
        onClick={open}
        className="fixed bottom-24 md:bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-secondary text-on-secondary shadow-xl shadow-secondary/30 hover:bg-secondary-dim transition-all active:scale-95 flex items-center justify-center"
      >
        <Icon name="document_scanner" filled size={26} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white font-bold text-base flex items-center gap-2">
          <Icon name="document_scanner" filled size={22} />
          Read a sign
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close camera"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {(stage === "live" || stage === "capturing") && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {stage === "capturing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white/95 text-on-surface rounded-full px-5 py-3 font-bold text-sm flex items-center gap-2">
              <Icon name="auto_awesome" filled size={18} className="text-primary animate-spin" />
              Reading sign…
            </div>
          </div>
        )}
        {stage === "result" && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
                Sensory read this
              </div>
              <p className="text-base leading-relaxed">{text || "No text found."}</p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (text) speak(text, loadPreferences().language ?? "en");
                  }}
                  className="flex-1 h-11 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dim flex items-center justify-center gap-2"
                >
                  <Icon name="volume_up" filled size={18} />
                  Read aloud again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStage("live");
                    setText("");
                  }}
                  className="flex-1 h-11 rounded-full border border-on-surface/15 text-on-surface font-bold text-sm hover:bg-on-surface/5"
                >
                  Read another
                </button>
              </div>
            </div>
          </div>
        )}
        {stage === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-3 text-center">
              <Icon name="error" filled size={32} className="text-error mx-auto" />
              <p className="text-sm text-on-surface-variant">{error}</p>
              <button
                type="button"
                onClick={close}
                className="h-11 px-5 rounded-full bg-primary text-on-primary font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {stage === "live" && (
        <div className="p-6 flex justify-center">
          <button
            type="button"
            onClick={capture}
            aria-label="Capture sign"
            className="w-20 h-20 rounded-full bg-white text-primary border-4 border-primary shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            <Icon name="photo_camera" filled size={36} />
          </button>
        </div>
      )}
    </div>
  );
}

function speak(text: string, language: string) {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language === "es" ? "es-ES" : language === "zh" ? "zh-CN" : "en-US";
    u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
