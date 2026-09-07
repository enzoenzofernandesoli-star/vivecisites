"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import styles from "../viveci.module.css";

/**
 * Cursor customizado. Só existe em ponteiro fino — em toque nem monta.
 *
 * A posição é escrita com `gsap.quickTo`: um setter reaproveitado a cada
 * mousemove. `gsap.to` por evento criaria centenas de tweens por segundo.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(false);
  const [rotulo, setRotulo] = useState<string | null>(null);
  const [crescido, setCrescido] = useState(false);

  useEffect(() => {
    const fino = window.matchMedia("(pointer: fine)");
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAtivo(fino.matches && !semMovimento.matches);
    const frame = requestAnimationFrame(update);
    fino.addEventListener("change", update);
    semMovimento.addEventListener("change", update);
    return () => { cancelAnimationFrame(frame); fino.removeEventListener("change", update); semMovimento.removeEventListener("change", update); };
  }, []);

  useEffect(() => {
    if (!ativo) return;
    const el = dot.current;
    if (!el) return;

    const paraX = gsap.quickTo(el, "x", { duration: 0.32, ease: "power3.out" });
    const paraY = gsap.quickTo(el, "y", { duration: 0.32, ease: "power3.out" });

    let visivel = false;
    const mover = (e: PointerEvent) => {
      if (!visivel) { visivel = true; gsap.to(el, { opacity: 1, duration: 0.2 }); }
      paraX(e.clientX);
      paraY(e.clientY);

      const alvo = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-cursor]"
      );
      const marca = alvo?.dataset.cursor ?? null;
      setRotulo(marca);
      setCrescido(Boolean(alvo));
    };

    const sair = () => { visivel = false; gsap.to(el, { opacity: 0, duration: 0.2 }); };

    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", sair);
    window.addEventListener("blur", sair);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", sair);
      window.removeEventListener("blur", sair);
      gsap.killTweensOf(el);
    };
  }, [ativo]);

  if (!ativo) return null;

  return (
    <div
      ref={dot}
      className={styles.cursor}
      data-grande={crescido ? "true" : "false"}
      data-rotulo={rotulo ? "true" : "false"}
      aria-hidden
    >
      <span>{rotulo}</span>
    </div>
  );
}
