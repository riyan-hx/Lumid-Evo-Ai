"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode, Ref } from "react";
import { Icon } from "@/components/ui/icons";
import { Eyebrow, Human } from "@/components/launch/poster";
import { excuses, type ExcuseId } from "@/lib/early-access/content";
import { cn } from "@/lib/cn";
import { EASE_OUT, haptic } from "@/lib/motion";
import { EvoPopover, useIsDesk } from "./evo-reply";

const STAGGER = ["", "desk:pl-0", "desk:pl-24", "desk:pl-8", "desk:pl-16"];

type Props = {
  excuseId: ExcuseId | null;
  onSelect: (id: ExcuseId) => void;
  onDeselect: () => void;
  /** Desktop popover visible (false once its CTA has been used). */
  answerOpen: boolean;
  /** CTA in the answer: hand off to the email field. */
  onUse: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
  /** The email form (rendered by the flow so its state lives in one place). */
  form: ReactNode;
};

/**
 * Steps A and B in one view. Phone: head → email → lines (the answer opens as a bottom sheet, rendered by the
 * flow). ≥1200 px: copy + email on the left, lines on the right with the answer as a popover on the clicked line.
 */
export function PickView({ excuseId, answerOpen, onSelect, onDeselect, onUse, headingRef, form }: Props) {
  const desk = useIsDesk();
  const choice = excuses.find((e) => e.id === excuseId);

  return (
    <div className="grid grid-cols-1 gap-y-7 text-center desk:grid-cols-[minmax(0,600px)_minmax(0,1fr)] desk:items-center desk:gap-x-16 desk:gap-y-0 desk:text-left">
      <div className="ea-dimmable flex flex-col items-center desk:col-start-1 desk:row-start-1 desk:items-start desk:self-end">
        <Eyebrow tone="light">Sound familiar?</Eyebrow>
        <h1
          ref={headingRef}
          tabIndex={-1}
          style={{ outline: "none" }} /* programmatic focus target only */
          className="mt-5 text-[clamp(34px,9.2vw,44px)] leading-[1.06] font-normal tracking-[-0.035em] text-forest md:text-[52px] desk:mt-6 desk:text-[60px] desk:leading-[1.04]"
        >
          Knowing what to do
          <br />
          isn’t the <span className="text-lime-deep">hard part.</span>
        </h1>
        <p className="mt-1 text-[clamp(30px,8vw,38px)] text-lime-deep desk:mt-2 desk:text-[56px]">
          <Human>Starting is.</Human>
        </p>
        <p className="mt-5 hidden max-w-[460px] type-body-l text-t2 desk:block desk:text-[18px] desk:leading-[27px]">
          Tap the line you told yourself this week. Evo names what’s really going on — and gives you one small step you can take today.
        </p>
      </div>

      <div className="ea-dimmable desk:col-start-1 desk:row-start-2 desk:self-start desk:pt-8">
        <p className="mb-3 hidden type-body-m text-t2 desk:block">{choice ? "Want Evo to walk you through this — for real?" : "Pick a line to see what Evo would do — or just join."}</p>
        <div className="desk:max-w-[480px]">{form}</div>
      </div>

      <div className="flex flex-col items-center gap-4 desk:col-start-2 desk:row-span-2 desk:row-start-1 desk:items-stretch desk:self-center">
        <p className={cn("ea-dimmable font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-300", choice ? "text-lime-deep" : "text-t3")}>{choice ? "Evo heard you" : "Tap the one you said this week"}</p>
        <ul className="flex w-full flex-col items-center gap-2.5 desk:items-start" aria-label="Lines people tell themselves">
          {excuses.map((e, i) => {
            const on = e.id === excuseId;
            const dim = !!excuseId && !on;
            return (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 + i * 0.07 }}
                className={cn("relative flex w-full max-w-full justify-center desk:justify-start", STAGGER[i], on && "z-40", !on && "ea-dimmable")}
              >
                <motion.button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    haptic("selection");
                    if (on) onDeselect();
                    else onSelect(e.id);
                  }}
                  animate={{ opacity: dim ? 0.45 : 1, scale: on ? [1, 1.04, 1] : 1 }}
                  whileHover={on ? undefined : { y: -2, boxShadow: "0 16px 28px -10px rgba(26,64,20,0.18)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ opacity: { duration: 0.25 }, scale: { duration: 0.28, ease: EASE_OUT }, y: { duration: 0.2 } }}
                  className={cn(
                    "group relative flex min-h-[54px] max-w-full cursor-pointer items-center gap-3 rounded-[18px] border px-4 py-3 text-left type-body-l transition-[background-color,border-color,box-shadow,color] duration-200",
                    on ? "border-[1.5px] border-lime bg-lime-soft text-forest shadow-[0_6px_18px_rgba(135,217,94,0.45)]" : "border-white bg-white/85 text-t2 shadow-[0_10px_13px_rgba(26,64,20,0.07)] hover:text-forest",
                  )}
                >
                  <Icon name="chat" size={18} className={cn("shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110", on ? "text-lime-deep" : "text-t3")} />
                  <span>“{e.line}”</span>
                  {on && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[18px] ring-2 ring-lime/50 motion-safe:animate-ping [animation-iteration-count:1] [animation-duration:900ms]" />}
                </motion.button>

                {/* desktop popover, attached to this line */}
                <AnimatePresence>{desk && on && answerOpen && <EvoPopover key={e.id} choice={e} onClose={onDeselect} onUse={onUse} onAnother={onDeselect} />}</AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
        {/* announced once, with the final text — visible copy types out and is aria-hidden */}
        <p className="sr-only" aria-live="polite">
          {choice ? `Evo: ${choice.step}` : ""}
        </p>
        <p className="ea-dimmable mt-2 type-body-m text-t3 desk:hidden">Pick a line to see what Evo would do.</p>
      </div>
    </div>
  );
}
