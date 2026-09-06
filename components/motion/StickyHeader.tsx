"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { VVCLogo } from "../VVCLogo";
import styles from "../viveci.module.css";

/**
 * Barra compacta que entra depois do herói.
 *
 * O header original é `position: absolute` dentro do herói e sai de cena com
 * ele — passado o topo, a página fica sem navegação. Esta barra cobre esse
 * trecho: escondida acima do herói, desce quando ele termina.
 */
export function StickyHeader() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      // Seletor, nao ref: este componente monta antes da seção do herói,
      // entao a ref do pai ainda estaria vazia aqui.
      const gatilho = document.querySelector("#inicio");
      if (!el || !gatilho) return;

      // Sem movimento: a barra simplesmente existe a partir do herói.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const st = ScrollTrigger.create({
          trigger: gatilho,
          start: "bottom top+=80",
          onEnter: () => gsap.set(el, { y: 0, yPercent: 0, opacity: 1, pointerEvents: "auto" }),
          onLeaveBack: () => gsap.set(el, { y: 0, yPercent: -100, opacity: 0, pointerEvents: "none" }),
        });
        return () => st.kill();
      }

      const entrada = gsap.fromTo(el,
        { y: 0, yPercent: -100, opacity: 0 },
        {
        y: 0,
        yPercent: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out",
        paused: true,
        onStart: () => gsap.set(el, { pointerEvents: "auto" }),
        onReverseComplete: () => gsap.set(el, { pointerEvents: "none" }),
        }
      );

      const st = ScrollTrigger.create({
        trigger: gatilho,
        start: "bottom top+=80",
        onEnter: () => entrada.play(),
        onLeaveBack: () => entrada.reverse(),
      });

      return () => { st.kill(); entrada.kill(); };
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={styles.stickyHeader} aria-hidden={false}>
      <a className={styles.stickyBrand} href="#inicio" aria-label="Viveci — início">
        <VVCLogo />
      </a>
      <nav aria-label="Navegação secundária">
        <a href="#servicos">Serviços</a>
        <a href="#projetos">Projetos</a>
        <a href="#processo">Processo</a>
        <a href="#duvidas">Dúvidas</a>
      </nav>
      <a className={styles.stickyCta} href="#contato">
        Iniciar projeto <b>→</b>
      </a>
    </div>
  );
}
