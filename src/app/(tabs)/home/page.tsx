"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AskEvoSheet, type AskContext } from "@/components/evo/ask-evo-sheet";
import { Composer } from "@/components/evo/composer";
import { glows } from "@/components/ui/backdrop";
import { AskEvo, IconButton, SectionTitle, SoftChip } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { riseIn } from "@/lib/motion";
import { useApp } from "@/lib/store";
import { today } from "@/lib/time";
import { HomeWide } from "./home-wide";

const why: { icon: IconName; tile: string; color: string; text: string }[] = [
  { icon: "moon", tile: "bg-lavender-soft", color: "text-lavender-text", text: "Slept after 1 AM last night" },
  { icon: "cloud", tile: "bg-peach-soft", color: "text-peach-text", text: "7–9 PM is usually your hardest window" },
  { icon: "heart", tile: "bg-mint-soft", color: "text-mint-text", text: "You started 3 things this week — that counts" },
];

const chats: { icon: IconName; tile: string; color: string; title: string; meta: string; when: string }[] = [
  { icon: "mic", tile: "bg-lavender-soft", color: "text-lavender-text", title: "Voice · Malayalam", meta: "Just listen · 4 min", when: "1:10 PM" },
  { icon: "wind", tile: "bg-sky-soft", color: "text-sky-text", title: "Breathing, 5 rounds", meta: "You felt steadier after round 3", when: "Mon" },
  { icon: "chat", tile: "bg-peach-soft", color: "text-peach-text", title: "Just venting", meta: "Group project — felt left out", when: "Sun" },
];

