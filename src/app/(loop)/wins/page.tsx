"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Rays, glows } from "@/components/ui/backdrop";
import { BackButton, IconButton } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { riseIn, spring } from "@/lib/motion";

type Range = "Week" | "Month" | "All";

const stats: Record<Range, { count: number; label: string; delta: string; bars: number[]; labels: string[] }> = {
  Week: { count: 3, label: "things you started this week\nthat you’d been avoiding", delta: "1 more than last week", bars: [20, 34, 0, 26, 40, 52, 78], labels: ["M", "T", "W", "T", "F", "S", "S"] },
  Month: { count: 7, label: "things you started this month\nthat you’d been avoiding", delta: "3 more than August", bars: [34, 52, 40, 78], labels: ["W1", "W2", "W3", "W4"] },
  All: { count: 19, label: "things you started since\nyou met Evo", delta: "Every one counts", bars: [30, 46, 78], labels: ["Jul", "Aug", "Sep"] },
};

const recent: { title: string; meta: string; day: string; done: boolean; icon: IconName }[] = [
  { title: "Brain dump", meta: "3 min · Exam reset", day: "Tue", done: true, icon: "check" },
  { title: "25-minute sprint", meta: "Maths · phone away", day: "Mon", done: true, icon: "check" },
  { title: "Rest, then check in", meta: "Missed Sat — picked it up Sun", day: "", done: false, icon: "heart" },
];

function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const v = useMotionValue(reduce ? to : 0);
  const text = useTransform(v, (n) => Math.round(n).toString());
  useEffect(() => {
    if (reduce) return v.set(to);
    const c = animate(v, to, { duration: 0.6, ease: [0.2, 0, 0, 1] });
    return () => c.stop();
  }, [to, v, reduce]);
  return <motion.span>{text}</motion.span>;
}

