"use client";

import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Rays } from "@/components/ui/backdrop";
import { Orb } from "@/components/ui/orb";
import { Disclaimer, Eyebrow, Glow, Handle, Human, PosterBackground, VariantNav, Wordmark } from "@/components/launch/poster";
import { EmailField, shareInvite, useWaitlist } from "@/components/launch/waitlist";
import { cn } from "@/lib/cn";
import { breath, haptic, spring } from "@/lib/motion";

/** 04 · One breath — hold the orb for one inhale to unlock early access. Shows Evo's calm before the ask. */

const tags = [
  { label: "Feeling stuck", dot: "#f08a5d", x: "-6%", y: "14%", rotate: -6 },
  { label: "Understood", dot: "#8b6cf0", x: "78%", y: "30%", rotate: 5 },
  { label: "One small step", dot: "#62bf3b", x: "70%", y: "82%", rotate: -4 },
];

const goals = ["Exams", "Deadlines", "Habits", "Overthinking"];
const R = 128;
const C = 2 * Math.PI * R;

type Phase = "idle" | "holding" | "released" | "open";

export default function BreatheVariant() {
  const reduce = useReducedMotion();
  const { signup, submit, reset } = useWaitlist("breathe");
  const [phase, setPhase] = useState<Phase>("idle");
  const [goal, setGoal] = useState<string | null>(null);
  const progress = useMotionValue(0);
  const dash = useTransform(progress, (p) => C * (1 - p));
  const scale = useTransform(progress, [0, 1], [1, 1.14]);
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const unlocked = phase === "open" || !!signup;

  const start = () => {
    if (unlocked) return;
    haptic("light");
    setPhase("holding");
    anim.current = animate(progress, 1, {
      duration: reduce ? 0.6 : breath.inhale * (1 - progress.get()),
      ease: "linear",
      onComplete: () => {
        haptic("success");
        setPhase("open");
      },
    });
  };
  const stop = () => {
    if (phase !== "holding") return;
    anim.current?.stop();
    setPhase("released");
    animate(progress, 0, { duration: 0.8, ease: [0.2, 0, 0, 1] });
  };

  const hint = { idle: "Press and hold the orb", holding: "Breathe in…", released: "Take your time. Hold for one full breath.", open: "And out. That’s Evo." }[phase];

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip text-t1">
      <PosterBackground tone="light" glow="center">
        <div
          className="absolute inset-x-0 top-0 h-[460px]"
          style={{ background: "linear-gradient(180deg, rgba(155,224,112,0.75) 0%, rgba(201,238,176,0.45) 55%, rgba(246,248,242,0) 100%)" }}
        />
      </PosterBackground>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-[640px] flex-col items-center px-5 pt-10 pb-32 text-center">
        <Wordmark tone="light" />
        <Eyebrow tone="light" className="mt-7">
          Evo by Lumid · early access
        </Eyebrow>
        <h1 className="mt-5 text-[38px] leading-[1.04] font-normal tracking-[-0.035em] text-forest md:text-[54px]">
          Before anything else,
          <br />
          <Human>take one breath.</Human>
        </h1>

        <div className="relative mt-6 size-[320px] shrink-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative size-0">
              <Rays cx={0} cy={0} inner={110} outer={unlocked ? 240 : 190} count={64} stroke={1.2} strokeOpacity={unlocked ? 0.9 : 0.55} />
            </div>
          </div>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 320 320" aria-hidden>
            <circle cx={160} cy={160} r={R} fill="none" stroke="rgba(36,46,33,0.08)" strokeWidth={3} />
            <motion.circle
              cx={160}
              cy={160}
              r={R}
              fill="none"
              stroke="#3f8f22"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ strokeDashoffset: unlocked ? 0 : dash }}
            />
          </svg>
          <motion.button
            type="button"
            aria-label={unlocked ? "Unlocked" : "Press and hold to breathe in"}
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && start()}
            onKeyUp={stop}
            onContextMenu={(e) => e.preventDefault()}
            style={{ scale: unlocked ? 1.06 : scale }}
            className={cn("absolute inset-[60px] touch-none rounded-full select-none", !unlocked && "cursor-pointer")}
          >
            <Orb size={200} state={phase === "holding" ? "still" : "breathing"} />
          </motion.button>
          {tags.map((t, i) => (
            <motion.span
              key={t.label}
              className="pointer-events-none absolute flex items-center gap-2 rounded-full border border-white bg-white/75 py-2 pr-3 pl-2.5 shadow-[0_10px_24px_-6px_rgba(26,64,20,0.12)] backdrop-blur-[10px]"
              style={{ left: t.x, top: t.y, rotate: t.rotate }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: unlocked || i === 0 ? 1 : 0.55, scale: 1, y: reduce ? 0 : [0, -5, 0] }}
              transition={{ opacity: { duration: 0.3 }, scale: spring.default, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 1.2 } }}
            >
              <span className="size-2 rounded-full" style={{ background: t.dot }} />
              <span className="type-label-s whitespace-nowrap text-ink">{t.label}</span>
            </motion.span>
          ))}
        </div>

        <p aria-live="polite" className="mt-2 h-6 type-label-m text-t2">
          {signup ? "" : hint}
        </p>

        <AnimatePresence mode="wait">
          {signup ? (
            <motion.section key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring.gentle} className="mt-4 flex w-full max-w-[460px] flex-col items-center">
              <p className="font-mono text-[11px] tracking-[0.16em] text-lime-deep uppercase">You’re on the list · #{signup.spot.toLocaleString("en-IN")}</p>
              <h2 className="mt-2 text-[30px] leading-[1.1] tracking-[-0.03em] text-forest">
                See you on the <Glow tone="light">calm side.</Glow>
              </h2>
              <p className="mt-2 type-body-m text-t2">Your invite goes to {signup.email}. Your first check-in takes 10 seconds.</p>
              <button
                type="button"
                onClick={() => shareInvite(signup.code)}
                className="mt-6 h-[54px] w-full cursor-pointer rounded-full type-label-m text-white shadow-[0_14px_14px_rgba(20,26,18,0.2)]"
                style={{ background: "var(--gradient-forest)" }}
              >
                Share a breath with a friend
              </button>
              <button type="button" onClick={reset} className="mt-4 cursor-pointer type-caption text-t3 underline underline-offset-4">
                Reset demo
              </button>
            </motion.section>
          ) : unlocked ? (
            <motion.section key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring.gentle} className="mt-4 flex w-full max-w-[480px] flex-col items-center">
              <p className="type-body-l text-t2">Evo starts every hard moment like this — then turns it into one small step.</p>
              <p className="mt-6 type-label-s text-t3">What keeps you stuck most?</p>
              <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={goal === g}
                    onClick={() => {
                      haptic("selection");
                      setGoal(g);
                    }}
                    className={cn(
                      "h-10 cursor-pointer rounded-full px-4 type-label-m transition-[background-color,border-color,box-shadow] duration-150",
                      goal === g ? "border-[1.5px] border-lime bg-lime-soft text-forest shadow-[0_6px_18px_rgba(135,217,94,0.45)]" : "border border-white bg-white/70 text-t3",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <EmailField tone="light" className="mt-6" autoFocus onSubmit={(email) => submit(email, goal ? { goal } : undefined)} />
            </motion.section>
          ) : (
            <motion.p key="why" exit={{ opacity: 0 }} className="mt-4 max-w-[380px] type-body-m text-t3">
              Hold for one inhale to unlock early access. No streaks. No guilt.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-auto flex flex-col items-center gap-2 pt-14">
          <Disclaimer tone="light" className="max-w-[420px]" />
          <Handle tone="light" />
        </div>
      </main>
      <VariantNav tone="light" />
    </div>
  );
}
