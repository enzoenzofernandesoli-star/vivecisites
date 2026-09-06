"use client";
import { motion, MotionValue } from "framer-motion";

/**
 * Wordmark VVC — dois "V" que se cruzam logo abaixo do topo e um "C" quadrado
 * aberto à direita, em linha fina, seguindo a logo original do estúdio.
 *
 * O traçado é sequencial de propósito: na logo o desenho é feito de uma
 * caneta só, então um traço termina onde o próximo começa. Os dois últimos
 * saem juntos do canto onde o segundo V aterrissa — é ali que a linha se
 * abre no "C", e desenhar o "C" como um traço solto quebrava essa leitura.
 *
 * As durações são proporcionais ao comprimento de cada traço, para a ponta
 * correr sempre na mesma velocidade.
 */
const STROKES: { d: string; inicio: number; duracao: number }[] = [
  // V1
  { d: "M 6 16 L 156 214 L 319 16", inicio: 0, duracao: 0.5 },
  // V2 — cruza o braço direito do V1 perto do topo e aterrissa no canto do C
  { d: "M 284 16 L 441 214 L 588 16", inicio: 0.42, duracao: 0.5 },
  // C quadrado: a partir do canto, o topo abre para a direita...
  { d: "M 588 16 L 796 16", inicio: 0.88, duracao: 0.22 },
  // ...e a mesma origem desce e fecha embaixo
  { d: "M 588 16 L 588 214 L 796 214", inicio: 0.88, duracao: 0.44 },
];

/** Tempo total do traçado, em segundos. */
export const LOGO_DRAW_DURATION = STROKES.reduce(
  (fim, t) => Math.max(fim, t.inicio + t.duracao),
  0
);

export function VVCLogo({
  progress,
  animated = false,
  className = "",
}: {
  /** Desenho controlado por um MotionValue (0–1). */
  progress?: MotionValue<number>;
  /** Desenha sozinho ao montar, um traço após o outro. */
  animated?: boolean;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 800 230" role="img" aria-label="VVC">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        {STROKES.map(({ d, inicio, duracao }) =>
          animated ? (
            <motion.path
              key={d}
              d={d}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: duracao, delay: inicio, ease: [0.33, 0, 0.2, 1] }}
            />
          ) : (
            <motion.path
              key={d}
              d={d}
              pathLength={progress ?? 1}
              style={progress ? { pathLength: progress } : undefined}
            />
          )
        )}
      </g>
    </svg>
  );
}
