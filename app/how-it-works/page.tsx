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
    <main className="min-h-screen flex flex-col text-on-surface">
      <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <SensoryLockup glyphSize={28} wordSize={20} />

        <button
          type="button"
          onClick={next}
          className="text-sm font-semibold text-on-surface-variant hover:text-on-surface px-4 h-10 rounded-full hover:bg-on-surface/5 transition-colors"
        >
          Skip
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center pb-4">
        <WorkflowCardSwap />
      </section>

      <footer className="flex items-center justify-center max-w-3xl mx-auto w-full px-6 py-8">
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-2 px-8 h-14 rounded-full bg-primary text-on-primary font-bold text-base hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 active:scale-95"
        >
          Continue
          <Icon name="arrow_forward" size={20} />
        </button>
      </footer>
    </main>
  );
}
