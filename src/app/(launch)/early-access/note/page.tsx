"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Orb } from "@/components/ui/orb";
import { Disclaimer, Eyebrow, Glow, Handle, Human, PosterBackground, VariantNav, Wordmark } from "@/components/launch/poster";
import { EmailField, shareInvite, useWaitlist } from "@/components/launch/waitlist";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";

/** 03 · Note to you — write what you keep putting off; Evo seals it and hands it back on your first day. */

const prompts = ["Revising for my exam", "Replying to that email", "Starting my side project", "Going to the gym"];
const MAX = 140;

export default function NoteVariant() {
  const { signup, submit, reset } = useWaitlist("note");
  const [note, setNote] = useState("");
  const [sealing, setSealing] = useState(false);
  const ready = note.trim().length >= 3;

  const join = async (email: string) => {
    setSealing(true);
    await submit(email, { note: note.trim() });
    setSealing(false);
  };

  const text = signup?.meta?.note ?? note;

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip text-t1">
      <PosterBackground tone="light" glow="bottom">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(63,143,34,0.35) 1.2px, transparent 1.6px)",
            backgroundSize: "14px 14px",
            maskImage: "radial-gradient(70% 55% at 100% 0%, #000 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(70% 55% at 100% 0%, #000 0%, transparent 70%)",
          }}
        />
      </PosterBackground>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-[1080px] flex-col px-5 pt-10 pb-32 md:px-10">
        <header className="flex items-center justify-between">
          <Wordmark tone="light" />
          <span className="font-mono text-[10px] tracking-[0.14em] text-t3 uppercase">For students &amp; young pros</span>
        </header>

        <div className="mt-12 grid flex-1 items-start gap-10 md:mt-20 md:grid-cols-[1fr_440px] md:gap-16">
          <section>
            <Eyebrow tone="light">Notes from past you</Eyebrow>
            <h1 className="mt-6 text-[42px] leading-[1.02] font-normal tracking-[-0.04em] text-forest md:text-[64px]">
              What have you been <Glow tone="light">putting off?</Glow>
            </h1>
            <p className="mt-5 max-w-[460px] type-body-l text-t2">
              Write it down. Evo seals it and hands it back on your first day — <Human className="text-forest">so you start where you really are.</Human>
            </p>
            <ul className="mt-8 hidden flex-col gap-3 md:flex">
              {["Evo finds what’s keeping you stuck", "Turns it into one small step for today", "Checks in after. No streaks. No guilt."].map((t, i) => (
                <li key={t} className="flex items-center gap-3 type-body-m text-t2">
                  <span className="font-mono text-[11px] text-lime-deep">0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section className="relative">
            <AnimatePresence mode="wait">
              {!signup ? (
                <motion.div
                  key="write"
                  exit={{ y: 30, scale: 0.94, opacity: 0, rotate: -2 }}
                  transition={spring.default}
                  className="relative rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_24px_50px_rgba(26,64,20,0.1)] backdrop-blur-[14px]"
                >
                  <div className="flex items-center gap-2.5">
                    <Orb size={28} state="idle" />
                    <span className="type-label-m text-forest">A note to future you</span>
                    <span className={cn("ml-auto font-mono text-[11px] tabular-nums", note.length > MAX - 20 ? "text-peach-text" : "text-t3")}>
                      {note.length}/{MAX}
                    </span>
                  </div>
                  <label htmlFor="ea-note" className="sr-only">
                    What have you been putting off?
                  </label>
                  <div className="relative mt-4 rounded-[18px] bg-[#fbfcf8] p-4" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 31px, #ecefed 31px 32px)" }}>
                    <textarea
                      id="ea-note"
                      rows={4}
                      maxLength={MAX}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="I keep saying I’ll start…"
                      className="block w-full resize-none bg-transparent font-serif text-[20px] leading-[32px] text-forest italic outline-none placeholder:text-t-disabled"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          haptic("selection");
                          setNote(`I keep putting off ${p.charAt(0).toLowerCase()}${p.slice(1)}.`);
                        }}
                        className="h-8 cursor-pointer rounded-full border border-line-strong bg-white px-3 type-label-s text-t2 transition-colors hover:border-lime hover:text-forest"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <motion.div animate={{ opacity: ready ? 1 : 0.45 }} className="mt-6 border-t border-dashed border-line-strong pt-5">
                    <p className="mb-3 type-label-s text-t2">Where should Evo deliver it?</p>
                    <EmailField tone="light" cta={sealing ? "Sealing" : "Seal it"} disabled={!ready} onSubmit={join} />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="sealed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={spring.gentle} className="flex flex-col items-center text-center">
                  <Envelope text={text} />
                  <p className="mt-8 font-mono text-[11px] tracking-[0.16em] text-lime-deep uppercase">Sealed · spot #{signup.spot.toLocaleString("en-IN")}</p>
                  <h2 className="mt-2 text-[30px] leading-[1.1] tracking-[-0.03em] text-forest">It opens with your invite.</h2>
                  <p className="mt-2 max-w-[360px] type-body-m text-t2">
                    We’ll send it to {signup.email}. Until then, Evo is keeping it safe — only you will read it.
                  </p>
                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      onClick={() => shareInvite(signup.code)}
                      className="h-12 cursor-pointer rounded-full px-5 type-label-m text-white"
                      style={{ background: "var(--gradient-forest)" }}
                    >
                      Ask a friend to write one
                    </button>
                  </div>
                  <button type="button" onClick={reset} className="mt-4 cursor-pointer type-caption text-t3 underline underline-offset-4">
                    Reset demo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <footer className="mt-14 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <Disclaimer tone="light" className="max-w-[420px]" />
          <Handle tone="light" />
        </footer>
      </main>
      <VariantNav tone="light" />
    </div>
  );
}

function Envelope({ text }: { text: string }) {
  return (
    <div className="relative w-full max-w-[380px] [perspective:900px]">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 40, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.1, times: [0, 0.2, 0.7, 1], ease: [0.2, 0, 0, 1] }}
        className="absolute inset-x-8 top-0 z-0 rounded-[14px] bg-white p-4 text-left font-serif text-[15px] text-forest italic shadow-md"
      >
        {text}
      </motion.div>
      <div className="relative z-10 aspect-[1.55/1] overflow-hidden rounded-[22px] shadow-[0_30px_60px_rgba(63,143,34,0.25)]" style={{ background: "linear-gradient(160deg,#f3fbec 0%,#d9f5e6 100%)" }}>
        <svg aria-hidden className="absolute inset-0 size-full" viewBox="0 0 380 245" preserveAspectRatio="none">
          <path d="M0 245 L190 120 L380 245" fill="#e4f7d6" stroke="#c8e8d9" />
        </svg>
        <motion.svg
          aria-hidden
          className="absolute inset-x-0 top-0 h-[60%] w-full origin-top"
          viewBox="0 0 380 147"
          preserveAspectRatio="none"
          initial={{ rotateX: 180 }}
          animate={{ rotateX: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease: [0.2, 0, 0, 1] }}
        >
          <path d="M0 0 L190 147 L380 0 Z" fill="#c9eeb0" stroke="#a3e27d" />
        </motion.svg>
        <motion.div
          aria-hidden
          className="absolute top-[46%] left-1/2 -ml-8 flex size-16 items-center justify-center drop-shadow-[0_6px_10px_rgba(63,143,34,0.4)]"
          initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 1.35, type: "spring", stiffness: 420, damping: 18 }}
          onAnimationComplete={() => haptic("success")}
        >
          <span
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg,#4ca22c 0%,#1b6000 100%)", WebkitMask: "url(/evo/seal.svg) center / contain no-repeat", mask: "url(/evo/seal.svg) center / contain no-repeat" }}
          />
          <Orb size={30} state="still" />
        </motion.div>
      </div>
    </div>
  );
}
