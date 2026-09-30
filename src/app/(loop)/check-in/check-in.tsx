"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton, ProgressDots, SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { haptic, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

const moods = [
  { word: "Anxious", hue: 150 },
  { word: "Heavy", hue: 110 },
  { word: "Calm", hue: 0 },
  { word: "Okay", hue: -15 },
  { word: "Hopeful", hue: -35 },
  { word: "Tired", hue: 60 },
  { word: "Stressed", hue: 180 },
];

const energyWord = ["Empty", "Low", "Low-ish", "Steady", "Good", "Full"];
const energyPhrase = [
  "running on empty",
  "quite tired",
  "a little tired",
  "fairly steady",
  "some energy",
  "full of energy",
];

/** Figma wave heights (36 bars); the lime band sits around the energy value. */
const WAVE = [8, 8, 8, 8, 8, 8, 8, 9, 15, 14, 24, 34, 37, 50, 62, 63, 71, 76, 68, 66, 62, 47, 40, 34, 21, 17, 15, 8, 8, 8, 8, 8, 8, 8, 8];
const TRACK = 309;

export function CheckIn({ onboarding }: { onboarding: boolean }) {
  const router = useRouter();
  const app = useApp();
  const reduce = useReducedMotion();
  const [mood, setMood] = useState("Calm");
  const [energy, setEnergy] = useState(40);
  const moodRow = useRef<HTMLDivElement>(null);

  const hue = moods.find((m) => m.word === mood)?.hue ?? 0;
  const step = energy / 20;

  // Centre the selected mood chip in the horizontal scroller.
  useEffect(() => {
    const row = moodRow.current;
    const chip = row?.querySelector<HTMLElement>(`[data-mood="${mood}"]`);
    if (row && chip) row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [mood]);

  const save = () => app.update({ checkIn: { mood, energy, at: new Date().toISOString() } });

  return (
    <Screen glows={glows.checkIn}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <div className="relative flex h-11 items-center justify-between px-5">
          <BackButton />
          {onboarding && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <ProgressDots step={4} />
            </div>
          )}
          <button
            type="button"
            className="cursor-pointer px-1 type-label-m text-t3"
            onClick={() => router.push(onboarding ? "/chat" : "/home")}
          >
            Skip
          </button>
        </div>

        <h1 className="mx-auto mt-6 w-[345px] text-center text-[30px] leading-[34px] font-medium tracking-[-0.9px] text-forest">
          How are you feeling
          <br />
          right now?
        </h1>
        <p className="mt-2.5 text-center type-body-m text-t3">There’s no wrong answer.</p>

        <div className="relative mx-auto mt-1.5 flex flex-col items-center">
          <Orb size={210} state="breathing" hue={hue} />
          <motion.p
            key={`${mood}-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.24 }}
            className="mt-1.5 type-title-m text-forest"
            aria-live="polite"
          >
            {mood}, {energyPhrase[step]}
          </motion.p>

          <div className="mt-2.5 flex h-[76px] items-end gap-1" aria-hidden>
            {WAVE.map((base, i) => {
              const centre = 17;
              const lit = Math.abs(i - centre) <= 4;
              const peak = i === centre;
              const scale = 0.55 + (energy / 100) * 0.8;
              const hgt = Math.max(8, base * (lit ? scale : 1));
              return (
                <motion.span
                  key={i}
                  className="w-1 rounded-[2px]"
                  style={{
                    background: peak ? "#3f8f22" : lit ? `rgba(136,217,95,${0.75 - Math.abs(i - centre) * 0.075})` : "rgba(36,46,33,0.1)",
                  }}
                  animate={reduce ? { height: hgt } : { height: [hgt, hgt * (lit ? 0.88 : 1), hgt] }}
                  transition={{
                    height: reduce ? spring.snappy : { duration: 2 + (i % 5) * 0.3, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
              );
            })}
          </div>
        </div>

        <div
          ref={moodRow}
          className="no-scrollbar mt-[18px] flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 py-1"
          role="radiogroup"
          aria-label="Mood"
        >
          {moods.map((m) => (
            <div key={m.word} data-mood={m.word} className="snap-center">
              <SoftChip label={m.word} selected={mood === m.word} onClick={() => setMood(m.word)} />
            </div>
          ))}
        </div>

        <div className="mx-6 mt-3 flex flex-col gap-3 rounded-3xl border border-white bg-white/72 px-[18px] pt-4 pb-3.5 shadow-[0_8px_20px_-6px_rgba(26,64,20,0.08)] backdrop-blur-[10px]">
          <div className="flex items-start justify-between type-label-m">
            <span className="text-ink">Energy</span>
            <span className="text-lime-deep">
              {energy} · {energyWord[step]}
            </span>
          </div>
          <EnergySlider value={energy} onChange={setEnergy} />
          <div className="flex justify-between type-caption text-t3">
            {[0, 20, 40, 60, 80, 100].map((t) => (
              <button key={t} type="button" className="cursor-pointer" onClick={() => setEnergy(t)} tabIndex={-1}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto px-6 pt-6 pb-[30px]">
          <Pill label="Continue" className="w-full" confirm href="/chat?checkedIn=1" onClick={save} />
        </div>
      </div>
    </Screen>
  );
}

/** Thumb follows the finger 1:1, snaps to 20-step marks with spring/snappy, selection tick per mark. */
function EnergySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue((value / 100) * TRACK);
  const fill = useTransform(x, (v) => `${(Math.max(0, v) / TRACK) * 100}%`);
  const last = useRef(value);

  useEffect(() => {
    const controls = animate(x, (value / 100) * TRACK, spring.snappy);
    return () => controls.stop();
  }, [value, x]);

  const fromPointer = (clientX: number, snap: boolean) => {
    const rect = ref.current!.getBoundingClientRect();
    const px = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const scaled = (px / rect.width) * TRACK;
    const v = Math.round((px / rect.width) * 5) * 20;
    if (!snap) x.set(scaled);
    if (v !== last.current) {
      last.current = v;
      haptic("selection");
      onChange(v);
    }
    if (snap) animate(x, (v / 100) * TRACK, spring.snappy);
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Energy"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value} out of 100`}
      className="relative h-[18px] w-full cursor-pointer touch-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e.clientX, false);
      }}
      onPointerMove={(e) => e.buttons && fromPointer(e.clientX, false)}
      onPointerUp={(e) => fromPointer(e.clientX, true)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(100, value + 20));
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(0, value - 20));
      }}
    >
      <span className="absolute inset-x-0 top-[5px] h-2 rounded-full bg-forest/8" />
      <motion.span
        className="absolute top-[5px] left-0 h-2 rounded-full"
        style={{ width: fill, background: "linear-gradient(90deg, #c9eeb0, #62bf3b)" }}
      />
      {[1, 2, 3, 4].map((i) =>
        i * 20 === value ? null : (
          <span
            key={i}
            className="absolute top-[7px] -ml-0.5 size-1 rounded-full bg-forest/25"
            style={{ left: `${i * 20}%` }}
          />
        ),
      )}
      <motion.span
        className="absolute top-0 -ml-[9px] size-[18px] rounded-full border-4 border-lime bg-white shadow-[0_4px_10px_rgba(97,191,59,0.5)]"
        style={{ left: fill }}
        whileTap={{ scale: 1.15 }}
      />
    </div>
  );
}
