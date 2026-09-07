"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Entrada genérica de bloco: sobe e aparece ao alcançar a tela.
 * Substitui a tag original (não embrulha), para não quebrar grids.
 * `index` escalona um grupo; o stagger é decorativo e nunca bloqueia clique.
 */
export function Reveal({
  as: Tag = "div",
  index = 0,
  plano = false,
  className = "",
  children,
  ...rest
}: {
  as?: "div" | "article" | "li" | "section";
  index?: number;
  className?: string;
  /** Entrada sem giro no eixo X: só sobe e aparece. */
  plano?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(el, {
        opacity: 0,
        y: 34,
        scale: plano ? 1 : .985,
        rotationX: plano ? 0 : 3,
        transformPerspective: plano ? undefined : 1000,
        transformOrigin: "50% 100%",
        duration: 0.9,
        ease: "power4.out",
        delay: index * 0.055,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          // desfaz ao subir e refaz ao descer de novo
          once: true,
        },
      });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [index] }
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className} {...rest}>
      {children}
    </Tag>
  );
}
