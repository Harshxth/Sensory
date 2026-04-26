"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Bookmark as BookmarkIcon,
  Globe as GlobeIcon,
  HelpCircle,
  LogOut,
  Bell,
  Check,
  Sparkles,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadPreferences } from "@/lib/preferences";

type Props = {
  /** Display name shown in the header. Defaults to "Anonymous explorer". */
  name?: string;
  /** Subtle handle / sub-label, e.g. "@anonymous". */
  username?: string;
  /** Status badge — drives a colored dot. */
  status?: "online" | "offline" | "focus";
  onAction?: (action: string) => void;
};

/**
 * Sensory user dropdown — opens from the profile avatar in the top app bar.
 *
 * Built on @radix-ui/react-dropdown-menu (already in deps). Items render
 * with our existing token system (`bg-surface-container-lowest`,
 * `text-on-surface`, etc.) so it adapts to system light/dark.
 */
export function UserDropdown({
  name = "Anonymous explorer",
  username = "@anonymous",
  status = "online",
  onAction,
}: Props) {
  // Re-read preferences when the menu opens so the voice-clone badge reflects
  // the latest onboarding step (cloning happens client-side).
  const [voiceCloneId, setVoiceCloneId] = React.useState<string | null>(null);
  const refreshPrefs = React.useCallback(() => {
    setVoiceCloneId(loadPreferences().voiceCloneId ?? null);
  }, []);
  React.useEffect(() => {
    refreshPrefs();
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sensory:prefs") refreshPrefs();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshPrefs]);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusStyles: Record<string, string> = {
    online:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    offline:
      "bg-on-surface/10 text-on-surface-variant border-on-surface/20",
    focus: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  };

  const handle = (action: string) => {
    if (onAction) onAction(action);
  };

  return (
    <DropdownMenuPrimitive.Root onOpenChange={(open) => open && refreshPrefs()}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          aria-label="Open profile menu"
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm hover:border-primary-dim transition-colors"
        >
          {initials || "U"}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-[60] w-[300px] rounded-2xl bg-surface-container-lowest text-on-surface",
            "border border-on-surface/10 shadow-2xl backdrop-blur-md p-2",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm border border-primary/30">
              {initials || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight truncate">
                {name}
              </div>
              <div className="text-[11px] text-on-surface-variant truncate">
                {username}
              </div>
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                statusStyles[status],
              )}
            >
              {status}
            </span>
          </div>

          <Separator />

          {/* Voice-clone status row — visible at a glance so the user knows
              their cloned voice is wired up to nav + the sign reader. */}
          <div className="px-2 py-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs",
                voiceCloneId
                  ? "bg-primary-container/40 text-on-primary-container border-primary/30"
                  : "bg-on-surface/5 text-on-surface-variant border-on-surface/10",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full",
                  voiceCloneId ? "bg-primary text-on-primary" : "bg-on-surface/10",
                )}
              >
                <Mic className="size-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[11px] uppercase tracking-wider">
                  Comfort voice
                </div>
                <div className="text-[11px] truncate">
                  {voiceCloneId
                    ? "Active — used for nav + signs"
                    : "Not set yet"}
                </div>
              </div>
              {voiceCloneId ? (
                <button
                  type="button"
                  onClick={() => testCloneVoice(voiceCloneId)}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary text-on-primary hover:bg-primary-dim"
                  title="Play a sample in your cloned voice"
                >
                  Test
                </button>
              ) : (
                <Link
                  href="/onboarding"
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-on-surface/8 hover:bg-on-surface/12"
                >
                  Add
                </Link>
              )}
            </div>
          </div>

          <Separator />

          {/* Profile group */}
          <Group>
            <Item asLink href="/profile" icon={<UserIcon className="size-4" />} label="Your profile" />
            <Item asLink href="/saved" icon={<BookmarkIcon className="size-4" />} label="Saved venues" />
            <Item asLink href="/settings" icon={<SettingsIcon className="size-4" />} label="Settings" />
            <Item
              icon={<Bell className="size-4" />}
              label="Notifications"
              onSelect={() => handle("notifications")}
            />
          </Group>

          <Separator />

          {/* Premium-feeling */}
          <Group>
            <Item
              icon={<Sparkles className="size-4 text-amber-500" />}
              label="What's new"
              right={<span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">v1</span>}
              onSelect={() => handle("whats-new")}
            />
            <Item asLink href="/standby" icon={<GlobeIcon className="size-4" />} label="Open standby screen" />
          </Group>

          <Separator />

          {/* Help + sign out */}
          <Group>
            <Item
              icon={<HelpCircle className="size-4" />}
              label="Get help"
              onSelect={() => handle("help")}
            />
            <Item
              icon={<LogOut className="size-4" />}
              label="Reset profile"
              tone="danger"
              onSelect={() => handle("logout")}
            />
          </Group>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

/* ── voice clone test ────────────────────────────────────────────── */

/**
 * Plays a quick "this is your comfort voice" sample through ElevenLabs
 * so the user can verify the clone is wired up without starting navigation.
 * Errors are logged to the console so you can see exactly what failed.
 */
async function testCloneVoice(voiceId: string) {
  const sample =
    "Hi, this is your comfort voice. I'll guide you through every step.";
  try {
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sample, voice_id: voiceId, lang: "en" }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[voice] /api/voice/speak failed", res.status, body);
      alert(
        `Voice test failed (${res.status}). Check the browser console for details.`,
      );
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch (e) {
    console.error("[voice] test threw", e);
    alert("Voice test threw — check the console.");
  }
}

/* ── primitives ───────────────────────────────────────────────────── */

function Group({ children }: { children: React.ReactNode }) {
  return <DropdownMenuPrimitive.Group className="py-1">{children}</DropdownMenuPrimitive.Group>;
}

function Separator() {
  return (
    <DropdownMenuPrimitive.Separator className="my-1 mx-1 h-px bg-on-surface/10" />
  );
}

function Item({
  icon,
  label,
  right,
  asLink,
  href,
  onSelect,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  asLink?: boolean;
  href?: string;
  onSelect?: () => void;
  tone?: "default" | "danger";
}) {
  const inner = (
    <span className="flex items-center gap-2.5 w-full">
      <span
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg",
          tone === "danger"
            ? "bg-rose-500/10 text-rose-500"
            : "bg-on-surface/5 text-on-surface-variant",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "flex-1 text-sm font-medium",
          tone === "danger" ? "text-rose-600 dark:text-rose-300" : "text-on-surface",
        )}
      >
        {label}
      </span>
      {right}
      <Check className="size-4 opacity-0" />
    </span>
  );

  if (asLink && href) {
    return (
      <DropdownMenuPrimitive.Item
        asChild
        className={cn(
          "rounded-xl px-2 py-1.5 outline-none cursor-pointer",
          "data-[highlighted]:bg-on-surface/5",
        )}
      >
        <Link href={href}>{inner}</Link>
      </DropdownMenuPrimitive.Item>
    );
  }

  return (
    <DropdownMenuPrimitive.Item
      onSelect={(e) => {
        if (onSelect) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "rounded-xl px-2 py-1.5 outline-none cursor-pointer",
        "data-[highlighted]:bg-on-surface/5",
      )}
    >
      {inner}
    </DropdownMenuPrimitive.Item>
  );
}
