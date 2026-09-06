"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Botão magnético: dentro do raio, o elemento é puxado na direção do ponteiro;
 * ao sair, volta com `elastic.out`.
 *
 * Só em ponteiro fino e sem movimento reduzido.
 */
export function useMagnetic<T extends HTMLElement>(options?: {
  raio?: number;
  forca?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const raio = options?.raio ?? 90;
    const forca = options?.forca ?? 0.34;
    const paraX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const paraY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) > raio + Math.max(r.width, r.height) / 2) {
        paraX(0);
        paraY(0);
        return;
      }
      paraX(dx * forca);
      paraY(dy * forca);
    };

    const soltar = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" });
    };

    window.addEventListener("pointermove", mover, { passive: true });
    el.addEventListener("pointerleave", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerleave", soltar);
      gsap.killTweensOf(el);
    };
  }, [options?.raio, options?.forca]);

  return ref;
}
