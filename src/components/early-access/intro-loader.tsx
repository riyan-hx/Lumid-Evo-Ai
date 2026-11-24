"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { PosterBackground } from "@/components/launch/poster";
import { ticker } from "@/lib/early-access/content";
import { INTRO_KEY, store, track } from "@/lib/early-access/client";
import { cn } from "@/lib/cn";
import { EASE_BLOOM, EASE_IN_OUT_SOFT, EASE_OUT } from "@/lib/motion";

/**
 * Intro loader (handoff §2). Fixed overlay above step A: 3.4 s, then a 300 ms hand-off while A fades in.
 * Beats: 1 Light on 0 s · 2 Introducing 0.8 s · 3 Lumid Evo 1.6 s · 4 Bloom & out 2.8 s.
 * Everything animates transform/opacity/clip-path only.
 */

const BEATS = {
  status: ["WAKING EVO UP", "PREPARING A CALM SPACE", "ALMOST THERE", "READY"],
  percent: [8, 36, 78, 100],
};

const RAYS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  return `M${(Math.cos(a) * 22).toFixed(2)} ${(Math.sin(a) * 22).toFixed(2)}L${(Math.cos(a) * 100).toFixed(2)} ${(Math.sin(a) * 100).toFixed(2)}`;
}).join("");

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const load = (src: string) =>
  new Promise<void>((res) => {
    const img = new Image();
    img.onload = img.onerror = () => res();
    img.src = src;
  });

const GRAD_EVO = "linear-gradient(180deg,#e9ffd0 0%,#a3e27d 55%,#62bf3b 100%)";
const BLOOM_FROM = "circle(0vmax at 50% 50%)";
const BLOOM_TO = "circle(150vmax at 50% 50%)";

type Props = { run: boolean; onReveal: () => void; onDone: () => void };

