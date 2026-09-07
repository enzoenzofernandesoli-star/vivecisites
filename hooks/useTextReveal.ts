"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";

export function useTextReveal<T extends HTMLElement>(options?: {
  start?: string; stagger?: number; duration?: number; delay?: number; modo?: "words" | "chars";
}) {
  const ref = useRef<T>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el || el.querySelector("a, button")) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let split: SplitText | null = null;
      let tween: gsap.core.Tween | null = null;
      let cancelled = false;
      document.fonts.ready.then(() => {
        if (cancelled) return;
        split = SplitText.create(el, {
          type: options?.modo === "chars" ? "chars" : "words",
          aria: "auto",
        });
        const targets = options?.modo === "chars" ? split.chars : split.words;
        tween = gsap.from(targets, {
          y: 18, duration: options?.duration ?? .6, ease: "power3.out",
          stagger: { amount: Math.min(.3, targets.length * (options?.stagger ?? .025)) },
          delay: options?.delay ?? 0,
          scrollTrigger: { trigger: el, start: options?.start ?? "top 90%", once: true },
        });
      });
      return () => { cancelled = true; tween?.scrollTrigger?.kill(); tween?.kill(); split?.revert(); };
    });
    return () => mm.revert();
  }, { scope: ref });
  return ref;
}
