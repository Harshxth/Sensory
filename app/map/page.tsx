import { MapView } from "@/components/map/MapView";
import { MapControls, MapSearchBar } from "@/components/map/MapShellChrome";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Icon } from "@/components/ui/Icon";

export default function MapPage() {
  return (
    <>
      <TopAppBar
        title="SensoryPath"
        leading={{ icon: "menu", label: "Menu", href: "/settings" }}
        trailing={
          <button
            aria-label="Profile"
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary bg-primary-container flex items-center justify-center text-on-primary-container"
          >
            <Icon name="person" filled size={20} />
          </button>
        }
      />

      <main className="relative flex-1 w-full overflow-hidden pb-20 md:pb-0">
        <MapView />
        <MapSearchBar />
        <MapControls />

        <div className="absolute bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-auto z-30">
          <div className="bg-surface-bright/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-outline/10 flex flex-col md:flex-row items-start md:items-center gap-6 md:min-w-[420px]">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="nature" filled size={18} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Quiet Zone
                </span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Tap a venue</h3>
              <p className="text-base text-on-surface-variant line-clamp-2">
                Pan around USF and downtown Tampa to see real venues color-coded by sensory load.
              </p>
            </div>
            <div className="flex md:flex-col gap-3 w-full md:w-auto shrink-0">
              <button className="flex-1 md:flex-none bg-primary text-on-primary px-6 h-12 rounded-lg font-bold hover:bg-primary-dim transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Icon name="directions" size={20} />
                Route
              </button>
              <button className="flex-1 md:flex-none bg-surface text-primary border border-primary/30 px-6 h-12 rounded-lg font-bold hover:bg-primary-container/50 transition-colors flex items-center justify-center gap-2">
                <Icon name="bookmark_border" size={20} />
                Save
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
