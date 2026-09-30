"use client";

import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton, SoftChip } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { ease, haptic, spring } from "@/lib/motion";

const TOTAL = 25 * 60;
const R = 128; // ring centreline
const C = 2 * Math.PI * R;
const IDLE_PROMPT = 3 * 60;

const lines = {
  start: "I’m here. One line at a time.",
  mid: "Halfway. You’re doing it.",
  end: "Two minutes left. Ease in to a stop.",
};

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** 10 · Focus with Evo — full-screen, no nav. The ring advances continuously. */
export default function Focus() {
  return (
    <Suspense>
      <FocusScreen />
    </Suspense>
  );
}

function FocusScreen() {
  const router = useRouter();
  // A step handed over from the Unstuck ladder (or anywhere else) via ?task=.
  const task = useSearchParams().get("task")?.trim() || "Open to page 112";
  const [paused, setPaused] = useState(false);
  const [stuck, setStuck] = useState(false);
  const progress = useMotionValue(0);
  const [elapsed, setElapsed] = useState(0);

  // Frame clock on a motion value → the ring advances continuously without re-rendering React.
  useAnimationFrame((_, delta) => {
    if (paused) return;
    const next = Math.min(1, progress.get() + delta / 1000 / TOTAL);
    progress.set(next);
    const secs = Math.floor(next * TOTAL);
    if (secs !== elapsed) setElapsed(secs);
  });
  const dashOffset = useTransform(progress, (p) => C * (1 - p));
  const knobX = useTransform(progress, (p) => 150 + R * Math.cos(p * 2 * Math.PI - Math.PI / 2));
  const knobY = useTransform(progress, (p) => 150 + R * Math.sin(p * 2 * Math.PI - Math.PI / 2));

  const done = elapsed >= TOTAL;
  const idle = elapsed >= IDLE_PROMPT;
  useEffect(() => {
    if (done) haptic("light");
  }, [done]);

  const line = elapsed >= TOTAL - 120 ? lines.end : elapsed >= TOTAL / 2 ? lines.mid : lines.start;

  return (
    <Screen glows={glows.focus}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <div className="relative flex h-11 items-center px-5">
          <BackButton />
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-[7px] rounded-full border border-white bg-white/78 py-2 pr-3.5 pl-3 backdrop-blur-[12px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]">
            <motion.span
              className="size-2 rounded-full bg-lime shadow-[0_0_6px_1px_rgba(135,217,94,1)]"
              animate={paused ? { opacity: 0.4 } : { opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: paused ? 0 : Infinity }}
            />
            <span className="type-label-s whitespace-nowrap text-ink">{paused ? "Paused — take your time" : "Evo is focusing with you"}</span>
          </div>
        </div>

        <div className="glass mx-6 mt-6 flex h-[60px] items-center gap-3 rounded-[22px] py-2.5 pr-4 pl-2.5">
          <span className="flex size-10 items-center justify-center rounded-[14px] bg-sky-soft text-sky-text">
            <Icon name="book" size={19} />
          </span>
          <div className="flex flex-col gap-px">
            <span className="type-label-m text-ink">{task}</span>
            <span className="type-caption text-t3">Then keep going if it feels okay</span>
          </div>
        </div>

        {/* Ring */}
        <div className="relative mx-auto mt-6 size-[300px]">
          <div className="absolute top-[22px] left-[22px] size-64 rounded-full border-[14px] border-white bg-white/55 shadow-[0_24px_50px_-10px_rgba(51,115,26,0.15)] backdrop-blur-[20px]" />
          <svg viewBox="0 0 300 300" className="absolute inset-0 size-full overflow-visible">
            <defs>
              <linearGradient id="focus-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0.3" stopColor="#a3e27d" />
                <stop offset="1" stopColor="#3f8f22" />
              </linearGradient>
              <filter id="focus-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#61bf3b" floodOpacity="0.45" />
              </filter>
            </defs>
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const major = i % 5 === 0;
              const r1 = 104;
              const r2 = major ? 96 : 100;
              return (
                <line
                  key={i}
                  x1={(150 + r1 * Math.cos(a)).toFixed(2)}
                  y1={(150 + r1 * Math.sin(a)).toFixed(2)}
                  x2={(150 + r2 * Math.cos(a)).toFixed(2)}
                  y2={(150 + r2 * Math.sin(a)).toFixed(2)}
                  stroke="#242e21"
                  strokeOpacity={major ? 0.25 : 0.1}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx="150" cy="22" r="7" fill="#a3e27d" />
            <motion.circle
              cx="150"
              cy="150"
              r={R}
              fill="none"
              stroke="url(#focus-arc)"
              strokeWidth="14"
              strokeDasharray={C}
              style={{ strokeDashoffset: dashOffset }}
              transform="rotate(-90 150 150)"
              filter="url(#focus-glow)"
            />
            <motion.circle cx={knobX} cy={knobY} r="8.5" fill="white" stroke="#3f8f22" strokeWidth="5" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[64px] leading-[1.06] font-medium tracking-[-1.92px] text-forest">{mmss(elapsed)}</span>
            <span className="mt-1.5 type-body-s text-t3">
              of {mmss(TOTAL)} · {paused ? "paused" : "you’re in the flow"}
            </span>
          </div>
        </div>

        <div className="mt-[22px] flex justify-center">
          <div className="flex items-center gap-2.5 rounded-full border border-white bg-white/90 py-2 pr-4 pl-2 backdrop-blur-[12px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]">
            <Orb size={30} state="breathing" />
            <AnimatePresence mode="wait">
              <motion.span key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={ease.out} className="type-label-m text-ink">
                {line}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          onPointerDown={() => setStuck(true)}
          className="glass mx-6 mt-5 flex cursor-pointer flex-col gap-2.5 rounded-3xl px-[18px] py-3.5 text-left"
          animate={{ borderColor: stuck || idle ? "#88d95f" : "#ffffff" }}
        >
          <span className="flex items-center gap-2">
            <Icon name="heart" size={16} className="text-peach-text" />
            <span className="type-label-m text-ink">Stuck for a minute? That’s okay.</span>
          </span>
          <span className="flex gap-1.5">
            <SoftChip label="Make it smaller" height={36} onClick={() => router.push("/chat?checkedIn=1")} />
            <SoftChip label="Talk it out" height={36} onClick={() => router.push("/chat?checkedIn=1")} />
            <SoftChip label="2-min break" height={36} onClick={() => router.push("/calm")} />
          </span>
        </motion.div>

        <p className="mt-[18px] text-center type-caption text-t2">Notifications paused until you check in</p>

        <div className="mt-auto flex gap-3 px-6 pt-8 pb-10">
          <motion.button
            type="button"
            aria-label={paused ? "Resume" : "Pause"}
            onClick={() => {
              haptic("light");
              setPaused((p) => !p);
            }}
            whileTap={{ scale: 0.92 }}
            transition={spring.snappy}
            className="glass flex size-[58px] shrink-0 cursor-pointer items-center justify-center rounded-[29px] text-ink"
          >
            {paused ? <Icon name="arrow-right" size={20} /> : <Icon name="pause" size={20} />}
          </motion.button>
          <Pill label="I did a bit — check in" className="flex-1" confirm href="/wins" />
        </div>
      </div>
    </Screen>
  );
}
