"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Sonda temporária da FASE 1: confirma que o ScrollTrigger está recebendo
 * updates do Lenis no mesmo loop de frame. Remover ao entrar na FASE 2.
 */
export function ScrollTriggerProbe() {
  useEffect(() => {
    const el = document.querySelector("[data-probe-target]");
    if (!el) { console.warn("[fase1] alvo da sonda nao encontrado"); return; }

    let updates = 0;
    // gancho de verificacao da fase; sai junto com a sonda na FASE 2
    const probe = ((window as unknown as { __fase1?: Record<string, unknown> }).__fase1 ??= {});
    probe.mounted = true;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el as HTMLElement,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => console.log("[fase1] ScrollTrigger onEnter"),
        onLeave: () => console.log("[fase1] ScrollTrigger onLeave"),
        onUpdate: (self) => {
          updates += 1;
          probe.updates = updates;
          probe.progress = +self.progress.toFixed(3);
          probe.direction = self.direction;
          console.log("[fase1] progresso", self.progress.toFixed(2), "| direcao", self.direction);
        },
      });
    });

    probe.triggers = ScrollTrigger.getAll().length;
    console.log("[fase1] sonda armada. lenis ativo:",
      document.documentElement.classList.contains("lenis"));

    return () => ctx.revert();
  }, []);

  return null;
}
