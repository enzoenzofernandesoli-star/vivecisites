"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "../viveci.module.css";

/**
 * Card de serviço com entrada em partes: o card sobe, o ícone assenta com um
 * leve overshoot e o texto vem atrás. Uma coisa de cada vez lê melhor do que
 * o bloco inteiro aparecendo de uma vez.
 */
export function ServiceCard({
  index,
  icone,
  titulo,
  texto,
}: {
  index: number;
  icone: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const icon = el.querySelector(`.${styles.serviceIcon}`);
      const resto = el.querySelectorAll("h3, p, a");
      const atraso = index * 0.09;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
      });

      tl.from(el, { opacity: 0, y: 34, duration: 0.65, delay: atraso })
        .from(icon, { scale: 0.72, opacity: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.34")
        .from(resto, { opacity: 0, y: 14, duration: 0.45, stagger: 0.07 }, "-=0.28");

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    },
    { scope: ref, dependencies: [index] }
  );

  return (
    <article ref={ref as React.RefObject<HTMLElement>} className={styles.serviceObjective}>
      <div className={styles.serviceIcon}>{icone}</div>
      <h3>{titulo}</h3>
      <p className={styles.servicePurpose}>{texto}</p>
      <a className={styles.serviceLink} href="#contato">
        Saiba mais <span>↗</span>
      </a>
    </article>
  );
}
