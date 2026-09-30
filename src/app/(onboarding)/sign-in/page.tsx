"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { ease, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

const format = (d: string) => (d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d);

export default function SignIn() {
  const router = useRouter();
  const { phone, update } = useApp();
  const [digits, setDigits] = useState(phone.replace(/\D/g, ""));
  const [focused, setFocused] = useState(true);
  const [touched, setTouched] = useState(false);
  const valid = digits.length === 10;

  return (
    <Screen glows={glows.onboarding}>
      <div className="flex flex-1 flex-col px-6 pt-[86px]">
        <Orb size={120} className="-ml-1.5" state="breathing" />
        <h1 className="mt-5 px-1 text-[34px] leading-[1.06] font-medium tracking-[-1.02px] text-forest">Welcome to Evo.</h1>
        <p className="mt-3 max-w-[320px] px-1 type-body-l text-t2">Sign in to keep your check-ins, plans and wins safe.</p>

        <label htmlFor="phone" className="mt-7 px-1 type-label-s text-t2">
          Phone number
        </label>
        <div
          className={cn(
            "mt-2 flex h-14 items-center gap-2.5 rounded-[18px] bg-white px-4 transition-[border-color,box-shadow] duration-[160ms] ease-(--ease-out-evo)",
            focused
              ? "border-[1.5px] border-lime shadow-[0_0_0_4px_rgba(135,217,94,0.3)]"
              : "border border-line-strong",
            touched && !valid && !focused && "border-[1.5px] border-t-danger shadow-none",
          )}
        >
          {/* India only for now — shown as a fixed prefix rather than a picker with one option. */}
          <span className="flex items-center gap-1 border-r border-line pr-3 type-label-m text-ink" aria-label="Country code India +91">
            <span aria-hidden>🇮🇳</span>
            +91
          </span>
          <input
            id="phone"
            inputMode="numeric"
            autoComplete="tel-national"
            value={format(digits)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setTouched(true);
            }}
            onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="98765 43210"
            className="min-w-0 flex-1 bg-transparent type-body-l text-ink outline-none placeholder:text-t-disabled"
          />
        </div>
        <AnimatePresence>
          {touched && !valid && !focused && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={ease.outFast}
              className="mt-2 px-1 type-caption text-t-danger"
            >
              Enter a 10-digit mobile number.
            </motion.p>
          )}
        </AnimatePresence>

        <Pill
          label="Send code"
          className="mt-6 w-full"
          disabled={!valid}
          confirm
          href="/verify"
          onClick={() => update({ phone: format(digits) })}
        />

        <div className="mt-3.5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line-strong" />
          <span className="type-caption text-t3">or</span>
          <span className="h-px flex-1 bg-line-strong" />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
          onClick={() => router.push("/goals")}
          className="mt-3.5 flex h-[58px] w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-white bg-white/90 backdrop-blur-[12px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]"
        >
          <span
            className="bg-clip-text text-[20px] font-medium text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #4285f5 0%, #33a854 40%, #fabd05 70%, #eb4236 100%)" }}
          >
            G
          </span>
          <span className="type-label-m text-ink">Continue with Google</span>
        </motion.button>

        <div className="mt-auto flex items-start gap-1.5 pt-10 pb-[42px]">
          <Icon name="lock" size={13} className="mt-px shrink-0 text-t3" />
          <p className="max-w-[300px] type-caption text-t3">
            We never share your number. By continuing you agree to the Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </Screen>
  );
}
