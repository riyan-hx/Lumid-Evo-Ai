"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Glow } from "@/components/ui/backdrop";
import { BackButton, IconTile, Toggle } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { useForecastDismissal } from "@/lib/forecast";
import { ease, haptic, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

const glows: Glow[] = [
  {
    x: -100,
    y: -120,
    w: 380,
    h: 320,
    color: "#a3e27d",
    opacity: 0.5,
    blur: 110,
  },
  {
    x: 200,
    y: -40,
    w: 260,
    h: 260,
    color: "#ffd9c2",
    opacity: 0.55,
    blur: 100,
  },
  { x: 120, y: 600, w: 300, h: 260, color: "#dcebff", opacity: 0.6, blur: 110 },
];

type Level = 1 | 2 | 3;

const LEVELS: Record<Level, { label: string; color: string; text: string; soft: string }> = {
  1: {
    label: "Easy",
    color: "#88d95f",
    text: "text-mint-text",
    soft: "bg-mint-subtle",
  },
  2: {
    label: "Watch",
    color: "#f2b233",
    text: "text-sun-text",
    soft: "bg-sun-subtle",
  },
  3: {
    label: "Hard to start",
    color: "#f08a5d",
    text: "text-peach-text",
    soft: "bg-peach-subtle",
  },
};

const WEEK: { short: string; day: string; level: Level; reason: string }[] = [
  {
    short: "Tue",
    day: "Tonight",
    level: 3,
    reason: "Maths after dinner has been hard to start 3 of the last 4 times.",
  },
  {
    short: "Wed",
    day: "Wednesday",
    level: 1,
    reason: "Mornings have gone well — you’ve started early on recent Wednesdays.",
  },
  {
    short: "Thu",
    day: "Thursday",
    level: 2,
    reason: "Long college day — evenings after long days tend to start slower.",
  },
  {
    short: "Fri",
    day: "Friday",
    level: 1,
    reason: "A lighter day — starting has usually felt okay.",
  },
  {
    short: "Sat",
    day: "Saturday",
    level: 2,
    reason: "Weekends drift — starting after noon has been harder.",
  },
  {
    short: "Sun",
    day: "Sunday",
    level: 1,
    reason: "Sunday evenings have been calm — a good time for a small start.",
  },
  {
    short: "Mon",
    day: "Monday",
    level: 3,
    reason: "Week restart — Monday evenings have often been hard to start.",
  },
];

/** 11 · Avoidance forecast — when starting tends to be hard this week, learned from check-ins. Private to you. */
export default function Forecast() {
  const app = useApp();
  const on = app.consents.forecast;
  const { dismissed, dismiss, undo } = useForecastDismissal();
  const [why, setWhy] = useState(false);
  const [dayIdx, setDayIdx] = useState(0);
  const [dayOpen, setDayOpen] = useState(false);
  const day = WEEK[dayIdx];

  const setForecast = (v: boolean) => app.update({ consents: { ...app.consents, forecast: v } });

  return (
    <Screen glows={glows} app>
      <div className="flex flex-1 flex-col gap-3 px-6 pt-[54px] pb-[30px]">
        <BackButton className="-ml-1" />

        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="type-label-s text-lime-deep">Evo’s forecast</p>
            <h1 className="text-[30px] leading-[1.06] font-medium tracking-[-0.9px] text-forest">Your week ahead</h1>
          </div>
          <Orb size={48} state={on ? "idle" : "still"} />
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {on ? (
            <motion.div key="on" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={ease.out} className="flex flex-col gap-3">
              {/* Tonight */}
              <section
                className="relative flex flex-col overflow-hidden rounded-[30px] px-[22px] pt-6 pb-5 shadow-[0_20px_40px_-14px_rgba(178,89,51,0.15)]"
                style={{
                  background: "linear-gradient(144deg, #ffe7da 0%, #fff1e0 39.3%, #f3fbec 71.4%)",
                }}
                aria-label="Tonight"
              >
                <span aria-hidden className="pointer-events-none absolute top-[-60px] right-[-45px] size-[200px] rounded-full bg-peach-solid/35 blur-[50px]" />
                <Icon name="cloud" size={56} className="absolute top-[22px] right-[22px] text-peach-text" aria-hidden />
                <p className="relative type-label-s whitespace-pre text-peach-text">{"TONIGHT  ·  7 – 9 PM"}</p>
                <h2 className="relative mt-2 pr-16 text-[30px] leading-[1.06] font-medium tracking-[-0.9px] text-ink">
                  Hard-to-start
                  <br />
                  window
                </h2>
                <div className="relative mt-4 flex items-center gap-2">
                  <div
                    className="h-2 w-[120px] shrink-0 overflow-hidden rounded-[4px] bg-forest/8"
                    role="meter"
                    aria-label="Chance you’ll avoid it"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={80}
                  >
                    <motion.div
                      className="h-2 rounded-[4px] bg-gradient-to-r from-[#f2b233] to-peach-solid"
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ ...spring.gentle, delay: 0.15 }}
                    />
                  </div>
                  <span className="type-label-s text-peach-text">High chance you’ll avoid it</span>
                </div>
                <p className="relative mt-1.5 type-body-s text-t2">Maths revision after dinner — skipped 3 of the last 4 times. You were tired and scrolling.</p>
                <motion.button
                  type="button"
                  onClick={() => {
                    haptic("selection");
                    setWhy(true);
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring.snappy}
                  className="relative mt-5 flex cursor-pointer items-center gap-1.5 self-start rounded-full bg-white/80 py-[5px] pr-3 pl-2.5 type-caption text-t2 transition-colors duration-150 hover:bg-white"
                >
                  <Icon name="sparkle" size={13} />
                  Learned from your check-ins
                </motion.button>
              </section>

              {/* Get ahead of it */}
              <AnimatePresence mode="wait" initial={false}>
                {dismissed ? (
                  <motion.div
                    key="dismissed"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={ease.out}
                    className="glass flex items-center gap-3 rounded-[22px] py-2.5 pr-2.5 pl-4"
                  >
                    <Icon name="moon" size={18} className="shrink-0 text-t3" />
                    <span className="min-w-0 flex-1 type-body-s text-t2">No nudge tonight. Rest is fine too.</span>
                    <motion.button
                      type="button"
                      onClick={() => {
                        haptic("light");
                        undo();
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={spring.snappy}
                      className="shrink-0 cursor-pointer rounded-full bg-lime-soft px-3.5 py-2 type-label-s text-forest transition-colors duration-150 hover:bg-lime/40"
                    >
                      Undo
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.section
                    key="ahead"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={ease.out}
                    className="glass flex flex-col gap-3 rounded-[26px] px-5 py-[18px]"
                  >
                    <p className="type-label-s text-lime-deep">Get ahead of it</p>
                    <p className="text-[19px] leading-[1.06] font-medium tracking-[-0.57px] text-ink">
                      Book a 3-minute start at 6:45 PM — before dinner, while you still have energy?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Pill label="Book 6:45 PM" icon={null} height={46} href="/step-booked" style={{ paddingInline: 20 }} />
                      <Pill
                        label="Not today"
                        variant="glass"
                        icon={null}
                        height={46}
                        style={{ paddingInline: 20 }}
                        onClick={() => {
                          haptic("light");
                          dismiss();
                        }}
                      />
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              <p className="type-title-m text-ink">This week</p>
              <div className="glass flex items-start justify-between rounded-3xl p-3.5 max-[340px]:px-2">
                {WEEK.map((d, i) => {
                  const lv = LEVELS[d.level];
                  return (
                    <motion.button
                      key={d.short}
                      type="button"
                      aria-label={`${i === 0 ? "Today" : d.day}: ${lv.label}`}
                      onClick={() => {
                        haptic("selection");
                        setDayIdx(i);
                        setDayOpen(true);
                      }}
                      whileTap={{ scale: 0.92 }}
                      transition={spring.snappy}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-1.5 rounded-[14px] p-1.5 transition-colors duration-150 max-[340px]:p-1",
                        i === 0 ? "bg-lime-wash" : "hover:bg-forest/4",
                      )}
                    >
                      <span className="flex flex-col gap-[3px]">
                        {[3, 2, 1].map((n) => (
                          <motion.span
                            key={n}
                            className="h-2.5 w-[18px] rounded-[3px]"
                            initial={{ opacity: 0, scaleX: 0.6 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{
                              ...spring.snappy,
                              delay: 0.05 + i * 0.03,
                            }}
                            style={{
                              background: n <= d.level ? lv.color : "rgba(36,46,33,0.07)",
                            }}
                          />
                        ))}
                      </span>
                      <span className={cn("type-caption", i === 0 ? "text-forest" : "text-t3")}>{d.short}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-x-3.5 gap-y-1.5">
                {([1, 2, 3] as Level[]).map((l) => (
                  <span key={l} className="flex items-center gap-1.5 type-caption text-t2">
                    <span className="size-2 rounded-full" style={{ background: LEVELS[l].color }} />
                    {LEVELS[l].label}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.section
              key="off"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={ease.out}
              className="glass flex flex-col gap-3 rounded-[26px] px-5 py-[18px]"
            >
              <IconTile icon="cloud" bg="bg-muted" color="text-t3" />
              <p className="text-[19px] leading-[1.06] font-medium tracking-[-0.57px] text-ink">Forecasts are off</p>
              <p className="type-body-s text-t2">
                Evo isn’t using your check-ins to look ahead at hard-to-start times. Everything else works the same. Turn it on if a heads-up would help.
              </p>
              <div className="flex items-center gap-2.5 border-t border-line pt-3">
                <span className="flex-1 type-label-m text-t1">Show my week ahead</span>
                <Toggle label="Show my week ahead" on={false} onChange={() => setForecast(true)} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <p className="flex items-center gap-1.5 type-caption text-t3">
          <Icon name="lock" size={12} className="shrink-0" />
          Forecasts are private to you and never shared.
        </p>
      </div>

      {/* Why — the evidence, honestly */}
      <Sheet open={why} onClose={() => setWhy(false)} label="How Evo made this forecast">
        <div className="flex flex-col gap-3.5 px-1 pb-2">
          <div className="flex items-center gap-2">
            <IconTile icon="sparkle" bg="bg-lavender-soft" color="text-lavender-text" size={28} iconSize={16} radius={10} />
            <span className="type-label-m text-lavender-text">Learned from your check-ins</span>
          </div>
          <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">A pattern, not a prediction about you</h2>
          <div className="glass flex flex-col rounded-[22px] px-4 py-1">
            {[
              ["What Evo saw", "Maths after dinner skipped 3 of 4 evenings"],
              ["What you said", "“Tired”, “ended up scrolling”"],
              ["When", "Between 7 and 9 PM"],
            ].map(([k, v], i) => (
              <div key={k} className={cn("flex items-start justify-between gap-4 py-2.5", i < 2 && "border-b border-line")}>
                <span className="shrink-0 type-body-s text-t3">{k}</span>
                <span className="text-right type-label-m text-t1">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-sun-subtle px-3.5 py-3">
            <span className="type-label-s text-sun-text">Confidence: moderate</span>
            <span className="type-body-s text-t2">
              It’s based on only 4 evenings, so it can easily be wrong. It gets more accurate — or corrects itself — as you keep checking in.
            </span>
          </div>
          <p className="type-body-s text-t2">This isn’t a diagnosis or a judgement. It’s just a heads-up so you can plan a smaller start.</p>
          <Pill label="Got it" icon={null} className="w-full" onClick={() => setWhy(false)} />
          <button
            type="button"
            onClick={() => {
              setWhy(false);
              setForecast(false);
            }}
            className="cursor-pointer self-center py-1 type-label-m text-t2 transition-colors duration-150 hover:text-t1 active:scale-95"
          >
            Turn off forecasts
          </button>
        </div>
      </Sheet>

      {/* Day detail */}
      <Sheet open={dayOpen} onClose={() => setDayOpen(false)} label="Day forecast">
        <div className="flex flex-col gap-3.5 px-1 pb-2">
          <span className={cn("self-start rounded-full px-2.5 py-[5px] type-label-s", LEVELS[day.level].soft, LEVELS[day.level].text)}>{LEVELS[day.level].label}</span>
          <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">{day.day}</h2>
          <p className="type-body-m text-t2">{day.reason}</p>
          <p className="type-caption text-t3">A guess from your check-ins, not a rule.</p>
          {dayIdx === 0 && !dismissed ? (
            <Pill label="Book 6:45 PM" className="w-full" href="/step-booked" />
          ) : (
            <Pill label="Got it" icon={null} className="w-full" onClick={() => setDayOpen(false)} />
          )}
        </div>
      </Sheet>
    </Screen>
  );
}
