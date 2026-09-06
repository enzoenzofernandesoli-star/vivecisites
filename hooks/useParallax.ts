"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Parallax vertical amarrado ao scroll.
 *
 * `amount` é o deslocamento em % da própria altura do elemento — nunca pixels,
 * para não depender do tamanho da tela. Acima de ~15% começa a enjoar.
 *
 * Desligado abaixo de 768px e sob prefers-reduced-motion, via matchMedia.
 */
export function useParallax<T extends HTMLElement>(options?: {
  amount?: number;
  trigger?: () => Element | null;
}) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(el, {
          yPercent: options?.amount ?? -12,
          ease: "none",
          scrollTrigger: {
            trigger: options?.trigger?.() ?? el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        // will-change some quando o trigger sai de cena
        const st = tween.scrollTrigger as ScrollTrigger;
        return () => { st?.kill(); tween.kill(); };
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return ref;
}
