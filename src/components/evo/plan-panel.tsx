"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { plan } from "@/lib/mock";
import { riseIn, spring } from "@/lib/motion";

const dots = [
  "bg-lime text-forest",
  "bg-lavender-soft text-lavender-text",
  "bg-sky-soft text-sky-text",
  "bg-peach-soft text-peach-text",
];

const week = [
  { label: "Steps started", value: "3/5", pct: 60, from: "#c9eeb0", to: "#62bf3b" },
  { label: "Calm minutes", value: "42 min", pct: 70, from: "#c6f3e1", to: "#2fbf7a" },
  { label: "Check-ins", value: "4/7", pct: 57, from: "#ffe7b3", to: "#f2b233" },
];

/** Desktop chat workspace right panel: current plan, this week, forecast teaser. */
export function PlanPanel({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <aside
      aria-label="Your plan"
      className={cn(
        "no-scrollbar sticky top-4 h-[calc(100dvh-32px)] w-[388px] shrink-0 flex-col gap-4 overflow-y-auto rounded-3xl border border-white bg-white/70 p-[18px] shadow-[0_10px_26px_-8px_rgba(26,64,20,0.07)] backdrop-blur-[16px]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-1 pt-1">
        <h2 className="type-title-m text-ink">Your plan</h2>
        <span className="type-body-s text-t3">0 of {plan.steps.length} done</span>
      </div>

      <motion.div variants={riseIn} initial="hidden" animate="show" custom={1} className="flex flex-col gap-1 rounded-[22px] bg-white p-4">
        <p className="mb-2 text-[20px] leading-[1.1] font-medium tracking-[-0.5px] text-forest">{plan.title}</p>
        {plan.steps.map((s, i) => (
          <div key={s.title} className="flex items-center gap-3 py-2">
            <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full type-label-s", dots[i % dots.length])}>{i + 1}</span>
            <span className="flex-1 type-label-m text-ink">{s.title}</span>
            <span className="type-caption text-t3">{s.minutes} min</span>
          </div>
        ))}
      </motion.div>

      <Pill label="Start step 1" height={50} className="w-full" href="/step-booked" />

      <h3 className="mt-1 px-1 type-title-m text-ink">This week</h3>
      <motion.div variants={riseIn} initial="hidden" animate="show" custom={2} className="flex flex-col gap-3.5 rounded-[22px] bg-white p-4">
        {week.map((w, i) => (
          <div key={w.label} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="type-body-s text-t1">{w.label}</span>
              <span className="type-label-m text-forest">{w.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-forest/7">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${w.from}, ${w.to})` }}
                initial={{ width: 0 }}
                animate={{ width: `${w.pct}%` }}
                transition={{ ...spring.gentle, delay: 0.3 + i * 0.08 }}
              />
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        type="button"
        onClick={() => router.push("/step-booked")}
        variants={riseIn}
        initial="hidden"
        animate="show"
        custom={3}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-[22px] p-3.5 text-left"
        style={{ background: "linear-gradient(160deg, #ffe7da 0%, #fff6e3 100%)" }}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-peach-soft text-peach-text">
          <Icon name="cloud" size={19} />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="type-label-m text-ink">Tonight 7–9 PM is hard-to-start</span>
          <span className="type-caption text-peach-text">Book a 3-min start at 6:45?</span>
        </span>
      </motion.button>
    </aside>
  );
}
