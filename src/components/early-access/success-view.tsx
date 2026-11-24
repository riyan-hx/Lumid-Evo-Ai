"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Eyebrow, Human } from "@/components/launch/poster";
import { WAVES, waveFor, type Signup } from "@/lib/early-access/content";
import { track } from "@/lib/early-access/client";
import { cn } from "@/lib/cn";
import { EASE_OUT, spring } from "@/lib/motion";
import { EvoPass } from "./evo-pass";

const nf = new Intl.NumberFormat("en-IN");

type Props = { signup: Signup; email?: string; confirmed: boolean };

const RAYS = Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  return `M${(Math.cos(a) * 55).toFixed(1)} ${(Math.sin(a) * 55).toFixed(1)}L${(Math.cos(a) * 100).toFixed(1)} ${(Math.sin(a) * 100).toFixed(1)}`;
}).join("");

/** Step C. Pending: “Almost in.” + confirm banner. Confirmed (email link): “You’re in.”, no banner. */
export function SuccessView({ signup, email, confirmed }: Props) {
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [toast, setToast] = useState(!confirmed);
  const wave = waveFor(signup.invites);
  const level = signup.invites >= 3 ? 2 : signup.invites >= 1 ? 1 : 0;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const steps = [
    { a: confirmed ? "Email confirmed" : "Confirm your email", b: confirmed ? "your spot is locked in" : "one tap, from the link we just sent", done: confirmed },
    { a: `Your invite lands when Wave ${wave} opens`, b: "10-second first check-in" },
    { a: "Evo turns it into one small step", b: "for that same evening" },
  ];

  return (
    <div className="grid grid-cols-1 gap-y-6 text-center desk:grid-cols-[minmax(0,540px)_minmax(0,1fr)] desk:items-center desk:gap-x-20 desk:gap-y-8 desk:text-left">
      {/* copy */}
      <div className="flex flex-col items-center desk:col-start-1 desk:row-start-1 desk:items-start desk:self-end">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
              transition={spring.gentle}
              role="status"
              className="mb-5 flex max-w-full items-center gap-1.5 overflow-hidden rounded-full bg-white py-1.5 pr-3.5 pl-2.5 text-[11px] font-medium text-ink shadow-[0_10px_24px_rgba(0,0,0,0.3)] desk:fixed desk:top-[84px] desk:left-[max(120px,calc((100vw-1200px)/2))] desk:z-30 desk:mb-0 desk:text-[12px]"
            >
              <Icon name="check" size={15} className="shrink-0" />
              <span className="truncate">Check your inbox — confirm {email}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Eyebrow tone="night">{confirmed ? "Spot locked in" : "Pass reserved · confirm to lock in"}</Eyebrow>
        <h1 ref={headingRef} tabIndex={-1} style={{ outline: "none" }} className="mt-4 text-[clamp(40px,11vw,48px)] leading-[1.04] font-normal tracking-[-0.04em] desk:mt-5 desk:text-[76px] desk:leading-[78px]">
          {confirmed ? "You’re in." : "Almost in."}
          <br />
          <span className="text-[#d4f77a]">
            <Human className="text-[1.15em]">Welcome early.</Human>
          </span>
        </h1>
        <p className="mt-3 max-w-[460px] type-body-l text-white/72 desk:mt-4 desk:text-[18px] desk:leading-[27px]">
          {confirmed
            ? `Your spot is locked in. We’ll email ${email ?? "you"} the moment Wave ${wave} opens.`
            : `Your Evo Pass is reserved. Tap the link we just sent to ${email} to lock in your spot — then we’ll email you when your wave opens.`}
        </p>
      </div>

      {/* pass stage */}
      <div className="desk:col-start-2 desk:row-start-1 desk:row-span-1 desk:self-center">
        <PassStage signup={signup} wave={wave} confirmed={confirmed} reduce={!!reduce} />
      </div>

      {/* details */}
      <div className="flex flex-col gap-6 desk:col-start-1 desk:row-start-2">
        <div className="grid grid-cols-3 gap-2 desk:gap-3">
          <Stat label="Your spot" highlight>
            <CountUp to={signup.spot} reduce={!!reduce} />
          </Stat>
          <Stat label="Wave">
            <CountUp to={wave} reduce={!!reduce} raw />
          </Stat>
          <Stat label="Invite code">
            <span className="text-[15px] desk:text-[20px]">{signup.code}</span>
          </Stat>
        </div>
        <div className="text-left">
          <p className="font-mono text-[11px] tracking-[0.14em] text-lime uppercase">What happens next</p>
          <ol className="mt-3 flex flex-col gap-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-[12px]", i === 0 ? "bg-lime text-ink" : "bg-white/10 text-white")}>
                  {s.done ? <Icon name="check" size={14} /> : i + 1}
                </span>
                <span className="flex flex-col desk:flex-row desk:gap-2">
                  <span className="text-[15px] text-white/88">{s.a}</span>
                  <span className="hidden text-white/45 desk:inline">·</span>
                  <span className="text-[13px] text-white/45 desk:text-[15px]">{s.b}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* queue + share */}
      <div className="desk:col-start-2 desk:row-start-2 desk:self-start">
        <QueueCard signup={signup} level={level} />
      </div>
    </div>
  );
}

function Stat({ label, highlight, children }: { label: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border bg-white/[0.06] px-3 py-3 text-left backdrop-blur-[14px] desk:rounded-[18px] desk:px-4 desk:py-3.5", highlight ? "border-lime/50" : "border-white/12")}>
      <p className="font-mono text-[9px] tracking-[0.12em] text-white/50 uppercase desk:text-[10px]">{label}</p>
      <p className={cn("mt-1 text-[22px] leading-[26px] font-medium tracking-[-0.02em] tabular-nums desk:text-[28px] desk:leading-8", highlight && "text-[#c9ee9f]")}>{children}</p>
    </div>
  );
}

