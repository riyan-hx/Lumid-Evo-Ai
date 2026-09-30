"use client";

import { motion, useReducedMotion } from "motion/react";
import { glows } from "@/components/ui/backdrop";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import Link from "next/link";

const tags = [
  { label: "Feeling stuck", dot: "#f08a5d", x: 85.2, y: 162.9, rotate: -6, delay: 0 },
  { label: "Understood", dot: "#8b6cf0", x: 302.1, y: 233.6, rotate: 5, delay: 1.2 },
  { label: "One small step", dot: "#62bf3b", x: 292.7, y: 434.7, rotate: -4, delay: 2.4 },
];

export default function Welcome() {
  const reduce = useReducedMotion();
  return (
    <Screen
      glows={glows.welcome}
      rays={{ cx: 196, cy: 300, inner: 130, outer: 300, count: 64, stroke: 1.2, strokeOpacity: 0.55, opacity: 0.9 }}
    >
      <div className="relative mx-auto h-[518px] w-[393px] shrink-0">
        <motion.div
          className="absolute top-[180px] left-[76px]"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
        >
          <Orb size={240} state="breathing" />
        </motion.div>
        {tags.map((t, i) => (
          <motion.div
            key={t.label}
            className="absolute"
            style={{ left: t.x, top: t.y }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 30, delay: 0.25 + i * 0.08 }}
          >
            <motion.div
              className="-translate-x-1/2 -translate-y-1/2"
              style={{ rotate: t.rotate }}
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: t.delay }}
            >
              <div className="flex items-center gap-2 rounded-full border border-white bg-white/70 py-2.5 pr-3.5 pl-3 shadow-[0_10px_24px_-6px_rgba(26,64,20,0.1)] backdrop-blur-[10px]">
                <span className="size-2 rounded-full" style={{ background: t.dot }} />
                <span className="type-label-s whitespace-nowrap text-ink">{t.label}</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3.5 px-7">
        <h1 className="text-[35px] leading-[38px] font-medium tracking-[-1.225px] text-forest">
          Take a breath.
          <br />
          You’re in a calm space.
        </h1>
        <p className="w-full max-w-[320px] type-body-l text-t2">
          Evo helps you see what’s keeping you stuck — and turns it into one small step you can take today.
        </p>
      </div>

      <div className="mt-auto flex flex-col items-center gap-[34px] px-7 pt-9 pb-[26px]">
        <Pill label="Start with Evo" href="/sign-in" confirm className="w-full" />
        <Link href="/sign-in" className="type-label-m text-t2">
          I already have an account
        </Link>
      </div>
    </Screen>
  );
}
