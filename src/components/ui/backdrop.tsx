"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A blurred glow ellipse, exactly as in Figma (x/y/w/h in screen px, Figma blur radius). */
export type Glow = { x: number; y: number; w: number; h: number; color: string; opacity: number; blur: number };

export const glows = {
  onboarding: [
    { x: -120, y: -120, w: 400, h: 320, color: "#a3e27d", opacity: 0.55, blur: 110 },
    { x: 230, y: -50, w: 240, h: 240, color: "#7fe3b8", opacity: 0.4, blur: 90 },
  ],
  welcome: [
    { x: -64, y: 40, w: 520, h: 520, color: "#a3e27d", opacity: 0.75, blur: 110 },
    { x: 210, y: -40, w: 260, h: 260, color: "#7fe3b8", opacity: 0.45, blur: 90 },
    { x: -120, y: 420, w: 240, h: 240, color: "#d4f77a", opacity: 0.45, blur: 90 },
  ],
  checkIn: [
    { x: -14, y: 110, w: 420, h: 380, color: "#a3e27d", opacity: 0.55, blur: 100 },
    { x: 240, y: -60, w: 220, h: 220, color: "#7fe3b8", opacity: 0.35, blur: 80 },
    { x: -60, y: 640, w: 300, h: 200, color: "#e4f7d6", opacity: 0.9, blur: 80 },
  ],
  home: [
    { x: -120, y: -120, w: 460, h: 380, color: "#a3e27d", opacity: 0.6, blur: 110 },
    { x: 220, y: -40, w: 260, h: 240, color: "#7fe3b8", opacity: 0.45, blur: 90 },
    { x: 140, y: 700, w: 300, h: 280, color: "#ffe7b3", opacity: 0.5, blur: 110 },
    { x: -150, y: 1150, w: 320, h: 300, color: "#e9e3ff", opacity: 0.6, blur: 110 },
  ],
  chat: [
    { x: -80, y: -160, w: 460, h: 380, color: "#a3e27d", opacity: 0.7, blur: 110 },
    { x: 230, y: -60, w: 260, h: 240, color: "#7fe3b8", opacity: 0.4, blur: 90 },
    { x: 180, y: 760, w: 280, h: 280, color: "#d4f77a", opacity: 0.3, blur: 110 },
    { x: -160, y: 1250, w: 300, h: 300, color: "#a3e27d", opacity: 0.3, blur: 120 },
    { x: 200, y: 1850, w: 280, h: 260, color: "#7fe3b8", opacity: 0.28, blur: 110 },
    { x: -80, y: 2250, w: 320, h: 300, color: "#c9eeb0", opacity: 0.5, blur: 110 },
  ],
  calm: [
    { x: -34, y: 150, w: 460, h: 460, color: "#62bf3b", opacity: 0.45, blur: 120 },
    { x: 220, y: 40, w: 260, h: 260, color: "#2fbf7a", opacity: 0.25, blur: 100 },
    { x: -120, y: 640, w: 300, h: 220, color: "#88d95f", opacity: 0.18, blur: 110 },
  ],
  wins: [
    { x: -120, y: -140, w: 400, h: 320, color: "#a3e27d", opacity: 0.55, blur: 110 },
    { x: 230, y: -40, w: 240, h: 240, color: "#ffe7b3", opacity: 0.5, blur: 90 },
    { x: 160, y: 640, w: 300, h: 300, color: "#e9e3ff", opacity: 0.6, blur: 110 },
  ],
  focus: [
    { x: -24, y: 150, w: 440, h: 420, color: "#a3e27d", opacity: 0.55, blur: 110 },
    { x: 220, y: -60, w: 240, h: 240, color: "#7fe3b8", opacity: 0.4, blur: 90 },
  ],
  /** Top wash screens (04, 30, 31) */
  wash: [
    { x: 220, y: -60, w: 240, h: 200, color: "#7fe3b8", opacity: 0.5, blur: 80 },
    { x: -80, y: 40, w: 200, h: 200, color: "#d4f77a", opacity: 0.5, blur: 80 },
  ],
  crisis: [
    { x: -120, y: -120, w: 400, h: 320, color: "#ffd9c2", opacity: 0.7, blur: 110 },
    { x: 220, y: -40, w: 260, h: 240, color: "#a3e27d", opacity: 0.4, blur: 90 },
  ],
} satisfies Record<string, Glow[]>;

