"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { ease, haptic, spring } from "@/lib/motion";
import { Icon } from "@/components/ui/icons";
import type { Tone } from "./poster";

export type Signup = {
  email: string;
  spot: number;
  code: string;
  /** Variant-specific extras (chosen excuse, persona, note…). */
  meta?: Record<string, string>;
};

const KEY = "evo-early-access";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Base the queue number on a fixed launch count so it reads as real and grows over time. */
const BASE = 1200;
const LAUNCH = Date.UTC(2026, 10, 20);

export function waitlistCount() {
  return BASE + Math.max(0, Math.floor((Date.now() - LAUNCH) / 3_600_000) * 3);
}

function read(key: string): Signup | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Signup) : null;
  } catch {
    return null;
  }
}

/**
 * Early-access sign-up. No backend yet: the entry is kept on-device so the page can show the spot
 * and invite code. Swap `submit` for an API call when the waitlist endpoint exists.
 */
/** `variant` keeps each design's demo state separate. */
export function useWaitlist(variant: string) {
  const key = `${KEY}:${variant}`;
  const [signup, setSignup] = useState<Signup | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the saved sign-up after mount
    setSignup(read(key));
  }, [key]);

  const submit = useCallback(async (email: string, meta?: Record<string, string>) => {
    await new Promise((r) => setTimeout(r, 700));
    const entry: Signup = {
      email: email.trim().toLowerCase(),
      spot: waitlistCount() + 1,
      code: `EVO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      meta,
    };
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch {}
    haptic("success");
    setSignup(entry);
    return entry;
  }, [key]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setSignup(null);
  }, [key]);

  return { signup, submit, reset };
}

/** Email + CTA in one pill, as on the Join slide. */
export function EmailField({
  tone,
  cta = "Join early access",
  onSubmit,
  disabled,
  className,
  autoFocus,
}: {
  tone: Tone;
  cta?: string;
  onSubmit: (email: string) => Promise<unknown>;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const night = tone === "night";

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || disabled) return;
    if (!EMAIL.test(email.trim())) {
      setError(true);
      haptic("warning");
      return;
    }
    setBusy(true);
    await onSubmit(email);
    setBusy(false);
  };

  return (
    <form onSubmit={send} noValidate className={cn("w-full", className)}>
      <div
        className={cn(
          "flex h-[60px] items-center gap-2 rounded-full p-1.5 pl-5 transition-[border-color,box-shadow] duration-[160ms]",
          night ? "border border-white/18 bg-white/8 backdrop-blur-[12px] focus-within:border-lime/70" : "border border-line-strong bg-white focus-within:border-lime",
          "focus-within:shadow-[0_0_0_4px_rgba(135,217,94,0.25)]",
          error && "border-t-danger focus-within:border-t-danger",
          disabled && "opacity-50",
        )}
      >
        <label htmlFor="ea-email" className="sr-only">
          Email
        </label>
        <input
          id="ea-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus={autoFocus}
          disabled={disabled}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(false);
          }}
          placeholder="you@email.com"
          className={cn("min-w-0 flex-1 bg-transparent type-body-l outline-none", night ? "text-white placeholder:text-white/35" : "text-ink placeholder:text-t-disabled")}
        />
        <motion.button
          type="submit"
          disabled={disabled || busy}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
          className="relative flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full px-5 type-label-m whitespace-nowrap text-forest disabled:cursor-default"
          style={{
            background: "linear-gradient(180deg,#d4f77a 0%,#a3e27d 45%,#7ccf52 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 28px rgba(136,217,95,0.45)",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {busy ? (
              <motion.span key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-forest/30 border-t-forest" />
                Saving
              </motion.span>
            ) : (
              <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={ease.outFast} className="flex items-center gap-2">
                {cta}
                <Icon name="arrow-right" size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 pl-5 type-caption text-[#ff8f7a]" role="alert">
            That email doesn’t look right.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

export function shareLink(code: string) {
  return `https://evo.lumidai.in/?ref=${code}`;
}

export async function shareInvite(code: string) {
  const url = shareLink(code);
  const text = "I’m on the Evo early-access list — it helps you get unstuck, one small step at a time.";
  try {
    if (navigator.share) {
      await navigator.share({ title: "Evo by Lumid", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "cancelled";
  }
}