/** 08 · Your wins — counts starts, not completions. */
export default function Wins() {
  const [range, setRange] = useState<Range>("Month");
  const s = stats[range];
  const max = Math.max(...s.bars);

  return (
    <Screen glows={glows.wins}>
      <div className="flex flex-col gap-5 px-6 pt-[58px] pb-[30px]">
        <div className="flex items-center justify-between">
          <BackButton href="/home" />
          <div className="glass flex gap-1 rounded-full p-1" role="tablist">
            {(Object.keys(stats) as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={cn("relative cursor-pointer rounded-full px-3.5 py-[7px] type-label-s", range === r ? "text-white" : "text-t2")}
              >
                {range === r && (
                  <motion.span
                    layoutId="wins-seg"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(155deg, #33412e 0%, #151a13 71.43%)" }}
                    transition={spring.snappy}
                  />
                )}
                <span className="relative">{r}</span>
              </button>
            ))}
          </div>
          <IconButton icon="heart" label="Share a win" />
        </div>

        <h1 className="text-[34px] leading-[1.06] font-medium tracking-[-1.02px] text-forest">
          You’re moving,
          <br />
          even on hard days.
        </h1>

        <div
          className="relative h-[228px] w-full overflow-hidden rounded-[30px] shadow-[0_20px_40px_-14px_rgba(77,158,41,0.25)]"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, #6fd447 0%, #9be070 35%, #baeb99 55%, #d8f5c2 75%, #f3fbec 100%)" }}
        >
          <Rays cx={280} cy={40} inner={50} outer={300} count={60} stroke={1} strokeOpacity={0.5} />
          <p className="absolute top-3.5 left-[22px] text-[84px] leading-[1.06] font-medium tracking-[-2.52px] text-forest">
            <CountUp key={range} to={s.count} />
          </p>
          <p className="absolute top-[110px] left-6 type-label-m whitespace-pre-line text-forest">{s.label}</p>
          <span className="absolute top-[164px] left-6 flex items-center gap-1 rounded-full bg-white/80 py-[5px] pr-3 pl-2.5 type-label-s text-lime-deep">
            <Icon name="send" size={13} />
            {s.delta}
          </span>
          <div className="absolute right-6 bottom-6 flex items-end gap-2.5">
            {s.bars.map((h, i) => (
              <div key={`${range}-${i}`} className="flex flex-col items-center gap-1.5">
                <motion.span
                  className={cn("w-[22px] rounded-lg", h === max ? "bg-forest" : "bg-white/75")}
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(h, 4) }}
                  transition={{ ...spring.default, delay: 0.1 + i * 0.04 }}
                />
                <span className="type-caption text-forest">{s.labels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass flex flex-col gap-3 rounded-[26px] px-5 py-[18px]">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-[10px] bg-lavender-soft text-lavender-text">
              <Icon name="brain" size={16} />
            </span>
            <span className="type-label-m text-lavender-text">What helps you start</span>
          </div>
          <p className="text-[20px] leading-[1.06] font-medium tracking-[-0.6px] text-ink">
            You start 2× more often after a quick brain dump in the evening.
          </p>
          <div className="flex gap-1.5 type-label-s">
            <span className="rounded-full bg-sun-soft px-2.5 py-[5px] text-sun-text">Evenings</span>
            <span className="rounded-full bg-mint-soft px-2.5 py-[5px] text-mint-text">Tiny first step</span>
            <span className="rounded-full bg-sky-soft px-2.5 py-[5px] text-sky-text">Phone away</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <p className="type-title-m text-ink">Notes from past you</p>
          <span className="type-label-s text-t3">3 saved</span>
        </div>
        <div className="relative pb-[38px]">
          <div className="absolute top-[14px] left-[13px] h-[148px] w-[330px] rotate-[-2.5deg] rounded-[28px] bg-[#e4f7d6]" />
          <div className="absolute top-[43px] left-[13px] h-[148px] w-[315px] rotate-[3.5deg] rounded-[28px] bg-[#e9e3ff]" />
          <motion.figure
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.gentle}
            className="relative flex flex-col gap-1.5 rounded-[28px] bg-white px-[22px] pt-[22px] pb-5 drop-shadow-[0_20px_20px_rgba(31,71,20,0.12)]"
          >
            <span className="h-6 text-[44px] leading-[24px] font-medium tracking-[-1.32px] text-lime">“</span>
            <blockquote className="text-[21px] leading-[1.06] font-medium tracking-[-0.63px] text-forest">
              It was easier than I thought. Just give it three minutes — you don’t have to finish.
            </blockquote>
            <figcaption className="flex items-center gap-2">
              <Orb size={24} state="still" />
              <span className="type-caption text-t3">You, after your first brain dump · 24 Sep</span>
            </figcaption>
          </motion.figure>
        </div>

        <p className="type-title-m text-ink">Recent</p>
        <div className="glass flex flex-col rounded-3xl px-4 py-1.5">
          {recent.map((r, i) => (
            <motion.div
              key={r.title}
              variants={riseIn}
              initial="hidden"
              animate="show"
              custom={i}
              className={cn("flex items-center gap-3 py-3", i < recent.length - 1 && "border-b border-line")}
            >
              <span
                className={cn("flex size-[34px] items-center justify-center rounded-[17px]", r.done ? "text-forest" : "bg-sun-soft text-sun-text")}
                style={r.done ? { background: "linear-gradient(135deg, #a3e27d 0%, #62bf3b 71.43%)" } : undefined}
              >
                <Icon name={r.icon} size={16} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-ink">{r.title}</span>
                <span className="type-caption text-t3">{r.meta}</span>
              </div>
              {r.day ? (
                <span className="type-caption text-t3">{r.day}</span>
              ) : (
                <span className="rounded-full bg-sun-soft px-2 py-[3px] type-label-s text-sun-text">Came back</span>
              )}
            </motion.div>
          ))}
        </div>

        <Pill label="Write a note to future you" className="w-full" href="/chat?checkedIn=1" />
      </div>
    </Screen>
  );
}
