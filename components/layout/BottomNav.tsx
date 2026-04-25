"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const NAV_ITEMS = [
  { href: "/map", icon: "map", label: "Explore" },
  { href: "/saved", icon: "bookmark", label: "Saved" },
  { href: "/settings", icon: "tune", label: "Settings" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 bg-background border-t border-outline/20 shadow-[0_-4px_6px_-1px_rgba(24,97,21,0.05)] z-40 text-xs font-semibold"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all active:scale-90 ${
              active
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:text-primary"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={item.icon} filled={active} size={24} className="mb-1" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
