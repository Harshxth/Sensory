"use client";

import { use, useEffect, useState } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { GoogleMap, GoogleMapsProvider } from "@/components/google/GoogleMapBase";
import { Icon } from "@/components/ui/Icon";

type Session = {
  name: string;
  needs: string[];
  position: { lat: number; lng: number } | null;
  updated_at: string | null;
};

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/share/${token}`, { cache: "no-store" });
        if (!res.ok) throw new Error("not found");
        if (cancelled) return;
        setSession((await res.json()) as Session);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };
    load();
    const interval = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-surface-container-low rounded-2xl p-8 max-w-md text-center space-y-3">
          <Icon name="link_off" filled size={32} className="text-error mx-auto" />
          <h1 className="text-xl font-bold text-on-surface">Share session not found</h1>
          <p className="text-sm text-on-surface-variant">
            This link may have expired or never existed. Ask the person to send a fresh share link.
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-on-surface-variant">
        Loading…
      </main>
    );
  }

  const updatedMin = session.updated_at
    ? Math.max(0, Math.round((Date.now() - new Date(session.updated_at).getTime()) / 60_000))
    : null;

  return (
    <>
      <TopAppBar title={`${session.name} · Share`} />
      <main className="relative w-full" style={{ height: "100dvh" }}>
        <GoogleMapsProvider>
          <GoogleMap defaultZoom={15}>
            {session.position && (
              <AdvancedMarker position={session.position}>
                <div className="relative">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full animate-ping bg-primary opacity-50"
                    style={{ transform: "scale(1.6)" }}
                  />
                  <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary ring-4 ring-white shadow-lg">
                    <Icon name="person_pin_circle" filled size={22} />
                  </span>
                </div>
              </AdvancedMarker>
            )}
          </GoogleMap>
        </GoogleMapsProvider>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
          <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-xl border border-on-surface/8 p-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">
                <Icon name="person" filled size={22} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-on-surface truncate">{session.name}</div>
                <div className="text-[11px] text-on-surface-variant">
                  {session.position ? (
                    updatedMin === 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live now
                      </span>
                    ) : (
                      `Last seen ${updatedMin} min ago`
                    )
                  ) : (
                    "Waiting for location…"
                  )}
                </div>
              </div>
            </div>
            {session.needs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-on-surface/8">
                {session.needs.map((n) => (
                  <span
                    key={n}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container"
                  >
                    {n}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
