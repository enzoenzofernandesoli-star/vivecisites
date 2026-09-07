"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const x = gsap.quickTo(el, "x", { duration: .35, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: .35, ease: "power3.out" });
      let box: DOMRect;
      const enter = () => { box = el.getBoundingClientRect(); };
      const move = (e: PointerEvent) => {
        if (!box) return;
        x(Math.max(-8, Math.min(8, (e.clientX - box.left - box.width / 2) * .12)));
        y(Math.max(-5, Math.min(5, (e.clientY - box.top - box.height / 2) * .12)));
      };
      const leave = () => { x(0); y(0); };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("blur", leave);
      return () => { el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); el.removeEventListener("blur", leave); x.tween.kill(); y.tween.kill(); gsap.set(el, { clearProps: "transform" }); };
    });
    return () => mm.revert();
  }, { scope: ref });
  return ref;
}
