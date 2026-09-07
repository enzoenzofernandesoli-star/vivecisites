"use client";
import { motion, MotionValue } from "framer-motion";

/**
 * Símbolo VVC vetorizado a partir da marca de referência do estúdio.
 *
 * As durações são proporcionais ao comprimento de cada traço, para a ponta
 * correr sempre na mesma velocidade.
 */
const STROKES: { d: string; inicio: number; duracao: number }[] = [
  // V1
  { d: "M 8 14 L 160 214 L 313 14", inicio: 0, duracao: 0.52 },
  // O segundo V começa depois do primeiro e termina no encontro com o C.
  { d: "M 324 38 L 448 214 L 582 14", inicio: 0.46, duracao: 0.5 },
  // A barra superior e o corpo inferior do C são separados, como na referência.
  { d: "M 582 14 L 794 14", inicio: 0.9, duracao: 0.22 },
  { d: "M 582 55 L 582 214 L 794 214", inicio: 0.9, duracao: 0.42 },
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
        strokeWidth="16"
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
