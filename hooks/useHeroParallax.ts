"use client";

import { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

/**
 * Parallax em camadas no herói: um único scrub move cada plano numa
 * velocidade diferente, e a profundidade nasce dessa diferença.
 *
 * As camadas do fundo andam mais que as da frente — é o que o olho lê como
 * distância. O título fica no meio: acompanha a cena sem grudar no fundo.
 *
 * Não cria Lenis nem ticker próprios: quem faz isso é o SmoothScrollProvider.
 * Dois motores de scroll na mesma página brigam pelo mesmo frame.
 */
export function useHeroParallax(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const raiz = scope.current;
      if (!raiz) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /**
         * yPercent é relativo à altura do PRÓPRIO elemento, então os valores
         * não são comparáveis entre si — precisam ser calibrados pela altura
         * medida de cada camada para dar o deslocamento em pixels desejado.
         *
         *   fundo  755px × 26%  ≈ 196px
         *   foto   891px × 16%  ≈ 143px
         *   título  69px × 120% ≈  83px
         *   frente  11px × 340% ≈  37px
         */
        const camadas: [string, number][] = [
          ["[data-camada='fundo']", 26],
          ["[data-camada='foto']", 16],
          ["[data-camada='titulo']", 120],
          ["[data-camada='frente']", 340],
        ];

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: raiz,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        camadas.forEach(([seletor, yPercent], i) => {
          const alvos = raiz.querySelectorAll(seletor);
          if (!alvos.length) return;
          tl.to(alvos, { yPercent }, i === 0 ? undefined : "<");
        });

        return () => { tl.scrollTrigger?.kill(); tl.kill(); };
      });

      // revert() só desfaz o que este matchMedia criou — nunca toca nos
      // outros ScrollTriggers da página
      return () => mm.revert();
    },
    { scope }
  );
}
