"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Human } from "@/components/launch/poster";
import { excuses, type ExcuseId, type Signup } from "@/lib/early-access/content";
import { track } from "@/lib/early-access/client";
import { cn } from "@/lib/cn";
import { EASE_OUT, spring } from "@/lib/motion";
import { Magnetic } from "./magnetic";

const nf = new Intl.NumberFormat("en-IN");

type Props = { signup: Signup; email?: string; confirmed: boolean; excuseId: ExcuseId | null };

/** Words rise out of a mask, staggered — the headline “settles” in. */
function Words({ lines, delay = 0, reduce }: { lines: { w: string; accent?: boolean }[][]; delay?: number; reduce: boolean }) {
  let i = 0;
  return (
    <>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.map(({ w, accent }) => {
            const k = i++;
            return (
              <span key={k} className="inline-block overflow-hidden pb-[0.12em] align-top">
                <motion.span
                  className={cn("inline-block", accent && "text-lime-deep")}
                  initial={reduce ? { opacity: 0 } : { y: "105%", opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: delay + k * 0.07 }}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

function CountUp({ to, reduce }: { to: number; reduce: boolean }) {
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, to, { duration: 0.9, ease: EASE_OUT, delay: 0.3, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to, reduce]);
  return <>{nf.format(reduce ? to : v)}</>;
}

/** A one-off burst of lime sparks from the orb. Decorative; skipped for reduced motion. */
const SPARKS = Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2 + 0.3, d: 70 + (i % 3) * 26, s: 5 + (i % 3) * 2 }));
function Sparks() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {SPARKS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-lime shadow-[0_0_10px_rgba(136,217,95,0.9)]"
          style={{ width: p.s, height: p.s }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
          transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.25 + i * 0.03 }}
        />
      ))}
    </div>
  );
}

