"use client";

import { useTextReveal } from "@/hooks/useTextReveal";

/**
 * Título/frase que sobe palavra por palavra, recortado por linha.
 * Renderiza a tag pedida — não embrulha, para não mexer no layout.
 */
export function TextReveal({
  as: Tag = "h2",
  className = "",
  start,
  delay,
  duration,
  stagger,
  modo,
  plano,
  children,
  ...rest
}: {
  as?: "h1" | "h2" | "h3" | "p" | "strong";
  className?: string;
  start?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  modo?: "words" | "chars";
  /** Entrada sem giro no eixo X: as palavras só sobem. */
  plano?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useTextReveal<HTMLElement>({ start, delay, duration, stagger, modo, plano });
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className} {...rest}>
      {children}
    </Tag>
  );
}