/** Tablet/desktop glows from the 1440-wide Figma frames; x is mapped to a % of the viewport. */
export const wideGlows = {
  home: [
    { x: 200, y: -250, w: 700, h: 500, color: "#a3e27d", opacity: 0.5, blur: 160 },
    { x: 1000, y: -150, w: 500, h: 400, color: "#ffe7b3", opacity: 0.45, blur: 150 },
    { x: 600, y: 650, w: 600, h: 500, color: "#e9e3ff", opacity: 0.5, blur: 160 },
  ],
  chat: [
    { x: 300, y: -250, w: 700, h: 500, color: "#a3e27d", opacity: 0.5, blur: 160 },
    { x: 1000, y: -150, w: 500, h: 400, color: "#7fe3b8", opacity: 0.35, blur: 150 },
    { x: 500, y: 650, w: 600, h: 500, color: "#d4f77a", opacity: 0.25, blur: 160 },
  ],
} satisfies Record<string, Glow[]>;

/**
 * Screen background: glows + optional rays + 5% grain.
 * Positions are in the 393-wide design space; the layer is centred so wider viewports keep the composition.
 */
export function Backdrop({
  items,
  wide,
  rays,
  grain = 0.05,
  grainColor = "0 0 0",
  under,
}: {
  under?: ReactNode;
  items: Glow[];
  /** Glows for md+ in the 1440 design space. Without them the phone glows scale up around the centre. */
  wide?: Glow[];
  rays?: RaysSpec;
  grain?: number;
  grainColor?: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={cn("absolute top-0 left-1/2 h-full w-[393px] origin-top -translate-x-1/2", wide ? "md:hidden" : "md:scale-[1.9] xl:scale-[2.6]")}>
        {items.map((g, i) => (
          <GlowBlob key={i} g={g} />
        ))}
      </div>
      {wide && (
        <div className="absolute inset-0 hidden md:block">
          {wide.map((g, i) => (
            <GlowBlob key={i} g={g} left={`${(g.x / 1440) * 100}%`} />
          ))}
        </div>
      )}
      <div className="absolute top-0 left-1/2 h-full w-[393px] -translate-x-1/2">
        {under}
        {rays && <Rays {...rays} />}
      </div>
      {grain > 0 && <Grain opacity={grain} color={grainColor} />}
    </div>
  );
}

function GlowBlob({ g, left }: { g: Glow; left?: string }) {
  return (
    <div
      className="absolute rounded-[50%]"
      style={{
        left: left ?? g.x,
        top: g.y,
        width: g.w,
        height: g.h,
        background: g.color,
        opacity: g.opacity,
        filter: `blur(${g.blur / 2}px)`,
      }}
    />
  );
}

function Grain({ opacity, color }: { opacity: number; color: string }) {
  const [r, g, b] = color.split(" ").map((c) => Number(c) / 255);
  return (
    <svg className="absolute inset-0 size-full mix-blend-normal" style={{ opacity }}>
      <filter id="evo-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1.4 -0.5`} />
      </filter>
      <rect width="100%" height="100%" filter="url(#evo-grain)" />
    </svg>
  );
}

/** Radial rays (Welcome, Step booked). Geometry matches the Figma vectors. */
export type RaysSpec = {
  cx: number;
  cy: number;
  inner: number;
  outer: number;
  count: number;
  stroke: number;
  strokeOpacity: number;
  opacity?: number;
  /** Rotate slowly once on arrival */
  spinOnce?: boolean;
};

export function Rays({ cx, cy, inner, outer, count, stroke, strokeOpacity, opacity = 1, spinOnce }: RaysSpec) {
  const reduce = useReducedMotion();
  const lines = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M${(inner * c).toFixed(2)} ${(inner * s).toFixed(2)}L${(outer * c).toFixed(2)} ${(outer * s).toFixed(2)}`;
  }).join("");
  return (
    <motion.svg
      className="absolute"
      style={{ left: cx - outer, top: cy - outer, opacity, originX: "50%", originY: "50%" }}
      width={outer * 2}
      height={outer * 2}
      viewBox={`${-outer} ${-outer} ${outer * 2} ${outer * 2}`}
      initial={spinOnce && !reduce ? { rotate: -12 } : false}
      animate={{ rotate: 0 }}
      transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
    >
      <path d={lines} stroke="white" strokeOpacity={strokeOpacity} strokeWidth={stroke} fill="none" />
    </motion.svg>
  );
}

/** Lime top wash used under the glows on 04, 30 and 31. */
export function TopWash() {
  return (
    <div
      className="absolute top-0 left-1/2 h-[420px] w-[max(100vw,393px)] -translate-x-1/2"
      style={{ background: "linear-gradient(180deg, rgba(155,224,112,0.9) 0%, rgba(201,238,176,0.6) 55%, rgba(246,248,242,0) 100%)" }}
    />
  );
}