/** Step C. Pending: “That was your first small step.” + confirm hint. Confirmed (email link): “You’re in, for real.” */
export function SuccessView({ signup, email, confirmed, excuseId }: Props) {
  const reduce = !!useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const choice = excuses.find((e) => e.id === excuseId) ?? null;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

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
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* share sheet dismissed, or clipboard blocked — nothing to recover */
    }
  };

  const lines = confirmed
    ? [[{ w: "You’re" }, { w: "in," }], [{ w: "for", accent: true }, { w: "real.", accent: true }]]
    : [[{ w: "That" }, { w: "was" }, { w: "your" }, { w: "first" }], [{ w: "small", accent: true }, { w: "step.", accent: true }]];

  return (
    <div className="grid grid-cols-1 gap-y-10 text-center desk:grid-cols-[minmax(0,540px)_minmax(0,1fr)] desk:items-center desk:gap-x-24 desk:text-left">
      <div className="flex flex-col items-center desk:items-start">
        <div className="relative">
          <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={reduce ? { duration: 0.2 } : { ...spring.gentle, delay: 0.1 }}>
            <Orb size={132} state="breathing" className="desk:!size-[112px]" />
          </motion.div>
          {!reduce && <Sparks />}
        </div>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.3 }} className="mt-7 font-mono text-[11px] tracking-[0.16em] text-lime-deep uppercase">
          {confirmed ? "Confirmed" : "You’re in"} · spot #<CountUp to={signup.spot} reduce={reduce} />
        </motion.p>

        <h1 ref={headingRef} tabIndex={-1} style={{ outline: "none" }} className="mt-3 text-[clamp(34px,9.4vw,44px)] leading-[1.08] font-normal tracking-[-0.035em] text-forest desk:text-[64px] desk:leading-[66px]">
          <Words lines={lines} delay={0.35} reduce={reduce} />
        </h1>

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.9 }} className="mt-4 max-w-[460px] type-body-l text-t2 desk:text-[18px] desk:leading-[27px]">
          {confirmed ? `Your spot is locked in. We’ll email ${email ?? "you"} the moment your invite opens.` : `We’ll email ${email} when your invite opens. ${choice ? "Evo remembers the line you picked, so day one starts where you are." : "On day one Evo asks what you’re avoiding — then turns it into one small step."}`}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: 1.05 }} className="mt-7 flex flex-col items-center desk:items-start">
          <Magnetic>
            <motion.button
              type="button"
              onClick={share}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
              className="group relative flex h-[58px] max-w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 type-label-m text-white"
              style={{ background: "var(--gradient-forest)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 24px rgba(20,26,18,0.28)" }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-[transform,opacity] duration-700 group-hover:translate-x-[320%] group-hover:opacity-100" />
              <span className="relative truncate">{copied ? "Link copied" : "Send to a friend who says “tomorrow”"}</span>
              <Icon name={copied ? "check" : "arrow-right"} size={18} className="relative shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </Magnetic>
          <div className="mt-4 flex flex-col items-center gap-3 desk:flex-row desk:gap-4">
            <p className="font-mono text-[11px] tracking-[0.08em] text-t3">Invite code · {signup.code}</p>
            <p className="flex items-center gap-1.5 rounded-full border border-line-strong bg-white/85 py-1.5 pr-3.5 pl-2.5 text-[12px] font-medium text-forest">
              <Icon name="check" size={14} className="text-lime-deep" />
              {confirmed ? "Spot confirmed" : "Check your inbox to confirm your spot"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* desktop: what you said → what you'll do */}
      <div className="hidden desk:block">
        <p className="mb-3 font-mono text-[11px] tracking-[0.14em] text-t3 uppercase">{choice ? "What you said" : "What happens on day one"}</p>
        {choice && (
          <>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.5 }} className="relative inline-flex max-w-full items-center gap-2.5 rounded-[20px] border border-white bg-white/85 py-4 pr-6 pl-[18px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]">
              <Icon name="chat" size={20} className="shrink-0 text-t3" />
              <span className="relative text-[18px] text-t3">
                “{choice.line}”
                <motion.span aria-hidden className="absolute top-1/2 left-0 h-[1.5px] w-full origin-left bg-t3" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.1 }} />
              </span>
            </motion.div>
            <div className="flex items-center gap-3 py-3.5 pl-[30px]">
              <motion.span aria-hidden className="h-12 w-0 origin-top border-l-2 border-dashed border-lime-deep/50" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.5 }} />
              <motion.span initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring.gentle, delay: 1.8 }}>
                <Orb size={26} state="idle" />
              </motion.span>
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.9 }} className="text-[20px] text-lime-deep">
                <Human>Evo turned it into one small step</Human>
              </motion.span>
            </div>
          </>
        )}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduce ? { duration: 0.2 } : { ...spring.gentle, delay: choice ? 2.1 : 0.6 }}
          className="rounded-[28px] p-7 text-white shadow-[0_24px_48px_rgba(20,26,18,0.3)]"
          style={{ background: "linear-gradient(160deg,#33412e 0%,#151a13 72%)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] tracking-[0.14em] text-[#a3e27d] uppercase">{choice ? "What you’ll do on day one" : "First check-in · 10 seconds"}</p>
            <p className="flex items-center gap-1.5 rounded-full bg-lime/16 py-1.5 pr-3 pl-2 text-[11px] text-[#c9eeb0]">
              <Icon name="check" size={13} />
              {choice ? "Saved with your spot" : "Tap-only"}
            </p>
          </div>
          <p className="mt-4 text-[30px] leading-[37px] font-medium tracking-[-0.02em]">
            {choice ? (
              <>
                <span className="text-[#a3e27d]">{choice.step.slice(0, choice.step.indexOf(".") + 1)}</span>
                {choice.step.slice(choice.step.indexOf(".") + 1)}
              </>
            ) : (
              <>
                <span className="text-[#a3e27d]">Tell Evo what you’re avoiding.</span> It turns it into one small step for that same evening.
              </>
            )}
          </p>
          <p className="mt-3 text-[14px] text-white/55">Evo will check in after — no streaks, no guilt.</p>
        </motion.div>
      </div>
    </div>
  );
}
