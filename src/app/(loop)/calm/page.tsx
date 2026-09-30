"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton, IconButton } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { breath, ease, haptic, spring } from "@/lib/motion";

type Phase = "in" | "hold" | "out";
const ROUNDS = 5;
const phases: { key: Phase; label: string; hint: string; secs: number; scale: number }[] = [
  { key: "in", label: "Breathe in", hint: "slowly, through your nose", secs: breath.inhale, scale: 1.1 },
  { key: "hold", label: "Hold", hint: "soft shoulders, easy jaw", secs: breath.hold, scale: 1.1 },
  { key: "out", label: "Breathe out", hint: "long and slow, through your mouth", secs: breath.exhale, scale: 0.85 },
];

const RING_R = 122;
const RING_C = 2 * Math.PI * RING_R;

/** 07 · Calm space — guided 4-2-6 breathing. Works offline; crisis link always visible. */
export default function Calm() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [round, setRound] = useState(1);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [finished, setFinished] = useState(false);
  const phase = phases[index];

  const arc = useMotionValue(0);
  const offset = useTransform(arc, (p) => RING_C * (1 - p));
  const dot = useTransform(arc, (p) => {
    const a = p * Math.PI * 2 - Math.PI / 2;
    return `translate(${RING_R * Math.cos(a)}px, ${RING_R * Math.sin(a)}px)`;
  });

  useEffect(() => {
    if (paused || finished) return;
    haptic("selection");
    arc.set(0);
    const draw = animate(arc, 1, { duration: phase.secs, ease: "linear" });
    const t = setTimeout(() => {
      if (index < phases.length - 1) return setIndex(index + 1);
      if (round >= ROUNDS) return setFinished(true);
      setRound(round + 1);
      setIndex(0);
    }, phase.secs * 1000);
    return () => {
      draw.stop();
      clearTimeout(t);
    };
  }, [index, round, paused, finished, phase.secs, arc]);

  // Seconds left in the current phase, derived from the ring progress.
  const [left, setLeft] = useState(phase.secs);
  useEffect(() => arc.on("change", (p) => setLeft(Math.max(1, Math.ceil(phase.secs * (1 - p))))), [arc, phase.secs]);

  return (
    <Screen dark glows={glows.calm} background="linear-gradient(115deg, #33412e 0%, #151a13 71.43%)">
      <div className="flex flex-1 flex-col pt-[54px]">
        <div className="relative flex h-11 items-center justify-between px-5">
          <BackButton dark />
          <span className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/14 bg-white/8 py-2 pr-3.5 pl-3 type-label-s text-white/90 backdrop-blur-[12px]">
            <span className="size-1.5 rounded-full bg-lime" />
            Calm space
          </span>
          <IconButton icon="moon" label="Sleep mode" dark />
        </div>

        <p className="mt-[26px] text-center type-body-l text-white/70">Let’s slow things down together.</p>

        {/* Rings + orb, centred at (196, 330) in the Figma frame */}
        <div className="relative mx-auto mt-0 size-[360px] shrink-0">
          <span className="absolute inset-0 rounded-full border-[1.2px] border-[#a3e27d]/8" />
          <span className="absolute inset-[30px] rounded-full border-[1.2px] border-[#a3e27d]/14" />
          <span className="absolute inset-[58px] rounded-full border-[1.2px] border-[#a3e27d]/24" />
          <svg viewBox="-180 -180 360 360" className="absolute inset-0 size-full overflow-visible">
            <defs>
              <filter id="calm-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#88d95f" floodOpacity="0.7" />
              </filter>
            </defs>
            <motion.circle
              r={RING_R}
              fill="none"
              stroke="#88d95f"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              style={{ strokeDashoffset: offset }}
              transform="rotate(-90)"
              filter="url(#calm-glow)"
            />
          </svg>
          <motion.span
            className="absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 size-3 rounded-full bg-white shadow-[0_0_8px_rgba(135,217,94,0.9)]"
            style={{ transform: dot }}
          />
          <motion.div
            className="absolute top-[55px] left-[55px]"
            animate={reduce ? undefined : { scale: finished ? 1 : phase.scale }}
            transition={{ duration: paused ? 0.4 : phase.secs, ease: "easeInOut" }}
          >
            <Orb size={250} state="still" />
          </motion.div>
        </div>

        <div className="mt-[-10px] flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={finished ? "done" : phase.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={ease.out}
              className="text-[40px] leading-none font-medium tracking-[-1.2px] text-white"
            >
              {finished ? "Well done" : phase.label}
            </motion.p>
          </AnimatePresence>
          <p className="mt-3 type-body-m text-white/60">
            {finished ? "Five slow rounds. Notice how you feel." : `${left} · ${phase.hint}`}
          </p>

          <div className="mt-[22px] flex gap-1.5 rounded-full border border-white/14 bg-white/6 p-1.5 type-label-s backdrop-blur-[12px]">
            {phases.map((p, i) => {
              const on = !finished && i === index;
              return (
                <span
                  key={p.key}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors duration-[240ms]",
                    on ? "text-forest" : "",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="calm-phase"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "linear-gradient(151deg, #a3e27d 0%, #62bf3b 71.43%)" }}
                      transition={spring.default}
                    />
                  )}
                  <span className={cn("relative", !on && "text-white/75")}>{p.key === "in" ? "In" : p.key === "hold" ? "Hold" : "Out"}</span>
                  <span className={cn("relative", !on && "text-white/45")}>{p.secs}s</span>
                </span>
              );
            })}
          </div>
          <p className="mt-3 type-caption text-white/50">
            Round {Math.min(round, ROUNDS)} of {ROUNDS}
          </p>
        </div>

        <div className="mt-[22px] flex items-center justify-center gap-7">
          <button type="button" onClick={() => setSound((s) => !s)} className="flex cursor-pointer flex-col items-center gap-1.5" aria-pressed={sound}>
            <span
              className={cn(
                "flex size-[52px] items-center justify-center rounded-[26px] border border-white/14 backdrop-blur-[12px] transition-colors",
                sound ? "bg-white/20 text-white" : "bg-white/8 text-white/90",
              )}
            >
              <Icon name="sun" size={20} />
            </span>
            <span className="type-caption text-white/60">{sound ? "Sound on" : "Sound"}</span>
          </button>
          <motion.button
            type="button"
            aria-label={paused ? "Resume" : "Pause"}
            onClick={() => {
              haptic("light");
              if (finished) {
                setFinished(false);
                setRound(1);
                setIndex(0);
                return;
              }
              setPaused((p) => !p);
            }}
            whileTap={{ scale: 0.94 }}
            transition={spring.snappy}
            className="relative flex size-[76px] cursor-pointer items-center justify-center rounded-[38px] text-forest shadow-[0_10px_30px_-4px_rgba(135,217,94,0.55),inset_0_2px_2px_rgba(255,255,255,0.45)]"
            style={{ background: "linear-gradient(135deg, #a3e27d 0%, #62bf3b 71.43%)" }}
          >
            <Icon name={paused || finished ? "arrow-right" : "pause"} size={28} />
          </motion.button>
          <button type="button" onClick={() => router.push("/home")} className="flex cursor-pointer flex-col items-center gap-1.5">
            <span className="flex size-[52px] items-center justify-center rounded-[26px] border border-white/14 bg-white/8 text-white/90 backdrop-blur-[12px]">
              <Icon name="check" size={20} />
            </span>
            <span className="type-caption text-white/60">Done</span>
          </button>
        </div>

        <div className="mt-auto px-6 pt-6 pb-[26px]">
          <button
            type="button"
            onClick={() => router.push("/crisis")}
            className="flex h-12 w-full cursor-pointer items-center gap-2.5 rounded-[20px] border border-white/14 bg-white/7 pr-4 pl-3.5 text-left backdrop-blur-[12px]"
          >
            <Icon name="lifebuoy" size={18} className="text-lime" />
            <span className="flex-1 type-label-s text-white/85">Feeling unsafe? Talk to someone now</span>
            <Icon name="chevron-right" size={16} className="text-white/60" />
          </button>
        </div>
      </div>
    </Screen>
  );
}
