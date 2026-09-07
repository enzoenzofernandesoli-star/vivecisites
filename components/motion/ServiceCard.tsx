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
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {

      const icon = el.querySelector(`.${styles.serviceIcon}`);
      const resto = el.querySelectorAll("h3, p, a");
      const atraso = index * 0.09;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });

      tl.from(el, { opacity: 0, y: 46, scale: .97, rotationX: 7, transformPerspective: 1100, transformOrigin: "50% 100%", duration: 0.76, delay: atraso })
        .from(icon, { scale: 0.52, rotation: -18, opacity: 0, duration: 0.58, ease: "back.out(1.45)" }, "-=0.42")
        .from(resto, { opacity: 0, y: 18, x: -8, duration: 0.52, stagger: 0.075 }, "-=0.32");

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
      });
      return () => mm.revert();
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
