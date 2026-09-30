"use client";

import { motion } from "motion/react";
import { Icon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export type PlanStep = { title: string; how: string; minutes: number };
export type Plan = { title: string; steps: PlanStep[] };

const accents = [
  { dot: "", pill: "bg-lime-soft text-lime-deep" },
  { dot: "bg-lavender-soft text-lavender-text", pill: "bg-lavender-soft text-lavender-text" },
  { dot: "bg-sky-soft text-sky-text", pill: "bg-sky-soft text-sky-text" },
  { dot: "bg-peach-soft text-peach-text", pill: "bg-peach-soft text-peach-text" },
  { dot: "bg-mint-soft text-mint-text", pill: "bg-mint-soft text-mint-text" },
];

/** 56 px progress ring; draws in over 400 ms. */
function Ring({ done, total }: { done: number; total: number }) {
  const r = 25;
  const c = 2 * Math.PI * r;
  const p = Math.max(done / total, 0.035);
  return (
    <div className="relative size-14 shrink-0">
      <svg viewBox="0 0 56 56" className="size-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="rgba(255,255,255,0.7)" stroke="rgba(36,46,33,0.1)" strokeWidth="4" />
        <motion.circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="#62bf3b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - p) }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1], delay: 0.2 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center type-label-m text-forest">
        {done}/{total}
      </span>
    </div>
  );
}

export function PlanCard({ plan, onStart, onEdit }: { plan: Plan; onStart?: () => void; onEdit?: () => void }) {
  const total = plan.steps.reduce((s, x) => s + x.minutes, 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
      className="flex w-full flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_24px_44px_-14px_rgba(31,71,20,0.14)]"
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#e4f7d6] via-[#ddf5ec] via-60% to-[#fff6d6] pt-[22px] pr-5 pb-5 pl-[22px]">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5 text-lime-deep">
            <Icon name="path" size={14} />
            <span className="type-label-s">YOUR RECOVERY PLAN</span>
          </div>
          <p className="text-[24px] leading-[1.08] font-medium tracking-[-0.72px] text-forest">{plan.title}</p>
          <p className="type-body-s text-t2">
            {plan.steps.length} small steps · about {total} min
          </p>
        </div>
        <Ring done={0} total={plan.steps.length} />
      </div>

      <div className="flex flex-col pt-[18px] pr-5 pb-1.5 pl-[18px]">
        {plan.steps.map((s, i) => {
          const a = accents[i % accents.length];
          const last = i === plan.steps.length - 1;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring.snappy, delay: 0.1 + i * 0.04 }}
              className="flex w-full items-start gap-3.5"
            >
              <div className="flex flex-col items-center self-stretch">
                <span
                  className={cn(
                    "flex size-[30px] shrink-0 items-center justify-center rounded-[15px] type-label-s",
                    i === 0 ? "text-forest shadow-[0_6px_14px_-4px_rgba(97,191,59,0.45)]" : a.dot,
                  )}
                  style={i === 0 ? { background: "linear-gradient(135deg, #a3e27d 0%, #62bf3b 71.43%)" } : undefined}
                >
                  {i + 1}
                </span>
                {!last && <span className="w-0.5 flex-1 rounded-[1px] bg-muted" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-[5px] pb-5">
                <div className="flex items-center gap-2">
                  <p className="flex-1 type-label-m text-ink">{s.title}</p>
                  <span className={cn("flex items-center gap-1 rounded-full py-[3px] pr-[9px] pl-2 type-label-s", a.pill)}>
                    <Icon name="clock" size={12} />
                    {s.minutes} min
                  </span>
                </div>
                <p className="type-body-s text-t3">{s.how}</p>
                {i === 0 && onStart && (
                  <div className="pt-1.5">
                    <Pill label="Start step 1" height={42} className="pr-4 pl-[18px]" onClick={onStart} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-lime-wash px-[22px] pt-3.5 pb-4">
        <div className="flex items-center gap-1.5 text-t2">
          <Icon name="bell" size={14} />
          <span className="type-caption">I’ll check in after each step</span>
        </div>
        <button type="button" onClick={onEdit} className="cursor-pointer type-label-s text-lime-deep">
          Edit plan
        </button>
      </div>
    </motion.div>
  );
}