export function IntroLoader({ run, onReveal, onDone }: Props) {
  const [scope, animate] = useAnimate();
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState(1);
  const [dark, setDark] = useState(false); // UI ink flips once the (light) bloom is covering the screen

  useEffect(() => {
    if (!run) return;
    store.set(INTRO_KEY, "1");
    track("intro_started", { reduced_motion: !!reduced });

    const t0 = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    let phase: "in" | "exit" = "in";
    let held = 0;
    let assetsReady = false;
    const assets = Promise.all([load("/evo/orb.webp"), load("/evo/grain.png")]).then(() => {
      assetsReady = true;
    });
    let intro: { stop: () => void } | undefined;
    let pulse: { stop: () => void } | undefined;
    let alive = true;

    const exit = async (fast: boolean) => {
      if (phase === "exit" || !alive) return;
      phase = "exit";
      timers.forEach(clearTimeout);
      intro?.stop();
      pulse?.stop();
      setBeat(4);
      const d = reduced ? 0 : fast ? 0.5 : 1;
      if (!reduced) timers.push(setTimeout(() => setDark(true), 300 * d));
      if (!reduced) {
        await animate([
          ["[data-l=evo]", { scale: [null, 1.8], opacity: [null, 0.55, 0] }, { at: 0, duration: 0.6 * d, ease: EASE_BLOOM }],
          ["[data-l=bloom]", { clipPath: [BLOOM_FROM, BLOOM_TO] }, { at: 0, duration: 0.5 * d, ease: EASE_BLOOM }],
          ["[data-l=ready]", { opacity: [0, 1] }, { at: 0.1 * d, duration: 0.2 * d, ease: EASE_OUT }],
          ["[data-l=bar]", { scaleX: 1 }, { at: 0, duration: 0.5 * d, ease: "linear" }],
        ]);
      }
      if (!alive) return;
      onReveal(); // A starts fading in as the bloom fades out
      await animate(scope.current, { opacity: [1, 0] }, { duration: reduced ? 0.3 : fast ? 0.2 : 0.3, ease: EASE_OUT });
      if (!alive) return;
      if (!fast) track("intro_completed", { held_ms: Math.round(held) });
      onDone();
    };

    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && ![" ", "Enter", "Escape"].includes(e.key)) return;
      if (phase === "exit") return;
      track("intro_skipped", { at_ms: Math.round(performance.now() - t0) });
      void exit(true);
    };
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    if (reduced) {
      // Static beat 3 for 1 s, then a 300 ms cross-fade.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- show the static beat-3 composition
      setBeat(3);
      void animate([
        ["[data-l=bg]", { opacity: 1 }, { at: 0, duration: 0 }],
        ["[data-l=intro]", { opacity: 0.9 }, { at: 0, duration: 0 }],
        ["[data-l=lumid]", { opacity: 1 }, { at: 0, duration: 0 }],
        ["[data-l=evo]", { opacity: 1 }, { at: 0, duration: 0 }],
        ["[data-l=evoglow]", { opacity: 0.4 }, { at: 0, duration: 0 }],
        ["[data-l=tag]", { opacity: 1 }, { at: 0, duration: 0 }],
      ]);
      later(() => void exit(false), 1000);
    } else {
      const spring = { type: "spring" as const, stiffness: 180, damping: 24 };
      intro = animate([
        ["[data-l=bg]", { opacity: [0, 0.12] }, { at: 0, duration: 0.4, ease: EASE_OUT }],
        ["[data-l=bg]", { opacity: 0.35 }, { at: 0.8, duration: 0.6, ease: EASE_OUT }],
        ["[data-l=bg]", { opacity: 1 }, { at: 1.4, duration: 0.6, ease: EASE_IN_OUT_SOFT }],
        // Orb: fades in small, grows through one breath, then dissolves into the glow.
        ["[data-l=orb]", { scale: [0.28, 0.46], opacity: [0, 1] }, { at: 0, ...spring }],
        ["[data-l=orb]", { scale: 1 }, { at: 0.6, duration: 0.8, ease: EASE_IN_OUT_SOFT }],
        ["[data-l=orb]", { scale: 1.6, opacity: 0 }, { at: 1.4, duration: 0.4, ease: EASE_OUT }],
        ["[data-l=glow]", { opacity: [0, 0.35] }, { at: 0, duration: 0.6, ease: EASE_OUT }],
        ["[data-l=glow]", { scale: [1, 1.8] }, { at: 1.4, duration: 0.8, ease: EASE_IN_OUT_SOFT }],
        // Rays draw outward, drift, then expand.
        ["[data-l=rays]", { opacity: [0, 0.35] }, { at: 0.8, duration: 0.6, ease: EASE_OUT }],
        ["[data-l=raypath]", { strokeDashoffset: [1, 0] }, { at: 0.8, duration: 0.6, ease: EASE_OUT }],
        ["[data-l=raysrot]", { rotate: [-8, 0] }, { at: 0.8, duration: 2, ease: "linear" }],
        ["[data-l=rays]", { scale: [1, 2], opacity: 0.4 }, { at: 1.6, duration: 0.6, ease: EASE_OUT }],
        ["[data-l=intro]", { y: [12, 0], opacity: [0, 0.9] }, { at: 0.9, duration: 0.5, ease: EASE_OUT }],
        ["[data-l=intro]", { scale: 0.88 }, { at: 1.6, duration: 0.4, ease: EASE_OUT }],
        ["[data-l=lumid]", { opacity: [0, 1], letterSpacing: ["0.3em", "0.04em"] }, { at: 1.6, duration: 0.5, ease: EASE_OUT }],
        ["[data-l=evo]", { scale: [0.92, 1], opacity: [0, 1] }, { at: 1.75, ...spring }],
        ["[data-l=evoglow]", { opacity: [0, 0.55] }, { at: 2, duration: 0.6, ease: EASE_OUT }],
        ["[data-l=tag]", { y: [8, 0], opacity: [0, 1] }, { at: 2.2, duration: 0.4, ease: EASE_OUT }],
        ["[data-l=bar]", { scaleX: [0, 0.82] }, { at: 0, duration: 2.8, ease: "linear" }],
      ]);
      later(() => setBeat(2), 800);
      later(() => setBeat(3), 1600);
      later(async () => {
        // Hold beat 3 if assets are still loading (max 6 s total), then exit anyway.
        const h0 = performance.now();
        if (!assetsReady) pulse = animate("[data-l=evoglow]", { opacity: [0.55, 0.85, 0.55] }, { duration: 1.6, repeat: Infinity, ease: EASE_IN_OUT_SOFT });
        await Promise.race([assets, sleep(3200)]);
        held = performance.now() - h0;
        void exit(false);
      }, 2800);
    }

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      intro?.stop();
      pulse?.stop();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
    // The timeline runs once per mount; callbacks are stable from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, reduced]);

  const ink = dark ? "#242e21" : "#ffffff";
  const active = beat === 1 ? 0 : beat - 1; // ticker items lit: beat 2 → 1, beat 3 → 2, beat 4 → 3
  const mobileItem = ticker[Math.min(Math.max(active - 1, 0), 2)];

  return (
    <div
      ref={scope}
      data-l="root"
      role="status"
      aria-live="polite"
      className="ea-loader fixed inset-0 z-50 overflow-hidden bg-[#050605] text-white select-none"
    >
      <span className="sr-only">Loading Evo</span>
      <div data-l="bg" aria-hidden style={{ opacity: 0 }} className="absolute inset-0">
        <PosterBackground tone="night" />
      </div>

      {/* centre stage: orb, glow, rays */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[44%] flex h-0 justify-center">
        <div data-l="glow" style={{ opacity: 0 }} className="absolute top-0 left-1/2 aspect-square w-[min(120vw,70vh)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(98,191,59,0.9),rgba(98,191,59,0)_100%)]" />
        <div data-l="raysrot" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div data-l="rays" style={{ opacity: 0 }}>
            <svg viewBox="-100 -100 200 200" className="block" style={{ width: "max(150vw,150vh)" }}>
              <path data-l="raypath" d={RAYS} pathLength={1} strokeDasharray={1} strokeDashoffset={1} stroke="#c9eeb0" strokeWidth={0.25} fill="none" />
            </svg>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div data-l="orb" style={{ opacity: 0 }}>
            <div className="desk:scale-[1.3]">
              <div className="evo-orb-breathe">
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-rendered orb, fixed box */}
                <img src="/evo/orb.webp" alt="" draggable={false} className="block size-24 max-w-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* wordmark stack */}
      <div className="absolute inset-x-0 top-[46%] flex -translate-y-1/2 flex-col items-center px-6 text-center">
        <p data-l="intro" style={{ opacity: 0 }} className="text-[clamp(28px,min(8.7vw,6vh),58px)] leading-none font-light tracking-[-0.03em]">
          Introducing
        </p>
        <span
          data-l="lumid"
          style={{ opacity: 0, backgroundImage: "linear-gradient(180deg,#62bf3b 0%,#2e8a12 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", letterSpacing: "0.3em" }}
          className="mt-[2vh] text-[clamp(44px,min(14vw,10.5vh),95px)] leading-none font-semibold [text-shadow:none]"
        >
          LUMID
        </span>
        <div className="relative mt-[1.2vh]">
          <span aria-hidden data-l="evoglow" style={{ opacity: 0 }} className="absolute inset-0 text-[clamp(96px,min(34vw,26vh),240px)] leading-[0.9] font-medium tracking-[-0.05em] text-[#a3e27d] blur-[28px]">
            EVO
          </span>
          <span data-l="evo" style={{ opacity: 0, backgroundImage: GRAD_EVO, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }} className="relative block text-[clamp(96px,min(34vw,26vh),240px)] leading-[0.9] font-medium tracking-[-0.05em]">
            EVO
          </span>
        </div>
        <p data-l="tag" style={{ opacity: 0 }} className="mt-[2vh] font-serif text-[clamp(18px,min(5.6vw,3.6vh),30px)] text-[#d4f77a] italic">
          Get unstuck, one small step at a time.
        </p>
      </div>

      {/* exit: bloom wipes to the first screen */}
      <div data-l="bloom" aria-hidden className="absolute inset-0" style={{ clipPath: BLOOM_FROM, background: "radial-gradient(circle at 50% 46%, #f3fbec 0%, #e4f7d6 38%, #c9ee9f 100%)" }} />
      <div data-l="ready" aria-hidden style={{ opacity: 0 }} className="absolute inset-x-0 top-[46%] flex -translate-y-1/2 flex-col items-center gap-4 px-6 text-center">
        <p className="font-serif text-[clamp(26px,7vw,40px)] text-[#242e21] italic">Ready when you are.</p>
        <span className="rounded-full bg-[#242e21] px-3.5 py-2 font-mono text-[10px] tracking-[0.12em] text-[#a3e27d] uppercase">Next · Sound familiar?</span>
      </div>

      {/* chrome */}
      <p aria-hidden className="absolute inset-x-0 top-[56px] text-center font-mono text-[10px] tracking-[0.14em] uppercase transition-colors duration-200 desk:top-[44px] desk:text-[11px]" style={{ color: ink, opacity: dark ? 0.7 : 0.45 }}>
        Evo by Lumid · early access
      </p>
      <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 transition-colors duration-200 desk:inset-x-[max(120px,calc((100vw-1200px)/2))] desk:bottom-10" style={{ color: ink }}>
        <div className="flex justify-end">
          <button type="button" className="-mr-3 h-11 cursor-pointer px-3 font-mono text-[11px] tracking-[0.14em] uppercase opacity-70 outline-none hover:opacity-100 focus-visible:underline focus-visible:underline-offset-4">
            Skip intro
          </button>
        </div>
        <div aria-hidden className="min-h-[34px] desk:min-h-[40px]">
          <div className="hidden gap-6 desk:flex">
            {ticker.map((t, i) => (
              <div key={t.n} className={cn("flex-1 transition-opacity duration-200", i < active ? "opacity-100" : "opacity-35")}>
                <p className="text-[14px] font-medium" style={{ color: i < active ? (dark ? "#3f8f22" : "#a3e27d") : undefined }}>
                  {t.n} {t.title}
                </p>
                <p className="text-[13px] opacity-60">{t.sub}</p>
              </div>
            ))}
          </div>
          {active > 0 && (
            <p className="flex items-center gap-2.5 text-[13px] desk:hidden">
              <span className="font-mono text-[11px] tracking-[0.08em]" style={{ color: dark ? "#3f8f22" : "#a3e27d" }}>
                {mobileItem.n} / 03
              </span>
              <span className="opacity-75">
                {mobileItem.title} — {mobileItem.sub}
              </span>
            </p>
          )}
        </div>
        <div aria-hidden className="h-[2px] overflow-hidden rounded-full" style={{ background: dark ? "rgba(36,46,33,0.2)" : "rgba(255,255,255,0.15)" }}>
          <div data-l="bar" className="h-full origin-left rounded-full shadow-[0_0_8px_rgba(136,217,95,0.9)]" style={{ transform: "scaleX(0)", background: dark ? "#3f8f22" : "#88d95f" }} />
        </div>
        <div aria-hidden className="flex justify-between font-mono text-[10px] tracking-[0.12em] uppercase">
          <span className="opacity-50">{BEATS.status[beat - 1]}</span>
          <span style={{ color: dark ? "#3f8f22" : "#a3e27d" }}>{String(BEATS.percent[beat - 1]).padStart(2, "0")}%</span>
        </div>
      </div>
    </div>
  );
}
