"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import styles from "../viveci.module.css";

/**
 * Termômetro de leitura no topo da página.
 *
 * Escreve `scaleX` por `gsap.quickSetter`: animar `width` obrigaria o
 * navegador a refazer layout a cada quadro de rolagem.
 *
 * Não usa ScrollTrigger de propósito — é um valor por quadro, sem gatilho,
 * e o Lenis já emite `scroll` no mesmo laço.
 */
export function BarraProgresso() {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barra.current;
    if (!el) return;

    const escrever = gsap.quickSetter(el, "scaleX") as (valor: number) => void;
    let pendente = false;

    const medir = () => {
      pendente = false;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      escrever(total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 0);
    };

    // uma leitura por quadro: o evento de scroll dispara mais que isso
    const agendar = () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar, { passive: true });

    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, []);

  return (
    <div className={styles.progressoTopo} aria-hidden>
      <div ref={barra} className={styles.progressoFio} />
    </div>
  );
}
