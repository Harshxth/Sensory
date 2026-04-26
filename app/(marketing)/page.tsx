import { BootSplash } from "@/components/BootSplash";

export const metadata = {
  title: "Sensory — The map for how a place feels",
  description:
    "Accessibility map for autistic, sensory-sensitive, wheelchair, deaf, blind, and ESL communities.",
};

/**
 * The home route is intentionally just the BootSplash. After dismissal it
 * routes straight to /how-it-works (first-timers) or /map (returning users).
 * No marketing page; the app is the product.
 */
export default function HomePage() {
  return <BootSplash />;
}
