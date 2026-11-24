"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Orb } from "@/components/ui/orb";

/* Launch-poster building blocks, matching the Evo Instagram carousel and the Lumid post guide. */

export type Tone = "night" | "light";

/** Dot grid + lime light from below + topographic lines + grain. Green is light, never paint. */
export function PosterBackground({ tone, glow = "bottom", children }: { tone: Tone; glow?: "bottom" | "center" | "none"; children?: ReactNode }) {
  const night = tone === "night";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: night ? "#0b0d0a" : "#f6f8f2" }} />
      {glow !== "none" && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={
            glow === "bottom"
              ? {
                  bottom: night ? "-34%" : "-40%",
                  width: "min(1500px, 220vw)",
                  height: "80%",
                  background: night
                    ? "radial-gradient(50% 50% at 50% 50%, rgba(163,226,125,0.95) 0%, rgba(98,191,59,0.75) 30%, rgba(45,110,24,0.35) 58%, rgba(11,13,10,0) 100%)"
                    : "radial-gradient(50% 50% at 50% 50%, rgba(163,226,125,0.8) 0%, rgba(201,238,176,0.55) 40%, rgba(246,248,242,0) 100%)",
                }
              : {
                  top: "18%",
                  width: "min(900px, 160vw)",
                  height: "60%",
                  background: night
                    ? "radial-gradient(50% 50% at 50% 50%, rgba(98,191,59,0.45) 0%, rgba(45,110,24,0.18) 50%, rgba(11,13,10,0) 100%)"
                    : "radial-gradient(50% 50% at 50% 50%, rgba(163,226,125,0.6) 0%, rgba(127,227,184,0.2) 50%, rgba(246,248,242,0) 100%)",
                }
          }
        />
      )}
      {night && glow === "bottom" && <Topo />}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${night ? "rgba(255,255,255,0.28)" : "rgba(36,46,33,0.16)"} 1px, transparent 1.4px)`,
          backgroundSize: "44px 44px",
          backgroundPosition: "center top",
          maskImage: night ? "linear-gradient(180deg, #000 0%, #000 55%, transparent 85%)" : undefined,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.07,
          backgroundColor: night ? "#fff" : "#000",
          WebkitMaskImage: "url(/evo/grain.png)",
          maskImage: "url(/evo/grain.png)",
          WebkitMaskSize: "128px 128px",
          maskSize: "128px 128px",
        }}
      />
      {children}
    </div>
  );
}

/** Contour lines riding the lower glow, as on the carousel. */
function Topo() {
  const rings = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg className="absolute bottom-0 left-1/2 h-[55%] w-[max(100%,900px)] -translate-x-1/2 opacity-[0.22] mix-blend-overlay" viewBox="0 0 900 500" preserveAspectRatio="xMidYMax slice">
      {rings.map((i) => (
        <path
          key={i}
          d={`M-40 ${520 - i * 26} C 140 ${430 - i * 30}, 260 ${520 - i * 40}, 420 ${450 - i * 28} S 720 ${380 - i * 22}, 940 ${470 - i * 34}`}
          fill="none"
          stroke="#0b2a06"
          strokeWidth={1.4}
        />
      ))}
      {rings.slice(0, 5).map((i) => (
        <ellipse key={`e${i}`} cx={680} cy={430} rx={40 + i * 26} ry={18 + i * 12} fill="none" stroke="#0b2a06" strokeWidth={1.2} />
      ))}
    </svg>
  );
}

export function Wordmark({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <span
      className={cn("inline-block text-[22px] leading-none font-semibold tracking-[0.04em] select-none", className)}
      style={{
        backgroundImage: tone === "night" ? "linear-gradient(180deg,#62bf3b 0%,#2e8a12 100%)" : "linear-gradient(90deg,#1b6000 0%,#4ca22c 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      LUMID
    </span>
  );
}

export function Eyebrow({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full pr-3.5 pl-1.5 type-label-s backdrop-blur-[10px]",
        tone === "night" ? "border border-white/15 bg-white/12 text-white/85" : "border border-white bg-white/75 text-forest shadow-[0_6px_14px_rgba(26,64,20,0.06)]",
        className,
      )}
    >
      <Orb size={20} state="still" />
      {children}
    </span>
  );
}

/** Highlighted words: the lime "light" gradient from the poster headlines. */
export function Glow({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      style={{
        backgroundImage: tone === "night" ? "linear-gradient(90deg,#c9ee9f 0%,#a3e27d 50%,#88d95f 100%)" : "linear-gradient(90deg,#2e8a12 0%,#62bf3b 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        textShadow: tone === "night" ? "0 0 32px rgba(163,226,125,0.35)" : undefined,
      }}
    >
      {children}
    </span>
  );
}

/** The one serif italic phrase per post. */
export function Human({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-serif font-normal italic tracking-[-0.02em]", className)}>{children}</span>;
}

export function Disclaimer({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <p className={cn("type-caption", tone === "night" ? "text-white/45" : "text-t3", className)}>
      Evo is a support tool, not therapy or a diagnosis. In a crisis, contact a professional or helpline.
    </p>
  );
}

export function Handle({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <p className={cn("font-mono text-[10px] tracking-[0.14em] uppercase", tone === "night" ? "text-white/40" : "text-t3", className)}>
      @lumid.ai · evo.lumidai.in
    </p>
  );
}

const variants = [
  { href: "/early-access/stuck", n: "01", label: "Sound familiar" },
  { href: "/early-access/pass", n: "02", label: "Evo Pass" },
  { href: "/early-access/note", n: "03", label: "Note to you" },
  { href: "/early-access/breathe", n: "04", label: "One breath" },
];

/** Review-only switcher between the four variations, styled like the carousel navigator. */
export function VariantNav({ tone }: { tone: Tone }) {
  const path = usePathname();
  const i = variants.findIndex((v) => v.href === path);
  const night = tone === "night";
  return (
    <nav
      aria-label="Early access variations"
      className={cn(
        "fixed right-4 bottom-[max(env(safe-area-inset-bottom),14px)] z-50 flex items-center gap-3 rounded-full py-1.5 pr-1.5 pl-4 backdrop-blur-[12px]",
        night ? "border border-white/12 bg-black/55 text-white" : "border border-white bg-white/80 text-forest shadow-[0_10px_20px_rgba(26,64,20,0.1)]",
      )}
    >
      <span className="font-mono text-[11px] tracking-[0.1em]">{variants[i]?.n ?? "00"} / 04</span>
      <span className="flex gap-1">
        {variants.map((v, j) => (
          <Link
            key={v.href}
            href={v.href}
            aria-label={`Variation ${v.n}: ${v.label}`}
            aria-current={j === i ? "page" : undefined}
            className={cn("h-[3px] rounded-full transition-all duration-200", j === i ? "w-6 bg-lime" : night ? "w-3 bg-white/25" : "w-3 bg-forest/20")}
          />
        ))}
      </span>
      <Link
        href={variants[(i + 1) % variants.length].href}
        className={cn("flex h-8 items-center rounded-full px-3 type-label-s", night ? "bg-white text-ink" : "bg-forest text-white")}
      >
        Next →
      </Link>
    </nav>
  );
}

export { variants as launchVariants };
