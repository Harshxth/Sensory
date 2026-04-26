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
    <main
      className="flex flex-col text-on-surface overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
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

      {/*
        Cards sit ~10% above the vertical midline of the viewport.
        flex-1 grabs all remaining height; justify-center centers; the
        translateY(-10%) on the inner block lifts the stack 10% upward
        relative to the centered position.
      */}
      <section className="flex-1 flex flex-col items-center justify-center px-2 sm:px-0">
        <div className="flex flex-col items-center" style={{ transform: "translateY(-10%)" }}>
          <WorkflowCardSwap />

          <button
            type="button"
            onClick={next}
            className="mt-6 sm:mt-10 inline-flex items-center gap-2 px-7 sm:px-8 h-12 sm:h-14 rounded-full bg-primary text-on-primary font-bold text-sm sm:text-base hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 active:scale-95"
          >
            Continue
            <Icon name="arrow_forward" size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
