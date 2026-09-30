"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type OrbState = "idle" | "breathing" | "thinking" | "still";

type OrbProps = {
  size: number;
  state?: OrbState;
  className?: string;
  hue?: number;
};

/** Evo’s presence. Abstract, never a face. The artwork extends 12.5% past its box (halo). */
export function Orb({ size, state = "idle", className, hue = 0 }: OrbProps) {
  const reduce = useReducedMotion();
  const animate =
    reduce || state === "still"
      ? undefined
      : state === "thinking"
        ? { scale: [1, 1.04, 1], opacity: [1, 0.85, 1] }
        : state === "breathing"
          ? { scale: [1, 1.03, 1] }
          : { scale: [1, 1.015, 1] };

  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none relative shrink-0", className)}
      style={{ width: size, height: size }}
      animate={animate}
      transition={{ duration: state === "thinking" ? 1.6 : 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG with filters */}
      <img
        src="/evo/orb.svg"
        alt=""
        draggable={false}
        className="absolute inset-[-12.5%] block size-[125%] max-w-none select-none transition-[filter] duration-[400ms]"
        style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined}
      />
    </motion.div>
  );
}
