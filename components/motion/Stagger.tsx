"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Entrada em cascata dos filhos diretos, ao alcançar a tela.
 * Usa `gsap.from`: sem JS o conteúdo já está no lugar, visível.
 */
export function Stagger({
  as: Tag = "div",
  className = "",
  intervalo = 0.06,
  deslocamento = 16,
  children,
  ...rest
}: {
  as?: "div" | "ul" | "section";
  className?: string;
  intervalo?: number;
  deslocamento?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const filhos = Array.from(el.children);
      if (!filhos.length) return;

      gsap.from(filhos, {
        opacity: 0,
        y: deslocamento,
        duration: 0.6,
        ease: "power3.out",
        stagger: intervalo,
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
      });
    },
    { scope: ref }
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className} {...rest}>
      {children}
    </Tag>
  );
}
