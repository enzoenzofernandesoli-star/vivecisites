"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ duration: .85, smoothWheel: true, anchors: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => { if (!document.hidden) lenis.raf(time * 1000); };
      gsap.ticker.add(raf);
      return () => { gsap.ticker.remove(raf); lenis.destroy(); };
    });
    let alive = true;
    document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; mm.revert(); };
  }, []);
  return <>{children}</>;
}
