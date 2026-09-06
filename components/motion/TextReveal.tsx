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
  children,
  ...rest
}: {
  as?: "h1" | "h2" | "h3" | "p" | "strong";
  className?: string;
  start?: string;
  delay?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useTextReveal<HTMLElement>({ start, delay });
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className} {...rest}>
      {children}
    </Tag>
  );
}
