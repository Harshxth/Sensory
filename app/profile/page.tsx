import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Icon } from "@/components/ui/Icon";

export default function ProfilePage() {
  return (
    <>
      <TopAppBar
        title="Profile"
        leading={{ icon: "arrow_back", label: "Back", href: "/map" }}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center pb-24 md:pb-8">
        <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4">
          <Icon name="person" filled size={40} />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Sign in to Sensory</h1>
        <p className="text-on-surface-variant max-w-sm mb-6">
          Save your accessibility profile, voice clone, and review history across devices.
        </p>
        <button className="bg-primary text-on-primary px-8 h-12 rounded-full font-bold hover:bg-primary-dim transition-colors">
          Continue with email
        </button>
      </main>
      <BottomNav />
    </>
  );
}