/** 03 · Home (Variation A) */
export default function Home() {
  const router = useRouter();
  const { name } = useApp();
  const { date, greeting } = today();
  const [reply, setReply] = useState<string | null>(null);
  const [ask, setAsk] = useState<AskContext | null>(null);

  const onReply = (r: string, href?: string) => {
    setReply(r);
    if (href) setTimeout(() => router.push(href), 280);
  };

  return (
    <Screen glows={glows.home} nav full>
      <div className="flex flex-col gap-4 px-6 pt-[54px] pb-6 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="type-caption text-t3">{date}</span>
            <h1 className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-forest">
              {greeting}, {name}
            </h1>
          </div>
          <IconButton icon="bell" label="Notifications" href="/notifications">
            <span className="absolute top-[11px] right-[12px] size-2 rounded-full border-[1.5px] border-white bg-lime-deep" />
          </IconButton>
        </div>

        {/* Evening brief */}
        <motion.section
          variants={riseIn}
          initial="hidden"
          animate="show"
          className="flex w-full flex-col gap-3.5 overflow-hidden rounded-[28px] border-[1.5px] border-white px-[18px] pt-[18px] pb-4 shadow-[0_18px_40px_-14px_rgba(77,153,38,0.18)]"
          style={{ background: "linear-gradient(134deg, #ddf5cc 0%, #f3fbec 39.29%, #fff4e4 71.43%)" }}
        >
          <div className="flex items-center gap-2.5">
            <Orb size={40} state="breathing" />
            <div className="flex flex-1 flex-col">
              <span className="type-label-m text-ink">Your evening brief</span>
              <span className="type-caption text-t3">from Evo · 6:02 PM</span>
            </div>
            <button type="button" aria-label="More" className="cursor-pointer text-t3">
              <Icon name="more" size={18} />
            </button>
          </div>
          <p className="text-[20px] leading-[1.1] font-medium tracking-[-0.5px] text-forest">
            Tonight might be hard to start — but you’ve already booked a 3-minute step at 6:45.
          </p>
          <div className="flex flex-col gap-2">
            {why.map((w) => (
              <div key={w.text} className="flex items-center gap-2.5">
                <span className={cn("flex size-[26px] items-center justify-center rounded-[9px]", w.tile, w.color)}>
                  <Icon name={w.icon} size={14} />
                </span>
                <span className="type-body-s text-t2">{w.text}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <SoftChip height={36} label="Plan my evening" selected={reply === null || reply === "plan"} onClick={() => onReply("plan", "/chat?checkedIn=1")} />
            <SoftChip height={36} label="Not up for it" selected={reply === "no"} onClick={() => onReply("no")} />
            <SoftChip height={36} label="Tell me more" selected={reply === "more"} onClick={() => onReply("more", "/insight")} />
          </div>
          {reply === "no" && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="type-body-s text-t2">
              That’s okay. I’ll keep the 6:45 step light — you can skip it with one tap.
            </motion.p>
          )}
        </motion.section>

        <Composer variant="brand" micTile placeholder="Tell Evo what’s on your mind…" href="/chat?checkedIn=1" />

        <SectionTitle title="Continue where you left off" />
        <motion.section
          variants={riseIn}
          initial="hidden"
          animate="show"
          custom={2}
          className="flex w-full flex-col gap-3 rounded-[26px] px-4 pt-4 pb-3.5"
          style={{ background: "linear-gradient(154deg, #33412e 0%, #151a13 71.43%)" }}
        >
          <div className="flex items-center gap-2.5">
            <Orb size={30} state="still" />
            <span className="flex-1 type-label-m text-white">Exam stress</span>
            <span className="type-caption text-lime">5:41 PM</span>
          </div>
          <p className="type-body-m text-white/85">
            “You’re not lazy. Starting just feels threatening right now. Want me to turn this into a small plan?”
          </p>
          <Pill label="Continue chat" variant="lime" height={42} className="self-start" href="/chat?checkedIn=1" />
        </motion.section>

        <SectionTitle title="Today with Evo" action="Edit" />
        <div className="flex flex-col">
          <TimelineItem
            time="6:45 PM"
            active
            icon="path"
            tile="bg-lime-soft"
            color="text-lime-deep"
            title="Brain dump · 3 min"
            meta="Booked — Evo will nudge you"
          >
            <Pill label="Start" height={36} className="pr-3.5 pl-4" href="/focus" />
            <AskEvo onClick={() => setAsk({ card: "Brain dump · 3 min", line: "Booked for 6:45 PM" })} />
          </TimelineItem>
          <TimelineItem time="8:00 PM" icon="sparkle" tile="bg-mint-soft" color="text-mint-text" title="Evening check-in" meta="10 seconds, tap-only">
            <AskEvo onClick={() => setAsk({ card: "Evening check-in", line: "8:00 PM · 10 seconds" })} />
          </TimelineItem>
          <TimelineItem time="10:30 PM" last suggested icon="moon" tile="bg-lavender-soft" color="text-lavender-text" title="Wind down" meta="Suggested — you slept late yesterday">
            <Pill label="Add" variant="glass" icon={null} height={36} className="px-4" />
            <AskEvo onClick={() => setAsk({ card: "Wind down", line: "Suggested for 10:30 PM" })} />
          </TimelineItem>
        </div>

        <SectionTitle title="Evo noticed" />
        <section className="flex w-full flex-col gap-3 rounded-3xl bg-gradient-to-r from-[#ffe7da] to-[#fff6e3] p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[11.33px] bg-peach-soft text-peach-text">
              <Icon name="cloud" size={17} />
            </span>
            <p className="type-label-m text-ink">You’ve skipped Maths 3 of the last 4 evenings. Try it before dinner instead?</p>
          </div>
          <div className="flex items-center gap-2">
            <Pill label="Try 6:45" icon={null} height={38} className="px-[18px]" href="/step-booked" />
            <AskEvo label="Why?" onClick={() => setAsk({ card: "Evo noticed", line: "Maths skipped 3 of 4 evenings" })} />
          </div>
        </section>

        <SectionTitle title="Previous chats" action="See all" onAction={() => router.push("/chats")} />
        <div className="glass flex flex-col rounded-[22px] px-3.5">
          {chats.map((c, i) => (
            <button
              key={c.title}
              type="button"
              onClick={() => router.push("/chat?checkedIn=1")}
              className={cn("flex cursor-pointer items-center gap-3 py-[11px] text-left", i < chats.length - 1 && "border-b border-line")}
            >
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", c.tile, c.color)}>
                <Icon name={c.icon} size={18} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-start justify-between">
                  <span className="type-label-m text-ink">{c.title}</span>
                  <span className="type-caption text-t3">{c.when}</span>
                </span>
                <span className="type-caption text-t3">{c.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <HomeWide />
      <AskEvoSheet context={ask} onClose={() => setAsk(null)} />
    </Screen>
  );
}

function TimelineItem({
  time,
  active,
  last,
  suggested,
  icon,
  tile,
  color,
  title,
  meta,
  children,
}: {
  time: string;
  active?: boolean;
  last?: boolean;
  suggested?: boolean;
  icon: IconName;
  tile: string;
  color: string;
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex w-full items-start gap-3", !last && "pb-2.5")}>
      <div className="flex w-14 shrink-0 flex-col items-center gap-1.5 self-stretch pt-3.5">
        <span className={cn("type-label-s whitespace-nowrap", active ? "text-lime-deep" : "text-t3")}>{time}</span>
        {!last && <span className="w-0.5 flex-1 bg-muted" />}
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-2.5 rounded-[20px] px-3.5 py-3",
          suggested ? "border-[1.2px] border-dashed border-line-strong" : "glass",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className={cn("flex size-[34px] shrink-0 items-center justify-center rounded-[11.33px]", tile, color)}>
            <Icon name={icon} size={17} />
          </span>
          <div className="flex min-w-0 flex-col gap-px">
            <span className="type-label-m text-ink">{title}</span>
            <span className="type-caption text-t3">{meta}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
