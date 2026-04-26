"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function MapSearchBar({ onChange }: { onChange?: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-full shadow-lg border border-on-surface/8 flex items-center p-1.5 hover:shadow-xl transition-shadow">
        <button
          aria-label="Search"
          className="p-2.5 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-on-surface/5"
        >
          <Icon name="search" size={20} />
        </button>
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder="Search places, routes…"
          className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/70 text-base px-1"
        />
        <div className="h-6 w-px bg-on-surface/10 mx-1" />
        <button
          aria-label="Filters"
          className="p-2.5 text-primary hover:text-primary-dim transition-colors rounded-full hover:bg-on-surface/5"
        >
          <Icon name="tune" size={20} />
        </button>
      </div>
    </div>
  );
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onLayers,
}: {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocate?: () => void;
  onLayers?: () => void;
}) {
  return (
    <div className="hidden md:flex absolute right-6 bottom-24 flex-col gap-3 z-30">
      <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl shadow-lg border border-on-surface/8 flex flex-col overflow-hidden">
        <button
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="p-3 text-on-surface hover:bg-on-surface/5 transition-colors border-b border-on-surface/8"
        >
          <Icon name="add" size={20} />
        </button>
        <button
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="p-3 text-on-surface hover:bg-on-surface/5 transition-colors"
        >
          <Icon name="remove" size={20} />
        </button>
      </div>
      <button
        onClick={onLocate}
        aria-label="My location"
        className="bg-surface-container-lowest/95 backdrop-blur-xl p-3 rounded-xl shadow-lg border border-on-surface/8 text-primary hover:bg-on-surface/5 transition-colors"
      >
        <Icon name="my_location" filled size={20} />
      </button>
    </div>
  );
}
