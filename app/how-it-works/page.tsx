"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { SensoryLockup } from "@/components/brand/SensoryMark";
import { WorkflowCardSwap } from "@/components/marketing/WorkflowCardSwap";

export default function HowItWorksPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/onboarding");
  }, [router]);

  const next = () => router.push("/onboarding");

  return (
    <main className="min-h-screen flex flex-col text-on-surface overflow-hidden">
      <header className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-5 max-w-7xl mx-auto w-full">
        <SensoryLockup glyphSize={24} wordSize={17} />

        <button
          type="button"
          onClick={next}
          className="text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-on-surface px-3 sm:px-4 h-9 sm:h-10 rounded-full hover:bg-on-surface/5 transition-colors"
        >
          Skip
        </button>
      </header>

      {/* Cards + button hug each other; no flex-1 wrapping that creates a gap */}
      <section className="flex flex-col items-center pt-2 sm:pt-6 px-2 sm:px-0">
        <WorkflowCardSwap />

        <button
          type="button"
          onClick={next}
          className="mt-4 sm:mt-8 inline-flex items-center gap-2 px-7 sm:px-8 h-12 sm:h-14 rounded-full bg-primary text-on-primary font-bold text-sm sm:text-base hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 active:scale-95"
        >
          Continue
          <Icon name="arrow_forward" size={18} />
        </button>
      </section>
    </main>
  );
}
