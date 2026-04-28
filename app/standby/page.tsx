import { CinematicHero } from "@/components/ui/cinematic-landing-hero";

export const metadata = {
  title: "Sensory · Standby",
  description: "Demo screensaver for Sensory - runs on the laptop while the live app demos on the phone.",
};

/**
 * /standby - full-screen cinematic screensaver. Load this on a second
 * device (laptop / monitor) while the live app demos on a phone.
 * Scroll down to drive the GSAP timeline through its phases.
 */
export default function StandbyPage() {
  return (
    <div className="overflow-x-hidden w-full min-h-screen">
      <CinematicHero />
    </div>
  );
}
