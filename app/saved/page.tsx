import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Icon } from "@/components/ui/Icon";

export default function SavedPage() {
  return (
    <>
      <TopAppBar
        title="Saved"
        leading={{ icon: "arrow_back", label: "Back", href: "/map" }}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center pb-24 md:pb-8">
        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4">
          <Icon name="bookmark" filled size={32} />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Saved venues</h1>
        <p className="text-on-surface-variant max-w-sm">
          Bookmark venues from the map to keep them handy. They&apos;ll show up here.
        </p>
      </main>
      <BottomNav />
    </>
  );
}
