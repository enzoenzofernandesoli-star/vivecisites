"use client";
import { motion, MotionValue } from "framer-motion";

export function VVCLogo({ progress, className = "" }: { progress?: MotionValue<number>; className?: string }) {
  const p = progress;
  return <svg className={className} viewBox="0 0 720 210" role="img" aria-label="VVC">
    <g fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="square" strokeLinejoin="miter">
      {["M20 22 L115 188","M210 22 L115 188","M255 22 L350 188","M445 22 L350 188","M695 48 L650 22 L525 22 L485 62 L485 148 L525 188 L650 188 L695 162"].map((d,i)=><motion.path key={d} d={d} pathLength={p ?? 1} style={p ? { pathLength: p } : undefined} transition={{ duration: .8, delay: i*.08 }} />)}
    </g>
  </svg>;
}
