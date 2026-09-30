"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingHeader } from "@/components/onboarding/header";
import { glows } from "@/components/ui/backdrop";
import { Icon, type IconName } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

type Preset = "morning" | "evening" | "custom";

const presets: { key: Preset; label: string; icon: IconName; time: string }[] = [
  { key: "morning", label: "Morning", icon: "sun", time: "8:30 AM" },
  { key: "evening", label: "Evening", icon: "moon", time: "8:00 PM" },
  { key: "custom", label: "Pick a time", icon: "clock", time: "Custom" },
];

const days = [
  ["Mon", "M"],
  ["Tue", "T"],
  ["Wed", "W"],
  ["Thu", "T"],
  ["Fri", "F"],
  ["Sat", "S"],
  ["Sun", "S"],
] as const;

export default function Reminders() {
  const router = useRouter();
  const app = useApp();
  const [preset, setPreset] = useState<Preset>(app.reminder.preset);
  const [time, setTime] = useState(app.reminder.time);
  const [picked, setPicked] = useState<string[]>(app.reminder.days);

  const save = () => {
    app.update({ reminder: { preset, time, days: picked }, onboarded: true });
  };

  const allow = async () => {
    save();
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
  };

  return (
    <Screen glows={glows.onboarding}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <OnboardingHeader step={3} />
        <h1 className="mt-3.5 px-7 type-screen-title text-forest">
          When should Evo
          <br />
          check in with you?
        </h1>

        <div className="mt-6 flex flex-col gap-2 px-6">
          {presets.map((p) => {
            const on = preset === p.key;
            const shown = p.key === "custom" && on ? time : p.time;
            return (
              <motion.button
                key={p.key}
                type="button"
                whileTap={{ scale: 0.98 }}
                transition={spring.snappy}
                onClick={() => {
                  haptic("selection");
                  setPreset(p.key);
                  if (p.key !== "custom") setTime(p.time);
                }}
                aria-pressed={on}
                className={cn(
                  "relative flex w-full cursor-pointer items-center gap-3 rounded-[20px] py-2.5 pr-4 pl-2.5 text-left transition-[background-color,border-color] duration-[160ms]",
                  on
                    ? "border-[1.5px] border-lime bg-lime-soft"
                    : "border border-white bg-white/78 backdrop-blur-[12px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-[14px] transition-colors duration-[160ms]",
                    on ? "bg-white text-lime-deep" : "bg-subtle text-t2",
                  )}
                >
                  <Icon name={p.icon} size={19} />
                </span>
                <span className="flex-1 type-label-m text-ink">{p.label}</span>
                {p.key === "custom" && on ? (
                  <input
                    type="time"
                    aria-label="Custom time"
                    className="bg-transparent text-right text-[18px] leading-[1.06] font-medium tracking-[-0.54px] text-forest outline-none"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      if (Number.isNaN(h)) return;
                      setTime(`${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`);
                    }}
                  />
                ) : (
                  <span
                    className={cn(
                      "text-[18px] leading-[1.06] font-medium tracking-[-0.54px] whitespace-nowrap",
                      on ? "text-forest" : "text-t3",
                    )}
                  >
                    {shown}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <p className="mt-[25px] px-7 type-label-s text-t2">On these days</p>
        <div className="mt-2 flex gap-1.5 px-6">
          {days.map(([key, short]) => {
            const on = picked.includes(key);
            return (
              <motion.button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={on}
                whileTap={{ scale: 0.9 }}
                transition={spring.snappy}
                onClick={() => {
                  haptic("selection");
                  setPicked((d) => (d.includes(key) ? d.filter((x) => x !== key) : [...d, key]));
                }}
                className={cn(
                  "flex size-11 cursor-pointer items-center justify-center rounded-[22px] type-label-m transition-colors duration-[160ms]",
                  on
                    ? "text-white"
                    : "border border-white bg-white/78 text-t2 backdrop-blur-[12px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]",
                )}
                style={on ? { background: "linear-gradient(135deg, #33412e 0%, #151a13 71.43%)" } : undefined}
              >
                {short}
              </motion.button>
            );
          })}
        </div>

        <p className="mt-6 px-7 type-label-s text-t2">Preview</p>
        <div className="mx-6 mt-2 flex items-start gap-3 rounded-[22px] border border-white bg-white/92 px-3.5 py-3 backdrop-blur-[12px] shadow-[0_10px_13px_rgba(26,64,20,0.07)]">
          <Orb size={40} state="still" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-start justify-between">
              <span className="type-label-m text-ink">Evo</span>
              <span className="type-caption text-t3">now</span>
            </div>
            <p className="type-body-s text-t2">
              Hey {app.name} — how are you arriving {preset === "morning" ? "this morning" : "tonight"}? Tap to check in (10
              sec).
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-[18px] px-6 pt-8 pb-[22px]">
          <Pill label="Allow notifications" className="w-full" confirm href="/first-day" onClick={allow} />
          <button
            type="button"
            className="cursor-pointer type-label-m text-t2"
            onClick={() => {
              save();
              router.push("/first-day");
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </Screen>
  );
}
