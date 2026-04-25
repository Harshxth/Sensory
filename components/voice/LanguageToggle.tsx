"use client";

import { useState } from "react";
import type { Language } from "@/types";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
];

export function LanguageToggle({
  value,
  onChange,
}: {
  value?: Language;
  onChange?: (lang: Language) => void;
} = {}) {
  const [internal, setInternal] = useState<Language>(value ?? "en");
  const current = value ?? internal;

  return (
    <div role="radiogroup" aria-label="Preferred language" className="flex flex-wrap gap-2">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={current === l.code}
          onClick={() => {
            setInternal(l.code);
            onChange?.(l.code);
          }}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            current === l.code
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/20"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
