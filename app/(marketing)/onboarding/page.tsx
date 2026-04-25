// F1.11 — 3-screen onboarding: needs → optional voice clone → preferred language.
// TODO: wire to Supabase profile + ElevenLabs Instant Voice Clone (F1.5).

import { VoiceCloneRecorder } from "@/components/voice/VoiceCloneRecorder";
import { LanguageToggle } from "@/components/voice/LanguageToggle";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold">Set up Sensory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Three quick steps. Skip any of them — you can always change them later.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">1. What do you need?</h2>
        <p className="text-sm text-muted-foreground">
          Multi-select. We use this to personalize filters and routes.
        </p>
        {/* TODO: needs multi-select chips (noise/light/wheelchair/deaf/blind/esl) */}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">2. Add a comfort voice (optional)</h2>
        <p className="text-sm text-muted-foreground">
          Record 30s of a voice you find calming. Sensory will read venue summaries in this voice.
        </p>
        <VoiceCloneRecorder />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">3. Preferred language</h2>
        <LanguageToggle />
      </section>
    </main>
  );
}
