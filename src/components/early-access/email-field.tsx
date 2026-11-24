"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Ref } from "react";
import { Icon } from "@/components/ui/icons";
import { CONSENT, fieldCopy } from "@/lib/early-access/content";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export type FieldStatus = "idle" | "loading" | "invalid" | "offline" | "rate" | "already";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  status: FieldStatus;
  inputRef?: Ref<HTMLInputElement>;
  align?: "center" | "left";
  className?: string;
};

const errors: Partial<Record<FieldStatus, { text: string; color: string }>> = {
  invalid: { text: fieldCopy.invalid, color: "#ff8f7a" },
  rate: { text: fieldCopy.rate, color: "#ff8f7a" },
  offline: { text: fieldCopy.offline, color: "#ffcf8a" },
};

/** Email + CTA pill (handoff §3: Default / Focused / Error / Loading). Validation happens on submit. */
export function EmailField({ value, onChange, onSubmit, status, inputRef, align = "center", className }: Props) {
  const err = errors[status];
  const loading = status === "loading";
  const text = align === "center" ? "text-center desk:text-left" : "text-left";

  return (
    <form
      noValidate
      className={cn("w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) onSubmit();
      }}
    >
      <div
        className={cn(
          "flex h-[60px] items-center gap-2 rounded-full border bg-white/[0.08] p-1.5 pl-5 backdrop-blur-[12px] transition-[border-color,box-shadow] duration-[160ms]",
          err ? "border-[var(--err)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--err)_22%,transparent)]" : "border-white/18 focus-within:border-lime focus-within:shadow-[0_0_0_4px_rgba(135,217,94,0.25)]",
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
          className="min-w-0 flex-1 bg-transparent type-body-l text-white outline-none placeholder:text-white/40"
        />
        <motion.button
          type="submit"
          aria-disabled={loading}
          whileTap={loading ? undefined : { scale: 0.97 }}
          transition={spring.snappy}
          className="flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 type-label-m whitespace-nowrap text-forest aria-disabled:cursor-default aria-disabled:opacity-75 min-[400px]:px-5"
          style={{ background: "linear-gradient(180deg,#d4f77a 0%,#a3e27d 45%,#7ccf52 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 28px rgba(136,217,95,0.45)" }}
        >
          {loading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
              Saving…
            </>
          ) : (
            <>
              Join early access
              <Icon name="arrow-right" size={16} />
            </>
          )}
        </motion.button>
      </div>

      <div id="ea-email-msg" className={cn("mt-2.5 px-2 type-caption", text)} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {err ? (
            <motion.p key={status} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: err.color }}>
              {err.text}
            </motion.p>
          ) : status === "already" ? (
            <motion.p key="already" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 rounded-2xl border border-lime/50 bg-lime/12 px-4 py-3 text-left text-[13px] leading-[18px] text-white/90 desk:justify-start">
              <Icon name="check" size={18} className="shrink-0 text-lime" />
              <span>{fieldCopy.already(value.trim().toLowerCase())}</span>
            </motion.p>
          ) : (
            <motion.p key="consent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white/50">
              {CONSENT}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
