// F1.1 — main app shell. Renders the Mapbox map + venue panel.

import { MapView } from "@/components/map/MapView";

export default function MapPage() {
  return (
    <main className="relative flex-1">
      <MapView />
    </main>
  );
}
