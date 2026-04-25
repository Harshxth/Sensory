import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Sensory</h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          The map for how a place <em>feels</em> — built for autistic, sensory-sensitive,
          wheelchair, deaf, blind, and ESL communities Google Maps wasn&apos;t designed for.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/onboarding"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          href="/map"
          className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium transition hover:bg-foreground/5"
        >
          Open the map
        </Link>
      </div>
    </main>
  );
}
