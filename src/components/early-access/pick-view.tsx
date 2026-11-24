"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode, type Ref } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Eyebrow, Glow, Human } from "@/components/launch/poster";
import { excuses, type ExcuseId } from "@/lib/early-access/content";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";

const STAGGER = ["", "desk:ml-0", "desk:ml-24", "desk:ml-8", "desk:ml-16"];

type Props = {
  excuseId: ExcuseId | null;
  onSelect: (id: ExcuseId) => void;
  onDeselect: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
  /** The email form (rendered by the flow so its state lives in one place). */
  form: ReactNode;
};

/**
 * Steps A and B in one view: tapping a line is what turns A into B (reply card appears, other lines dim).
 * Phone: stacked. ≥1200 px: copy + form on the left, lines + reply on the right.
 */
export function PickView({ excuseId, onSelect, onDeselect, headingRef, form }: Props) {
  const choice = excuses.find((e) => e.id === excuseId);

  return (
    <div className="grid grid-cols-1 gap-y-6 text-center desk:grid-cols-[minmax(0,600px)_minmax(0,1fr)] desk:items-center desk:gap-x-16 desk:gap-y-0 desk:text-left">
      <div className="flex flex-col items-center desk:col-start-1 desk:row-start-1 desk:items-start desk:self-end">
        <Eyebrow tone="night">Sound familiar?</Eyebrow>
        <h1
          ref={headingRef}
          tabIndex={-1}
          style={{ outline: "none" }} /* programmatic focus target only */
          className="mt-5 text-[clamp(34px,9.2vw,44px)] leading-[1.06] font-normal tracking-[-0.035em] md:text-[52px] desk:mt-6 desk:text-[60px] desk:leading-[1.04]"
        >
          Knowing what to do
          <br />
          isn’t the <Glow tone="night">hard part.</Glow>
        </h1>
        <p className="mt-1 text-[clamp(30px,8vw,38px)] text-[#d4f77a] desk:mt-2 desk:text-[56px]">
          <Human>Starting is.</Human>
        </p>
        <p className="mt-5 hidden max-w-[460px] type-body-l text-white/70 desk:block desk:text-[18px] desk:leading-[27px]">
          Tap the line you told yourself this week. Evo names what’s really going on — and gives you one small step you can take today.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 desk:col-start-2 desk:row-span-2 desk:row-start-1 desk:items-stretch desk:self-center">
        <p className={cn("font-mono text-[11px] tracking-[0.14em] uppercase", choice ? "text-lime" : "text-white/55")}>{choice ? "Evo heard you" : "Tap the one you said this week"}</p>
        <ul className="flex w-full flex-col items-center gap-2.5 desk:items-start" aria-label="Lines people tell themselves">
          {excuses.map((e, i) => {
            const on = e.id === excuseId;
            const dim = !!excuseId && !on;
            return (
              <li key={e.id} className={cn("flex max-w-full", STAGGER[i])}>
                <motion.button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    haptic("selection");
                    if (on) onDeselect();
                    else onSelect(e.id);
                  }}
                  animate={{ opacity: dim ? 0.35 : 1, scale: on ? [1, 1.04, 1] : 1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
                  className={cn(
                    "flex min-h-[54px] cursor-pointer items-center gap-3 rounded-[18px] border px-4 py-3 text-left type-body-l backdrop-blur-[12px] transition-[background-color,border-color,box-shadow] duration-200",
                    on
                      ? "border-lime/70 bg-[rgba(98,191,59,0.22)] text-white shadow-[0_0_0_4px_rgba(136,217,95,0.18),0_18px_40px_rgba(98,191,59,0.3)]"
                      : "border-white/14 bg-white/[0.07] text-white/85 hover:border-white/30 hover:bg-white/10",
                  )}
                >
                  <Icon name="chat" size={18} className={cn("shrink-0", on ? "text-lime" : "text-white/60")} />
                  <span>“{e.line}”</span>
                </motion.button>
              </li>
            );
          })}
        </ul>

        {/* Announced once, with the final text — the visible copy types out and is aria-hidden. */}
        <p className="sr-only" aria-live="polite">
          {choice ? `Evo: ${choice.step}` : ""}
        </p>
        <AnimatePresence mode="wait">{choice && <ReplyCard key={choice.id} choice={choice} />}</AnimatePresence>
      </div>

      <div className="desk:col-start-1 desk:row-start-2 desk:self-start desk:pt-8">
        <p className="mb-3 type-body-m text-white/75 desk:text-left">{choice ? "Want Evo to walk you through this — for real?" : "Pick a line to see what Evo would do — or just join."}</p>
        <div className="desk:max-w-[480px]">{form}</div>
      </div>
    </div>
  );
}

function ReplyCard({ choice }: { choice: (typeof excuses)[number] }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const shown = reduce ? choice.step.length : n;

  // Types 2 characters every 22 ms (≈1.5 s for the longest reply).
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setN((c) => (c >= choice.step.length ? c : c + 2)), 22);
    return () => clearInterval(t);
  }, [reduce, choice.step.length]);

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={reduce ? { duration: 0.2 } : spring.gentle}
      className="w-full rounded-[26px] border border-white/50 p-5 text-left text-ink shadow-[0_30px_60px_rgba(98,191,59,0.35)] desk:p-6"
      style={{ background: "linear-gradient(160deg,#f3fbec 0%,#e4f7d6 55%,#c9eeb0 100%)" }}
      aria-hidden
    >
      <div className="flex items-center gap-2.5">
        <Orb size={30} state="thinking" />
        <span className="type-label-m text-forest">Evo</span>
        <span className="ml-auto rounded-full bg-white/70 px-2.5 py-1 type-caption text-lavender-text">Maybe: {choice.cause}</span>
      </div>
      <p className="mt-3 type-body-s text-t2 desk:text-[14px] desk:leading-5">You’re not lazy. Starting just feels heavy right now. Here’s one small step:</p>
      <p className="mt-2 min-h-[56px] text-[19px] leading-[26px] font-medium tracking-[-0.02em] text-forest desk:min-h-[60px] desk:text-[24px] desk:leading-[30px]">
        {choice.step.slice(0, shown)}
        {shown < choice.step.length && <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-forest" />}
      </p>
    </motion.div>
  );
}
