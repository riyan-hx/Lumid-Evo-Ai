"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Disclaimer, Eyebrow, Glow, Human, PosterBackground, VariantNav, Wordmark } from "@/components/launch/poster";
import { EmailField, shareInvite, shareLink, useWaitlist, waitlistCount, type Signup } from "@/components/launch/waitlist";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";

/** 02 · Evo Pass — "Introducing EVO" hero; joining mints a tiltable pass and a 3-friend ladder to Wave 1. */

const personas = ["Student", "Exam aspirant", "Young professional"] as const;

const ladder = [
  { n: 0, label: "On the list", note: "Wave 3 invite" },
  { n: 1, label: "Moved up", note: "Wave 2 invite" },
  { n: 3, label: "Founding member", note: "Wave 1 + founder badge" },
];

export default function PassVariant() {
  const { signup, submit, reset } = useWaitlist("pass");
  const [persona, setPersona] = useState<(typeof personas)[number]>("Student");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the live count depends on the client clock
    setCount(waitlistCount());
    const t = setInterval(() => setCount((c) => (c ?? 0) + 1), 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip text-white">
      <PosterBackground tone="night">
        <Crosshairs />
      </PosterBackground>
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[760px] flex-col items-center px-5 pt-12 pb-32 text-center">
        <Wordmark tone="night" />

        <AnimatePresence mode="wait">
          {!signup ? (
            <motion.section key="hero" exit={{ opacity: 0, scale: 0.98 }} className="flex w-full flex-col items-center">
              <p className="mt-14 text-[34px] font-light tracking-[-0.03em] text-white/85 md:text-[52px]">Introducing</p>
              <h1
                className="-mt-1 text-[120px] leading-[0.9] font-medium tracking-[-0.05em] md:text-[200px]"
                style={{
                  backgroundImage: "linear-gradient(180deg,#e9ffd0 0%,#a3e27d 55%,#62bf3b 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 0 28px rgba(163,226,125,0.45))",
                }}
              >
                EVO
              </h1>
              <p className="mt-5 max-w-[440px] type-body-l text-white/70">
                Get unstuck, <Glow tone="night">one small step</Glow> at a time. Early access opens in waves — claim your pass.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="I am a">
                {personas.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={persona === p}
                    onClick={() => {
                      haptic("selection");
                      setPersona(p);
                    }}
                    className={cn(
                      "h-10 cursor-pointer rounded-full border px-4 type-label-m transition-colors duration-150",
                      persona === p ? "border-lime bg-lime/15 text-lime" : "border-white/15 bg-white/5 text-white/70 hover:text-white",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <EmailField tone="night" cta="Claim my pass" className="mt-5 max-w-[500px]" onSubmit={(email) => submit(email, { persona })} />

              <div className="mt-5 flex items-center gap-2.5 type-body-s text-white/60">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-70" />
                  <span className="relative size-2 rounded-full bg-lime" />
                </span>
                <span className="tabular-nums">{count ? count.toLocaleString("en-IN") : "—"}</span> people already waiting
              </div>

              <PassCard preview persona={persona} />
            </motion.section>
          ) : (
            <motion.section key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 flex w-full flex-col items-center">
              <Eyebrow tone="night">Your Evo Pass</Eyebrow>
              <h2 className="mt-5 text-[34px] leading-[1.06] tracking-[-0.03em] md:text-[44px]">
                You’re in. <Human className="text-lime">Welcome early.</Human>
              </h2>
              <PassCard signup={signup} persona={signup.meta?.persona ?? persona} />
              <Ladder signup={signup} />
              <button type="button" onClick={reset} className="mt-6 cursor-pointer type-caption text-white/40 underline underline-offset-4">
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

function PassCard({ signup, persona, preview }: { signup?: Signup; persona: string; preview?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 200, damping: 20 });
  const sheen = useTransform(mx, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      initial={preview ? { opacity: 0, y: 40 } : { opacity: 0, rotateY: -90, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
      transition={{ ...spring.gentle, delay: preview ? 0.3 : 0.1 }}
      className={cn("mt-10 w-full max-w-[380px] [perspective:1000px]", preview && "pointer-events-none mb-[-140px] opacity-90 md:mb-[-80px]")}
    >
      <motion.div
        onPointerMove={(e) => {
          if (reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        style={{ rotateX: preview ? 18 : rx, rotateY: preview ? 0 : ry, transformStyle: "preserve-3d" }}
        className="relative aspect-[1.6/1] overflow-hidden rounded-[28px] border border-white/50 p-5 text-left text-ink shadow-[0_40px_80px_rgba(98,191,59,0.35),inset_0_1px_0_rgba(255,255,255,0.8)]"
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(140deg,#f3fbec 0%,#c9eeb0 45%,#88d95f 100%)" }} />
        <motion.div
          className="absolute inset-y-0 w-[60%] -skew-x-12 opacity-50 mix-blend-overlay"
          style={{ left: sheen, x: "-50%", background: "linear-gradient(90deg,transparent,#fff,transparent)" }}
        />
        <svg aria-hidden className="absolute -right-10 -bottom-16 size-[260px] opacity-40" viewBox="-100 -100 200 200">
          {Array.from({ length: 48 }, (_, i) => {
            const a = (i / 48) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 40} y1={Math.sin(a) * 40} x2={Math.cos(a) * 100} y2={Math.sin(a) * 100} stroke="white" strokeWidth={1} />;
          })}
        </svg>
        <div className="absolute right-6 bottom-6">
          <Orb size={72} state="breathing" />
        </div>

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold tracking-[0.04em] text-lime-deep">LUMID EVO</span>
            <span className="rounded-full bg-forest px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-lime uppercase">Early access</span>
          </div>
          <p className="mt-auto font-mono text-[10px] tracking-[0.14em] text-forest/60 uppercase">Pass no.</p>
          <p className="text-[44px] leading-none font-medium tracking-[-0.04em] text-forest tabular-nums">
            #{signup ? signup.spot.toLocaleString("en-IN") : "????"}
          </p>
          <div className="mt-3 flex gap-5 font-mono text-[10px] tracking-[0.1em] text-forest/70 uppercase">
            <span>
              {persona}
            </span>
            <span>{signup ? signup.code : "EVO-····"}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Ladder({ signup }: { signup: Signup }) {
  const [invites, setInvites] = useState(0);
  const [copied, setCopied] = useState(false);
  const level = ladder.reduce((acc, l, i) => (invites >= l.n ? i : acc), 0);

  return (
    <div className="mt-10 w-full max-w-[520px] rounded-[26px] border border-white/12 bg-white/[0.06] p-5 text-left backdrop-blur-[14px]">
      <div className="flex items-baseline justify-between">
        <p className="type-title-m">Skip the queue</p>
        <p className="font-mono text-[11px] tracking-[0.1em] text-white/50">{Math.min(invites, 3)} / 3 FRIENDS</p>
      </div>
      <p className="mt-1 type-body-s text-white/60">Each friend who joins with your link moves you up a wave.</p>

      <ol className="mt-5 grid grid-cols-3 gap-2">
        {ladder.map((l, i) => (
          <li key={l.label} className="flex flex-col gap-2">
            <span className="h-1.5 overflow-hidden rounded-full bg-white/12">
              <motion.span
                className="block h-full rounded-full bg-lime shadow-[0_0_12px_rgba(136,217,95,0.8)]"
                initial={false}
                animate={{ width: i <= level ? "100%" : "0%" }}
                transition={spring.gentle}
              />
            </span>
            <span className={cn("type-label-s", i <= level ? "text-white" : "text-white/45")}>{l.label}</span>
            <span className="type-caption text-white/45">{l.note}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-center gap-2 rounded-full border border-white/12 bg-black/30 p-1.5 pl-4">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-white/70">{shareLink(signup.code).replace("https://", "")}</span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={async () => {
            const r = await shareInvite(signup.code);
            if (r === "cancelled") return;
            setCopied(r === "copied");
            // Demo only: count the share as a joined friend so the ladder can be previewed.
            setInvites((n) => n + 1);
          }}
          className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 type-label-s text-ink"
        >
          <Icon name={copied ? "check" : "send"} size={15} />
          {copied ? "Copied" : "Share"}
        </motion.button>
      </div>
    </div>
  );
}

/** "Crosshair Night" grid from the post guide: small lime plus marks on a wide grid. */
function Crosshairs() {
  return (
    <svg className="absolute inset-0 size-full" style={{ maskImage: "linear-gradient(180deg,transparent 0%,#000 15%,#000 55%,transparent 85%)" }}>
      <defs>
        <pattern id="evo-cross" width="132" height="132" patternUnits="userSpaceOnUse" x="50%">
          <path d="M66 61v10M61 66h10" stroke="#a3e27d" strokeOpacity="0.45" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#evo-cross)" />
    </svg>
  );
}
