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
        gsap.set(el, { transformPerspective: 900 });
        tween = gsap.from(targets, {
          yPercent: 112,
          rotationX: -34,
          opacity: .08,
          transformOrigin: "50% 100%",
          duration: options?.duration ?? .78,
          ease: "power4.out",
          stagger: { amount: Math.min(.42, targets.length * (options?.stagger ?? .032)) },
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
