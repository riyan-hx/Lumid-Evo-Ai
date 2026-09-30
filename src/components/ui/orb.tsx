import { cn } from "@/lib/cn";

type OrbState = "idle" | "breathing" | "thinking" | "still";

type OrbProps = {
  size: number;
  state?: OrbState;
  className?: string;
  hue?: number;
};

const anim: Record<OrbState, string | undefined> = {
  idle: "evo-orb-idle",
  breathing: "evo-orb-breathe",
  thinking: "evo-orb-think",
  still: undefined,
};

/**
 * Evo’s presence. Abstract, never a face. The artwork extends 12.5% past its box (halo).
 * Pre-rendered from the Figma orb (orb.svg) — a raster avoids Safari's SVG-filter bugs (square halo
 * boxes, speckled noise) — and animated with CSS so it runs on the compositor, not the JS thread.
 */
export function Orb({ size, state = "idle", className, hue = 0 }: OrbProps) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative shrink-0", anim[state], className)} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static asset, fixed box, no layout shift */}
      <img
        src={size > 64 ? "/evo/orb.webp" : "/evo/orb-sm.webp"}
        alt=""
        draggable={false}
        decoding="async"
        className="absolute inset-[-12.5%] block size-[125%] max-w-none select-none transition-[filter] duration-[400ms]"
        style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined}
      />
    </div>
  );
}
