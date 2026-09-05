"use client";
import { motion, MotionValue } from "framer-motion";

/**
 * Wordmark VVC — dois "V" que se cruzam logo abaixo do topo e um "C" quadrado
 * aberto à direita, em linha fina, seguindo a logo original do estúdio.
 */
const STROKES = [
  // V1
  "M 6 16 L 158 214 L 326 16",
  // V2 — cruza o braço direito do V1 perto do topo e encosta no C
  "M 302 16 L 452 214 L 598 16",
  // C quadrado
  "M 792 16 L 598 16 L 598 214 L 792 214",
];

export const LOGO_STROKE_DURATION = 0.62;
export const LOGO_STROKE_DELAY = 0.26;
/** Tempo total do traçado, em segundos. */
export const LOGO_DRAW_DURATION =
  LOGO_STROKE_DELAY * (STROKES.length - 1) + LOGO_STROKE_DURATION;

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
        {STROKES.map((d, i) =>
          animated ? (
            <motion.path
              key={d}
              d={d}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: LOGO_STROKE_DURATION,
                delay: i * LOGO_STROKE_DELAY,
                ease: [0.22, 1, 0.36, 1],
              }}
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
