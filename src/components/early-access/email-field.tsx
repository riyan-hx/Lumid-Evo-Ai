"use client";

import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useRef, type Ref } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { CONSENT, fieldCopy, isEmail } from "@/lib/early-access/content";
import { cn } from "@/lib/cn";
import { EASE_OUT, spring } from "@/lib/motion";
import { Magnetic } from "./magnetic";

export type FieldStatus = "idle" | "loading" | "invalid" | "offline" | "rate" | "already";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  status: FieldStatus;
  inputRef?: Ref<HTMLInputElement>;
  /** Short text of the step Evo will save (set when the sheet/popover CTA was used). */
  attached?: string | null;
  /** Bump to play a one-off “look here” pulse (after the CTA hands off to the field). */
  pulse?: number;
  className?: string;
};

const errors: Partial<Record<FieldStatus, { text: string; color: string }>> = {
  invalid: { text: fieldCopy.invalid, color: "#b42318" },
  rate: { text: fieldCopy.rate, color: "#b42318" },
  offline: { text: fieldCopy.offline, color: "#9a6a0b" },
};

/** Email + CTA (light). Validates on submit; shakes on error, blooms on focus, pulses when ready. */
export function EmailField({ value, onChange, onSubmit, status, inputRef, attached, pulse = 0, className }: Props) {
  const reduce = useReducedMotion();
  const shell = useAnimationControls();
  const err = errors[status];
  const loading = status === "loading";
  const ready = status === "idle" && isEmail(value.trim());
  const first = useRef(true);

  useEffect(() => {
    if (err && !reduce) void shell.start({ x: [0, -9, 8, -5, 3, 0], transition: { duration: 0.42, ease: EASE_OUT } });
  }, [err, status, reduce, shell]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pulse && !reduce) void shell.start({ scale: [1, 1.025, 1], transition: { duration: 0.6, ease: EASE_OUT } });
  }, [pulse, reduce, shell]);

  return (
    <form
      id="ea-email-field"
      noValidate
      className={cn("w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) onSubmit();
      }}
    >
      <AnimatePresence initial={false}>
        {attached && (
          <motion.div
            key="attached"
            initial={{ opacity: 0, height: 0, y: 6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="flex justify-center overflow-hidden desk:justify-start"
          >
            <p className="mb-3 flex max-w-full items-center gap-2 rounded-full bg-forest py-1.5 pr-3.5 pl-1.5 text-[12px] text-white">
              <Orb size={22} state="still" />
              <span className="truncate">
                Evo will save: <span className="text-[#a3e27d]">{attached}</span>
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={shell}
        className={cn(
          "flex h-[60px] items-center gap-2 rounded-full border bg-white p-1.5 pl-5 transition-[border-color,box-shadow] duration-200",
          err
            ? "border-[var(--err)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--err)_16%,transparent)]"
            : "border-line-strong shadow-[0_10px_24px_-12px_rgba(26,64,20,0.18)] focus-within:border-lime focus-within:shadow-[0_0_0_4px_rgba(135,217,94,0.28),0_18px_40px_-14px_rgba(98,191,59,0.45)]",
        )}
        style={err ? ({ "--err": err.color } as React.CSSProperties) : undefined}
      >
        <label htmlFor="ea-email" className="sr-only">
          Email
        </label>
        <input
          ref={inputRef}
          id="ea-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="you@email.com"
          aria-invalid={status === "invalid"}
          aria-describedby="ea-email-msg"
          className="min-w-0 flex-1 bg-transparent type-body-l text-ink outline-none placeholder:text-t-disabled"
        />
        <Magnetic strength={0.18}>
          <motion.button
            type="submit"
            aria-disabled={loading}
            whileTap={loading ? undefined : { scale: 0.96 }}
            transition={spring.snappy}
            className="group relative flex h-12 shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-full px-4 type-label-m whitespace-nowrap text-forest aria-disabled:cursor-default min-[400px]:px-5"
            style={{ background: "linear-gradient(180deg,#a3e27d 0%,#62bf3b 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 22px rgba(98,191,59,0.4)" }}
          >
            {/* sheen sweep on hover; gentle breathing ring when the email is valid */}
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[320%] group-hover:opacity-100" />
            {ready && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/70 motion-safe:animate-pulse" />}
            <AnimatePresence mode="popLayout" initial={false}>
              {loading ? (
                <motion.span key="l" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.18 }} className="relative flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                  Saving…
                </motion.span>
              ) : (
                <motion.span key="i" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.18 }} className="relative flex items-center gap-2">
                  Join early access
                  <Icon name="arrow-right" size={16} className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </Magnetic>
      </motion.div>

      <div id="ea-email-msg" className="mt-2.5 px-2 text-center type-caption desk:text-left" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {err ? (
            <motion.p key={status} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: err.color }}>
              {err.text}
            </motion.p>
          ) : status === "already" ? (
            <motion.p key="already" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-2xl border border-lime bg-lime-soft px-4 py-3 text-left text-[13px] leading-[18px] text-forest">
              <Icon name="check" size={18} className="shrink-0 text-lime-deep" />
              <span>{fieldCopy.already(value.trim().toLowerCase())}</span>
            </motion.p>
          ) : (
            <motion.p key="consent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-t3">
              {CONSENT}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
