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
  className = "",
  children,
  ...rest
}: {
  as?: "div" | "article" | "li" | "section";
  index?: number;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        delay: index * 0.055,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          // desfaz ao subir e refaz ao descer de novo
          toggleActions: "play none none reverse",
        },
      });
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
