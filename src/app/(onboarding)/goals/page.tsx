"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/header";
import { glows } from "@/components/ui/backdrop";
import { Icon, type IconName } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { haptic, riseIn, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

const goals: { id: string; label: string; icon: IconName; tile: string; color: string }[] = [
  { id: "avoid", label: "Starting things I avoid", icon: "book", tile: "bg-sky-soft", color: "text-sky-text" },
  { id: "overwhelmed", label: "Feeling overwhelmed", icon: "cloud", tile: "bg-peach-soft", color: "text-peach-text" },
  { id: "energy", label: "Low energy & motivation", icon: "sun", tile: "bg-sun-soft", color: "text-sun-text" },
  { id: "overthinking", label: "Overthinking", icon: "brain", tile: "bg-lavender-soft", color: "text-lavender-text" },
  { id: "sleep", label: "Sleep & late nights", icon: "moon", tile: "bg-mint-soft", color: "text-mint-text" },
  { id: "therapy", label: "Support between therapy sessions", icon: "user", tile: "bg-lime-soft", color: "text-lime-deep" },
];

export default function Goals() {
  const app = useApp();
  const [name, setName] = useState(app.name);
  const [picked, setPicked] = useState<string[]>(app.goals);
  const ready = name.trim().length > 0 && picked.length > 0;

  const toggle = (id: string) => {
    haptic("selection");
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  return (
    <Screen glows={glows.onboarding}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <OnboardingHeader step={1} back={false} />
        <h1 className="mt-[10px] px-7 text-[32px] leading-[1.06] font-medium tracking-[-0.96px] text-forest">
          Hi, I’m Evo.
          <br />
          What would you
          <br />
          like help with?
        </h1>

        <label htmlFor="name" className="mt-[18px] px-7 type-label-s text-t2">
          What should I call you?
        </label>
        <input
          id="name"
          value={name}
          maxLength={24}
          autoComplete="given-name"
          onChange={(e) => setName(e.target.value)}
          className="mx-6 mt-2 h-14 rounded-[18px] border border-line-strong bg-white px-4 type-body-l text-ink outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[1.5px] focus:border-lime focus:shadow-[0_0_0_4px_rgba(135,217,94,0.3)]"
        />

        <p className="mt-[18px] px-7 type-label-s text-t2">Pick any — you can change this later.</p>
        <div className="mt-2.5 grid grid-cols-2 gap-[9px] px-6">
          {goals.map((g, i) => {
            const on = picked.includes(g.id);
            return (
              <motion.button
                key={g.id}
                type="button"
                variants={riseIn}
                initial="hidden"
                animate="show"
                custom={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggle(g.id)}
                aria-pressed={on}
                className={cn(
                  "flex h-[100px] cursor-pointer flex-col items-start gap-2.5 rounded-[20px] p-3.5 text-left transition-[background-color,border-color] duration-[160ms] ease-(--ease-out-evo)",
                  on
                    ? "border-[1.5px] border-lime bg-lime-soft"
                    : "border border-white bg-white/78 backdrop-blur-[12px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      "flex size-[34px] items-center justify-center rounded-xl transition-colors duration-[160ms]",
                      on ? "bg-white" : g.tile,
                      g.color,
                    )}
                  >
                    <Icon name={g.icon} size={17} />
                  </div>
                  <AnimatePresence>
                    {on && (
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={spring.snappy}
                        className="flex size-[22px] items-center justify-center rounded-[11px] bg-forest text-white"
                      >
                        <Icon name="check" size={13} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="type-label-m text-ink">{g.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-auto px-6 pt-8 pb-[30px]">
          <Pill
            label="Continue"
            className="w-full"
            disabled={!ready}
            confirm
            href="/privacy"
            onClick={() => app.update({ name: name.trim(), goals: picked })}
          />
        </div>
      </div>
    </Screen>
  );
}
