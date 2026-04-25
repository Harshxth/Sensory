import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { ListenButton } from "@/components/venue/ListenButton";
import { NoiseHistory } from "@/components/venue/NoiseHistory";
import { NoiseContribute } from "@/components/venue/NoiseContribute";
import { ReviewFeed } from "@/components/venue/ReviewFeed";
import type { Venue } from "@/types";

async function getVenue(id: string): Promise<Venue | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection(COLLECTIONS.venues).findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc)) as Venue;
}

const SENSORY_LABELS: {
  key: keyof Venue["sensory"];
  label: string;
  icon: string;
  iconClass: string;
}[] = [
  { key: "noise", label: "Noise", icon: "volume_up", iconClass: "text-primary" },
  { key: "lighting", label: "Lighting", icon: "lightbulb", iconClass: "text-tertiary" },
  { key: "crowd", label: "Crowd", icon: "groups", iconClass: "text-secondary" },
  { key: "smell", label: "Smell", icon: "air", iconClass: "text-secondary" },
  { key: "exits", label: "Exits", icon: "meeting_room", iconClass: "text-primary" },
];

function levelDescription(score: number, key: string) {
  if (key === "exits") {
    if (score >= 7) return { label: "Many easy exits", className: "text-primary" };
    if (score >= 4) return { label: "Adequate exits", className: "text-tertiary" };
    return { label: "Limited exits", className: "text-error" };
  }
  if (score <= 3) return { label: "Low (Comfortable)", className: "text-primary" };
  if (score <= 6) return { label: "Moderate", className: "text-tertiary" };
  return { label: "High intensity", className: "text-error" };
}

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const venue = await getVenue(id);
  if (!venue) notFound();

  return (
    <>
      <TopAppBar
        title={venue.name.length > 24 ? venue.name.slice(0, 22) + "…" : venue.name}
        leading={{ icon: "arrow_back", label: "Back", href: "/map" }}
        trailing={{ icon: "bookmark_border", label: "Save" }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 pb-24 md:pb-8 w-full">
        <section className="relative rounded-2xl overflow-hidden bg-surface-container-low shadow-sm">
          <div className="h-56 md:h-80 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary-container to-tertiary-container/30" />
            <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-tertiary/30 rounded-full blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-surface">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Icon name="verified" size={14} /> Sensory Verified
                </span>
                <span className="bg-surface/20 backdrop-blur-md text-surface px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  {venue.category.replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{venue.name}</h1>
              <p className="text-surface-dim text-sm md:text-base flex items-center gap-1">
                <Icon name="location_on" size={18} /> {venue.address}
              </p>
            </div>
          </div>

          <div className="p-6 bg-surface grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-outline/10 text-center">
            <Stat label="Composite">
              <Icon name="analytics" filled size={20} className="text-primary" />
              <span className="text-xl font-bold">{venue.sensory?.composite?.toFixed(1) ?? "—"}</span>
            </Stat>
            <Stat label="Status">
              <span className="w-3 h-3 rounded-full bg-primary-container border-2 border-primary" />
              <span className="font-semibold">
                {(venue.sensory?.composite ?? 5) <= 4 ? "Calm Now" : "Active"}
              </span>
            </Stat>
            <Stat label="Best Time">
              <Icon name="schedule" size={20} />
              <span className="font-semibold">9 – 11 AM</span>
            </Stat>
            <Stat label="Wheelchair">
              <Icon
                name={venue.osm_tags?.wheelchair === "yes" ? "accessible" : "info"}
                size={20}
              />
              <span className="font-semibold capitalize">
                {venue.osm_tags?.wheelchair ?? "unknown"}
              </span>
            </Stat>
          </div>
        </section>

        {venue.summary && (
          <section className="bg-surface-container-low rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <p className="flex-1 text-on-surface text-base md:text-lg leading-relaxed">
              {venue.summary}
            </p>
            <ListenButton text={venue.summary} />
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <Icon name="analytics" size={24} className="text-primary" />
            Sensory Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {SENSORY_LABELS.map(({ key, label, icon, iconClass }) => {
              const score = venue.sensory?.[key] ?? 0;
              const desc = levelDescription(score, key);
              return (
                <div
                  key={key}
                  className="bg-surface-container-low rounded-2xl p-6 shadow-[0_4px_24px_-8px_rgba(24,97,21,0.1)] border border-outline/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                      <Icon name={icon} size={22} className={iconClass} />
                      {label}
                    </h3>
                    <div className="bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-bold flex items-baseline gap-1">
                      <span className="text-xl">{score.toFixed(1)}</span>
                      <span className="text-xs">/ 10</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-on-surface-variant">Level</span>
                    <span className={desc.className}>{desc.label}</span>
                  </div>
                  <div className="h-3 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-[width]"
                      style={{ width: `${Math.min(100, score * 10)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-low rounded-2xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="graphic_eq" size={22} className="text-primary" />
            24-hour noise history
          </h2>
          <NoiseHistory venueId={venue._id} />
          <div className="mt-4">
            <NoiseContribute venueId={venue._id} />
          </div>
        </section>

        <section className="bg-surface-container-low rounded-2xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <Icon name="forum" size={22} className="text-primary" />
            Recent reviews
          </h2>
          <ReviewFeed venueId={venue._id} />
        </section>

        <Link
          href="/map"
          className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dim"
        >
          <Icon name="arrow_back" size={18} /> Back to map
        </Link>
      </main>

      <BottomNav />
    </>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4">
      <p className="text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-center justify-center gap-1 text-on-surface">{children}</div>
    </div>
  );
}
