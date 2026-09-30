"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { haptic, spring } from "@/lib/motion";
import { plan } from "@/lib/mock";

const glows = [
  { x: -90, y: 20, w: 200, h: 200, color: "#ffffff", opacity: 0.55, blur: 70 },
  { x: 300, y: 60, w: 180, h: 180, color: "#ffffff", opacity: 0.5, blur: 70 },
  { x: 50, y: 360, w: 300, h: 160, color: "#f3fbec", opacity: 0.9, blur: 60 },
];

const details = [
  ["When", "Today, 6:45 PM"],
  ["Duration", "3 minutes"],
  ["Evo checks in", "7:00 PM"],
  ["Reminder", "5 min before"],
];

/** 05 · Step booked */
export default function StepBooked() {
  const router = useRouter();
  const step = plan.steps[0];
  useEffect(() => haptic("success"), []);

  return (
    <Screen
      glows={glows}
      rays={{ cx: 196, cy: 178, inner: 92, outer: 280, count: 72, stroke: 1, strokeOpacity: 0.6, spinOnce: true }}
      under={
        <div
          className="absolute top-[-180px] left-[-184px] h-[700px] w-[760px] rounded-[50%]"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, #6fd447 0%, #9be070 35%, #d8f5c2 75%, #f3fbec 100%)" }}
        />
      }
    >
      <div className="relative flex flex-1 flex-col items-center pt-[93px]">
        {/* Seal */}
        <div className="relative size-[170px]">
          <div className="absolute inset-0 rounded-full bg-white/35 blur-[3px]" />
          <motion.div
            className="absolute top-[21px] left-[21px] flex size-32 items-center justify-center rounded-full shadow-[0_16px_30px_-6px_rgba(77,166,38,0.45),inset_0_3px_6px_rgba(255,255,255,0.5)]"
            style={{ background: "linear-gradient(135deg, #a3e27d 0%, #62bf3b 100%)" }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring.default}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static seal shape */}
            <img src="/evo/seal.svg" alt="" className="absolute size-[61px]" />
            <svg viewBox="0 0 24 24" className="relative size-[30px]" fill="none" stroke="#3f8f22" strokeWidth={1.5}>
              <motion.path
                d="M5 14L8.5 17.5L19 6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              />
            </svg>
          </motion.div>
        </div>

        <h1 className="mt-[25px] text-center text-[32px] leading-[1.06] font-medium tracking-[-0.96px] text-forest">Step booked.</h1>
        <p className="mt-3 type-body-l text-lime-deep">Future you will thank you.</p>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring.gentle, delay: 0.2 }}
          className="relative mt-[18px] w-[min(345px,calc(100vw-32px))] self-center overflow-hidden rounded-[30px] bg-white shadow-[0_24px_44px_-14px_rgba(31,71,20,0.14)]"
        >
          <div className="relative h-28 bg-gradient-to-r from-[#d9f5ec] via-[#e4f7d6] via-55% to-[#fff6d6] px-[22px] pt-6">
            <p className="text-[24px] leading-[1.06] font-medium tracking-[-0.72px] text-ink">{step.title}</p>
            <p className="mt-2.5 type-body-s whitespace-pre text-t3">{`Exam reset  ·  Step 1 of ${plan.steps.length}`}</p>
            <div className="mt-2.5 flex gap-1">
              {plan.steps.map((_, i) => (
                <span key={i} className={`h-[5px] w-11 rounded-[3px] ${i === 0 ? "bg-lime-deep" : "bg-forest/12"}`} />
              ))}
            </div>
            <span className="absolute top-[26px] right-[22px] flex items-center gap-1 rounded-full bg-white/80 py-1.5 pr-3 pl-2.5 type-label-s text-lime-deep">
              <Icon name="clock" size={14} />
              {step.minutes} min
            </span>
          </div>
          {/* Ticket notches + perforation */}
          <span className="absolute top-[100px] -left-3 size-6 rounded-full bg-paper" />
          <span className="absolute top-[100px] -right-3 size-6 rounded-full bg-paper" />
          <span className="absolute top-28 right-6 left-6 border-t-[1.2px] border-dashed border-line-strong" />

          <div className="grid grid-cols-2 gap-x-0 gap-y-[18px] px-[22px] pt-[22px]">
            {details.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="type-caption text-t3">{k}</span>
                <span className="type-title-m text-ink">{v}</span>
              </div>
            ))}
          </div>
          <div className="mx-[22px] mt-[18px] mb-[22px] flex items-center gap-2.5 rounded-[18px] bg-lime-wash py-3 pr-3.5 pl-3">
            <Icon name="sparkle" size={18} className="shrink-0 text-lime-deep" />
            <p className="type-body-s text-t2">No order, no fixing. Just get it out of your head.</p>
          </div>
        </motion.div>

        <div className="mt-auto flex w-full gap-2.5 px-6 pt-8 pb-[30px]">
          <Pill label="Start now" className="flex-1" confirm href="/focus" />
          <motion.button
            type="button"
            aria-label="Edit reminder"
            onClick={() => router.push("/reminders")}
            whileTap={{ scale: 0.92 }}
            className="flex size-[58px] shrink-0 cursor-pointer items-center justify-center rounded-[29px] border border-line bg-white text-ink"
          >
            <Icon name="bell" size={22} />
          </motion.button>
        </div>
      </div>
    </Screen>
  );
}
