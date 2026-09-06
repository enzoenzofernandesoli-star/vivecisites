"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * Reveal de texto palavra por palavra, com máscara por linha.
 *
 * O split roda depois de document.fonts.ready: se rodar antes, as linhas
 * quebram na métrica da fonte de fallback e ficam no lugar errado.
 */
export function useTextReveal<T extends HTMLElement>(options?: {
  start?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  /** "words" (padrão) para frases; "chars" para wordmark, letra a letra. */
  modo?: "words" | "chars";
}) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let split: SplitText | null = null;
      let cancelled = false;

      document.fonts.ready.then(() => {
        if (cancelled || !ref.current) return;

        const porLetra = options?.modo === "chars";
        split = new SplitText(el, {
          type: porLetra ? "chars" : "lines,words",
          linesClass: "reveal-line",
        });
        const alvos = porLetra ? split.chars : split.words;

        gsap.from(alvos, {
          yPercent: 115,
          duration: options?.duration ?? 1,
          ease: "expo.out",
          stagger: options?.stagger ?? 0.025,
          delay: options?.delay ?? 0,
          scrollTrigger: { trigger: el, start: options?.start ?? "top 80%", once: true },
        });
      });

      // SplitText reescreve o DOM do texto: sem revert, cada re-render acumula spans.
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref }
  );

  return ref;
}
