"use client";

import { motion, useAnimationControls } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

const LENGTH = 6;
const RESEND_AFTER = 30;

export default function Verify() {
  const router = useRouter();
  const { phone } = useApp();
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(RESEND_AFTER);
  const [error, setError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls();

  useEffect(() => {
    input.current?.focus();
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const submit = (value: string) => {
    // Mock verification: any 6 digits except 000000 pass.
    if (value === "000000") {
      setError(true);
      haptic("warning");
      shake.start({ x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.3 } });
      return;
    }
    haptic("success");
    setTimeout(() => router.push("/goals"), 250);
  };

  const onChange = (v: string) => {
    const next = v.replace(/\D/g, "").slice(0, LENGTH);
    setError(false);
    setCode(next);
    if (next.length === LENGTH) submit(next);
  };

  return (
    <Screen glows={glows.onboarding}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <div className="px-5">
          <BackButton />
        </div>
        <h1 className="mt-[30px] px-7 type-screen-title text-forest">Enter the 6-digit code</h1>
        <p className="mt-3 px-7 type-body-m text-t2">
          Sent to +91 {phone} ·{" "}
          <Link href="/sign-in" className="text-t2 underline-offset-2 hover:underline">
            Change
          </Link>
        </p>

        <motion.label animate={shake} className="relative mt-[30px] flex gap-[9px] px-6" htmlFor="otp">
          {Array.from({ length: LENGTH }, (_, i) => {
            const char = code[i];
            const active = i === code.length && code.length < LENGTH;
            return (
              <motion.div
                key={i}
                className={cn(
                  "flex h-[62px] flex-1 items-center justify-center rounded-2xl bg-white transition-[border-color] duration-[160ms]",
                  error ? "border-[1.5px] border-t-danger" : active ? "border-2 border-lime" : "border border-line-strong",
                )}
                animate={char ? { scale: [0.94, 1] } : { scale: 1 }}
                transition={spring.snappy}
              >
                {char ? (
                  <span className="text-[26px] leading-[1.06] font-medium tracking-[-0.78px] text-ink">{char}</span>
                ) : (
                  active && (
                    <motion.span
                      className="h-[26px] w-0.5 bg-lime-deep"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
                    />
                  )
                )}
              </motion.div>
            );
          })}
          <input
            ref={input}
            id="otp"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="6-digit code"
            className="absolute inset-0 opacity-0"
          />
        </motion.label>

        <p className={cn("mt-7 px-7 type-label-m", error ? "text-t-danger" : "text-t3")}>
          {error ? (
            "That code didn’t match. Try again."
          ) : seconds > 0 ? (
            `Resend code in 0:${String(seconds).padStart(2, "0")}`
          ) : (
            <button type="button" className="cursor-pointer text-lime-deep" onClick={() => setSeconds(RESEND_AFTER)}>
              Resend code
            </button>
          )}
        </p>

        <div className="mt-auto px-6 pt-10 pb-[30px]">
          <Pill
            label="Verify"
            className="w-full"
            disabled={code.length < LENGTH}
            onClick={() => submit(code)}
          />
        </div>
      </div>
    </Screen>
  );
}
