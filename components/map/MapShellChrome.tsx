"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function MapSearchBar({ onChange }: { onChange?: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-30">
      <div className="bg-surface-bright/95 backdrop-blur-md rounded-full shadow-md border border-outline/20 flex items-center p-2">
        <button
          aria-label="Search"
          className="p-3 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
        >
          <Icon name="search" size={22} />
        </button>
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder="Search places, routes…"
          className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant text-base px-2"
        />
        <div className="h-8 w-px bg-outline/20 mx-1" />
        <button
          aria-label="Filters"
          className="p-3 text-primary hover:text-primary-dim transition-colors rounded-full hover:bg-surface-container"
        >
          <Icon name="tune" size={22} />
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
    <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-30">
      <div className="bg-surface-bright/85 backdrop-blur-md rounded-xl shadow-md border border-outline/10 flex flex-col overflow-hidden">
        <button
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="p-4 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors border-b border-outline/10"
        >
          <Icon name="add" size={22} />
        </button>
        <button
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="p-4 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
        >
          <Icon name="remove" size={22} />
        </button>
      </div>
      <button
        onClick={onLocate}
        aria-label="My location"
        className="bg-surface-bright/85 backdrop-blur-md p-4 rounded-xl shadow-md border border-outline/10 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
      >
        <Icon name="my_location" size={22} />
      </button>
      <button
        onClick={onLayers}
        aria-label="Layers"
        className="bg-primary text-on-primary p-4 rounded-xl shadow-lg hover:bg-primary-dim transition-colors"
      >
        <Icon name="layers" size={22} />
      </button>
    </div>
  );
}
