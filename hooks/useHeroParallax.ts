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
         * não são comparáveis entre si — vêm calibrados pela altura medida
         * de cada camada.
         *
         * O texto também some ao descer: sem isso o wordmark alcança o
         * subtítulo e os dois se sobrepõem.
         */
        const camadas: { sel: string; y: number; fade?: [number, number] }[] = [
          { sel: "[data-camada='fundo']", y: 34 },
          { sel: "[data-camada='foto']", y: 22 },
          // o wordmark desce bem mais e desaparece na segunda metade
          { sel: "[data-camada='titulo']", y: 190, fade: [0.45, 0.9] },
          // o texto de apoio desce MAIS que o wordmark: fica sempre a frente,
          // abrindo distancia em vez de ser alcancado por ele
          { sel: "[data-camada='texto']", y: 470, fade: [0.08, 0.36] },
          { sel: "[data-camada='frente']", y: 420, fade: [0.3, 0.7] },
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

        camadas.forEach(({ sel, y, fade }, i) => {
          const alvos = raiz.querySelectorAll(sel);
          if (!alvos.length) return;
          tl.to(alvos, { yPercent: y, duration: 1 }, 0);
          if (fade) {
            // o fade ocupa só um trecho da linha do tempo, não o percurso todo
            tl.to(alvos, { opacity: 0, duration: fade[1] - fade[0] }, fade[0]);
          }
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
