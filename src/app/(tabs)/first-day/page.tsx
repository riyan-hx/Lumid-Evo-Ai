"use client";

import { motion } from "motion/react";
import { Rays, glows } from "@/components/ui/backdrop";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { riseIn } from "@/lib/motion";
import { today } from "@/lib/time";
import { useApp } from "@/lib/store";

const next = [
  { title: "You check in", hint: "Tap how you feel — no typing needed" },
  { title: "Evo reflects", hint: "What might be keeping you stuck" },
  { title: "One small step", hint: "Booked for a time that suits you" },
];

export default function FirstDay() {
  const { name } = useApp();
  const { date, greeting } = today();
  return (
    <Screen glows={glows.onboarding} nav>
      <div className="flex flex-col gap-4 px-6 pt-[58px] pb-6">
        <p className="type-caption text-t3">{date}</p>
        <h1 className="text-[36px] leading-[1.06] font-medium tracking-[-1.08px] text-forest">
          {greeting},
          <br />
          {name}.
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
          className="relative h-[210px] w-full overflow-hidden rounded-[30px]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, #6fd447 0%, #9be070 35%, #baeb99 55%, #d8f5c2 75%, #f3fbec 100%)",
          }}
        >
          <div className="absolute top-0 left-0 size-full">
            <Rays cx={280} cy={70} inner={50} outer={300} count={60} stroke={1} strokeOpacity={0.5} spinOnce />
          </div>
          <div className="absolute top-[15px] left-[225px]">
            <Orb size={110} state="breathing" />
          </div>
          <p className="absolute top-6 left-[22px] type-label-s text-forest">YOUR FIRST CHECK-IN</p>
          <p className="absolute top-[50px] left-[22px] text-[26px] leading-[1.06] font-medium tracking-[-0.78px] text-forest">
            How are you
            <br />
            arriving today?
          </p>
          <p className="absolute top-[118px] left-[22px] type-body-s text-forest opacity-70">Takes 10 seconds</p>
          <div className="absolute top-[146px] left-[22px]">
            <Pill label="Check in" height={46} href="/check-in?onboarding=1" className="pr-5 pl-[22px]" />
          </div>
        </motion.div>

        <p className="type-title-m text-ink">What happens next</p>
        <div className="glass flex w-full flex-col rounded-[22px] px-4 py-1">
          {next.map((n, i) => (
            <motion.div
              key={n.title}
              variants={riseIn}
              initial="hidden"
              animate="show"
              custom={i + 2}
              className={`flex items-center gap-3 py-3 ${i < next.length - 1 ? "border-b border-line" : ""}`}
            >
              <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[15px] bg-lime-soft type-label-s text-lime-deep">
                {i + 1}
              </span>
              <div className="flex flex-col gap-px">
                <p className="type-label-m text-ink">{n.title}</p>
                <p className="type-caption text-t3">{n.hint}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex w-full items-center gap-3 rounded-[22px] border-[1.5px] border-dashed border-line-strong px-4 py-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-subtle text-t3">
            <Icon name="heart" size={18} />
          </span>
          <p className="type-body-s text-t3">Your wins will show up here — even the tiny ones.</p>
        </div>
      </div>
    </Screen>
  );
}
