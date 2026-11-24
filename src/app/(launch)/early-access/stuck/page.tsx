"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Disclaimer, Eyebrow, Glow, Human, PosterBackground, VariantNav, Wordmark } from "@/components/launch/poster";
import { EmailField, shareInvite, useWaitlist } from "@/components/launch/waitlist";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";

/** 01 · Sound familiar — pick the line you tell yourself; Evo answers with a first step, then you join. */

const excuses = [
  { id: "lunch", line: "I’ll start after lunch.", cause: "Waiting to feel ready", step: "Open the file and write one messy line. Two minutes, then you can stop." },
  { id: "video", line: "Just one more video, then I’ll study.", cause: "Escaping a hard start", step: "Phone in another room. Set a 5-minute timer and read just one page." },
  { id: "fail", line: "What if I try and still fail?", cause: "Fear of not being good enough", step: "Do a ‘bad on purpose’ draft. Nobody sees it. It only has to exist." },
  { id: "much", line: "There’s too much. Where do I even begin?", cause: "Overwhelm", step: "Brain dump for 3 minutes. Then circle the smallest thing on the list." },
  { id: "tomorrow", line: "Tomorrow. I’ll do it properly tomorrow.", cause: "All-or-nothing thinking", step: "Do the ‘improper’ version tonight — 10 minutes counts as starting." },
];

const offsets = ["md:-translate-x-24", "md:translate-x-16", "md:-translate-x-8", "md:translate-x-24", "md:-translate-x-16"];

export default function StuckVariant() {
  const reduce = useReducedMotion();
  const { signup, submit, reset } = useWaitlist("stuck");
  const [picked, setPicked] = useState<string | null>(null);
  const [shown, setShown] = useState(0);
  const [shared, setShared] = useState<string | null>(null);
  const choice = excuses.find((e) => e.id === picked);
  const total = choice?.step.length ?? 0;
  const typed = choice ? choice.step.slice(0, reduce ? total : shown) : "";

  // Evo "types" its reply so it reads as a response, not a lookup.
  useEffect(() => {
    if (!choice || reduce) return;
    const t = setInterval(() => setShown((n) => (n >= total ? n : n + 2)), 22);
    return () => clearInterval(t);
  }, [choice, reduce, total]);

  const done = !!choice;

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip text-white">
      <PosterBackground tone="night" />
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[720px] flex-col items-center px-5 pt-12 pb-32 text-center">
        <Wordmark tone="night" />
        <Eyebrow tone="night" className="mt-8">
          Sound familiar?
        </Eyebrow>
        <h1 className="mt-6 text-[40px] leading-[1.04] font-normal tracking-[-0.035em] md:text-[64px]">
          Knowing what to do
          <br />
          isn’t the <Glow tone="night">hard part.</Glow>
        </h1>
        <p className="mt-3 text-[28px] text-lime md:text-[38px]">
          <Human>Starting is.</Human>
        </p>

        <AnimatePresence mode="wait">
          {!signup ? (
            <motion.section key="flow" exit={{ opacity: 0, y: -12 }} className="mt-10 flex w-full flex-col items-center">
              <p className="font-mono text-[11px] tracking-[0.16em] text-white/55 uppercase">{choice ? "Evo heard you" : "Tap the one you said this week"}</p>

              <ul className="mt-5 flex w-full flex-col items-center gap-3">
                {excuses.map((e, i) => {
                  const on = picked === e.id;
                  const dim = picked && !on;
                  return (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: dim ? 0.35 : 1, y: 0 }}
                      transition={{ ...spring.default, delay: picked ? 0 : 0.15 + i * 0.06 }}
                      className={cn("max-w-full", !picked && offsets[i])}
                    >
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          haptic("selection");
                          setShown(0);
                          setPicked(on ? null : e.id);
                        }}
                        aria-pressed={on}
                        className={cn(
                          "flex min-h-[54px] cursor-pointer items-center gap-3 rounded-[18px] border px-4 py-3 text-left type-body-l backdrop-blur-[12px] transition-[background-color,border-color,box-shadow] duration-200",
                          on
                            ? "border-lime/70 bg-[rgba(98,191,59,0.22)] text-white shadow-[0_0_0_4px_rgba(136,217,95,0.18),0_18px_40px_rgba(98,191,59,0.3)]"
                            : "border-white/14 bg-white/[0.07] text-white/85 hover:border-white/30 hover:bg-white/[0.1]",
                        )}
                      >
                        <Icon name="chat" size={18} className={on ? "text-lime" : "text-white/60"} />“{e.line.replace(/[“”]/g, "")}”
                      </motion.button>
                    </motion.li>
                  );
                })}
              </ul>

              <AnimatePresence>
                {choice && (
                  <motion.div
                    key={choice.id}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={spring.gentle}
                    className="mt-8 w-full max-w-[520px] rounded-[26px] border border-white/40 p-5 text-left text-ink shadow-[0_30px_60px_rgba(98,191,59,0.35)]"
                    style={{ background: "linear-gradient(160deg,#f3fbec 0%,#e4f7d6 55%,#c9eeb0 100%)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Orb size={30} state="thinking" />
                      <span className="type-label-m text-forest">Evo</span>
                      <span className="ml-auto rounded-full bg-white/70 px-2.5 py-1 type-caption text-lavender-text">Maybe: {choice.cause}</span>
                    </div>
                    <p className="mt-3 type-body-s text-t2">You’re not lazy. Starting just feels heavy right now. Here’s one small step:</p>
                    <p className="mt-2 min-h-[56px] text-[19px] leading-[26px] font-medium tracking-[-0.02em] text-forest">
                      {typed}
                      {!done && <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-forest" />}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="mt-8 w-full max-w-[520px]"
                animate={{ opacity: done ? 1 : 0.4 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-3 type-body-m text-white/75">{done ? "Want Evo to walk you through this — for real?" : "Pick a line to see what Evo would do."}</p>
                <EmailField tone="night" disabled={!done} onSubmit={(email) => submit(email, { excuse: choice?.id ?? "" })} />
              </motion.div>
            </motion.section>
          ) : (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.gentle}
              className="mt-10 flex w-full max-w-[520px] flex-col items-center"
            >
              <Orb size={120} state="breathing" />
              <p className="mt-6 font-mono text-[11px] tracking-[0.16em] text-lime uppercase">You’re in · spot #{signup.spot.toLocaleString("en-IN")}</p>
              <h2 className="mt-3 text-[30px] leading-[1.1] tracking-[-0.03em]">
                That was your first <Glow tone="night">small step.</Glow>
              </h2>
              <p className="mt-3 type-body-l text-white/70">
                We’ll email {signup.email} when your invite opens. Evo will remember the line you picked, so day one starts where you are.
              </p>
              <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => setShared(await shareInvite(signup.code))}
                  className="mt-7 flex h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 type-label-m text-ink"
                >
                  {shared === "copied" ? "Link copied" : "Send to a friend who says “tomorrow”"}
                </motion.button>
              <button type="button" onClick={reset} className="mt-4 cursor-pointer type-caption text-white/40 underline underline-offset-4">
                Reset demo
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        <Disclaimer tone="night" className="mt-12 max-w-[420px]" />
      </main>
      <VariantNav tone="night" />
    </div>
  );
}
