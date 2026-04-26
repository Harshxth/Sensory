import { Ear, Eye, Accessibility, EarOff, Languages, BookOpen, SunMedium } from "lucide-react";
import type { SensoryNeed } from "@/context/SensoryContext";

export const NEED_META: Record<SensoryNeed, { label: string; hint: string; icon: any }> = {
  noise:      { label: "Noise-sensitive",      hint: "We'll flag loud places",         icon: EarOff },
  light:      { label: "Light-sensitive",      hint: "Watch for bright or flashing",   icon: SunMedium },
  wheelchair: { label: "Wheelchair user",      hint: "Step-free routes by default",    icon: Accessibility },
  deaf:       { label: "Deaf or hard-of-hearing", hint: "Captions and visual cues",    icon: Ear },
  blind:      { label: "Blind / low vision",   hint: "Audio descriptions, contrast",   icon: Eye },
  esl:        { label: "Reading in a 2nd language", hint: "Plain, simple language",    icon: Languages },
  dyslexia:   { label: "Dyslexia-friendly reading", hint: "Calm fonts, more spacing",  icon: BookOpen },
};

export const NEED_ORDER: SensoryNeed[] = [
  "noise", "light", "wheelchair", "deaf", "blind", "esl", "dyslexia",
];