function CountUp({ to, reduce, raw }: { to: number; reduce: boolean; raw?: boolean }) {
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, to, { duration: 0.6, ease: EASE_OUT, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to, reduce]);
  const n = reduce ? to : v;
  return <>{raw ? n : `#${nf.format(n)}`}</>;
}

const TAGS = [
  { label: () => "Spot reserved", dot: "#62bf3b", pos: "left-[-2%] top-[2%]", rot: 6 },
  { label: (w: number) => `Wave ${w} invite`, dot: "#8b6cf0", pos: "right-[-2%] top-[72%]", rot: -5 },
  { label: () => "3 invites → founder", dot: "#f08a5d", pos: "left-[14%] bottom-[-2%]", rot: 4 },
];

function PassStage({ signup, wave, confirmed, reduce }: { signup: Signup; wave: number; confirmed: boolean; reduce: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[400px] py-8 desk:max-w-[560px] desk:py-12">
      <motion.svg
        aria-hidden
        viewBox="-100 -100 200 200"
        initial={reduce ? false : { rotate: -12, opacity: 0 }}
        animate={{ rotate: 0, opacity: 0.35 }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
        className="pointer-events-none absolute top-1/2 left-1/2 w-[150%] -translate-x-1/2 -translate-y-1/2"
      >
        <path d={RAYS} stroke="#c9eeb0" strokeWidth={0.35} fill="none" />
      </motion.svg>
      <div aria-hidden className="absolute inset-x-[4%] top-[20%] h-[60%] rounded-full bg-[#62bf3b]/50 blur-[90px]" />
      <EvoPass number={`#${nf.format(signup.spot)}`} persona="Early member" code={signup.code} badge={confirmed ? `Wave ${wave}` : "Reserved"} className="relative" />
      {TAGS.map((t, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring.default, delay: reduce ? 0 : 0.5 + i * 0.06 }}
          style={{ rotate: -t.rot }}
          className={cn("absolute flex items-center gap-2 rounded-full border border-white bg-white/80 py-2 pr-3.5 pl-3 text-[12px] font-medium whitespace-nowrap text-ink shadow-[0_10px_24px_-6px_rgba(26,64,20,0.2)] backdrop-blur-[10px] desk:text-[13px]", t.pos)}
        >
          <span className="size-2 rounded-full" style={{ background: t.dot }} />
          {t.label(wave)}
        </motion.span>
      ))}
      {[["left-[2%] bottom-[14%]", 16], ["right-[2%] top-[6%]", 14]].map(([p, s], i) => (
        <span key={i} aria-hidden className={cn("absolute", p as string)}>
          <Orb size={s as number} state="idle" />
        </span>
      ))}
    </div>
  );
}

function QueueCard({ signup, level }: { signup: Signup; level: number }) {
  const [copied, setCopied] = useState(false);
  const link = signup.share_url.replace(/^https?:\/\//, "");

  const share = async () => {
    const text = "I’m on the Evo early-access list — it helps you get unstuck, one small step at a time.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Evo by Lumid", text, url: signup.share_url });
        track("share_clicked", { method: "native" });
        return;
      }
      await navigator.clipboard.writeText(signup.share_url);
      track("share_clicked", { method: "copy" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* share sheet dismissed, or clipboard blocked — nothing to recover */
    }
  };

  return (
    <section className="rounded-3xl border border-white/14 bg-[#0b0d0a]/55 p-[18px] text-left backdrop-blur-[18px] desk:rounded-[26px] desk:p-[22px]" aria-labelledby="ea-queue">
      <div className="flex items-baseline justify-between">
        <h2 id="ea-queue" className="text-[17px] font-medium desk:text-[18px]">
          Skip the queue
        </h2>
        <span className="font-mono text-[10px] tracking-[0.08em] text-white/50 desk:text-[11px]">{Math.min(signup.invites, 3)} / 3 FRIENDS</span>
      </div>
      <p className="mt-2 text-[13px] leading-[19px] text-white/60">Each friend who joins with your link moves you up a wave. Three makes you a founding member.</p>
      <ol className="mt-4 grid grid-cols-3 gap-2">
        {WAVES.map((w, i) => (
          <li key={w.label} className="flex flex-col gap-1.5">
            <span className="h-1.5 rounded-full bg-white/12">
              <motion.span className="block h-full rounded-full bg-lime shadow-[0_0_12px_rgba(136,217,95,0.8)]" initial={false} animate={{ width: i <= level ? "100%" : "0%" }} transition={spring.gentle} />
            </span>
            <span className={cn("text-[12px] font-medium", i <= level ? "text-white" : "text-white/45")}>{w.label}</span>
            <span className="text-[11px] text-white/40">{w.note}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-col gap-2.5 desk:flex-row desk:items-center">
        <p className="flex h-[52px] min-w-0 flex-1 items-center rounded-full border border-white/12 bg-black/35 px-4 font-mono text-[12px] text-white/70">
          <span className="truncate">{link}</span>
        </p>
        <motion.button
          type="button"
          onClick={share}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
          className="flex h-[52px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full px-6 type-label-m text-forest"
          style={{ background: "linear-gradient(180deg,#d4f77a 0%,#a3e27d 45%,#7ccf52 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 28px rgba(136,217,95,0.4)" }}
        >
          {copied ? "Link copied" : "Share my pass"}
          <Icon name={copied ? "check" : "arrow-right"} size={16} />
        </motion.button>
      </div>
    </section>
  );
}
