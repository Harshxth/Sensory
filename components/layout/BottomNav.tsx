"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Bookmark, Settings, User, type LucideIcon } from "lucide-react";

type NavTarget = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const NAV_ITEMS: NavTarget[] = [
  { href: "/map", icon: Map, label: "Explore" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/profile", icon: User, label: "Profile" },
];

/**
 * Bottom nav with the spotlight indicator: an active LED-bar at the top of
 * the active tab and a soft halo glow above each tab that fades with
 * distance from the active index. Adapts to system light/dark via tokens.
 */
export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex(
      (it) => pathname === it.href || pathname.startsWith(`${it.href}/`),
    ),
  );

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 w-full z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative mx-auto max-w-[420px] mb-3 px-3">
        <div className="relative flex items-center justify-between gap-1 rounded-2xl bg-on-surface/90 dark:bg-black/85 backdrop-blur-md border border-on-surface/10 dark:border-white/10 shadow-[0_10px_32px_rgba(15,23,42,0.18)] px-2 py-2">
          {/* LED indicator bar at the top of the active tab */}
          <div
            aria-hidden
            className="absolute top-0 h-[2px] bg-white rounded-full transition-[left,width] duration-[400ms] ease-[cubic-bezier(0.2,0,0,1)]"
            style={{
              // Tab cell width = (container width - paddings - gaps) / itemCount
              // For 4 items in a 420 max with px-2 + gap-1, we approximate via percentages.
              left: `calc(${(activeIndex / NAV_ITEMS.length) * 100}% + 12px)`,
              width: `calc(${100 / NAV_ITEMS.length}% - 24px)`,
              transform: "translateY(-1px)",
            }}
          />
          {NAV_ITEMS.map((item, index) => (
            <NavItem
              key={item.href}
              item={item}
              index={index}
              activeIndex={activeIndex}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  item,
  index,
  activeIndex,
}: {
  item: NavTarget;
  index: number;
  activeIndex: number;
}) {
  const Icon = item.icon;
  const distance = Math.abs(activeIndex - index);
  const isActive = activeIndex === index;
  const spotlightOpacity = isActive ? 1 : Math.max(0, 1 - distance * 0.6);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      className="relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-300"
    >
      {/* Spotlight halo above the tab */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-24 rounded-full blur-lg bg-gradient-to-b from-white/40 to-transparent transition-opacity duration-300"
        style={{
          opacity: spotlightOpacity,
          transitionDelay: isActive ? "100ms" : "0ms",
        }}
      />
      <Icon
        className={`w-5 h-5 transition-colors duration-200 ${
          isActive ? "text-white" : "text-white/55"
        }`}
        strokeWidth={isActive ? 2.4 : 2}
      />
      <span
        className={`mt-1 text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
          isActive ? "text-white" : "text-white/55"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}
