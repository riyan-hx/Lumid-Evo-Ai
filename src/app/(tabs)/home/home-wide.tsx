"use client";

import { motion, useAnimationControls } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import { IconButton } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { PlusBadge } from "@/components/ui/list";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { haptic, riseIn, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";
import { today } from "@/lib/time";

type Tile = { icon: IconName; tile: string; color: string };

const recent: (Tile & { title: string; meta: string; when: string })[] = [
  { icon: "mic", tile: "bg-lavender-soft", color: "text-lavender-text", title: "Voice · Malayalam", meta: "Just listen · 4 min", when: "1:10 PM" },
  { icon: "wind", tile: "bg-sky-soft", color: "text-sky-text", title: "Breathing, 5 rounds", meta: "Felt steadier after round 3", when: "Mon" },
  { icon: "chat", tile: "bg-peach-soft", color: "text-peach-text", title: "Just venting", meta: "Group project — felt left out", when: "Sun" },
  { icon: "pause", tile: "bg-sun-soft", color: "text-sun-text", title: "Unstuck ladder", meta: "Open to page 112 — done", when: "Sat" },
];

const week = [
  { label: "Steps started", value: "3/5", pct: 60, from: "#c9eeb0", to: "#62bf3b" },
  { label: "Calm minutes", value: "42 min", pct: 70, from: "#c6f3e1", to: "#2fbf7a" },
  { label: "Check-ins", value: "4/7", pct: 57, from: "#ffe7b3", to: "#f2b233" },
];

const shortcuts: (Tile & { title: string; meta: string; href: string })[] = [
  { icon: "pause", tile: "bg-peach-soft", color: "text-peach-text", title: "Unstuck ladder", meta: "Shrink a task you’re avoiding", href: "/ladder" },
  { icon: "wind", tile: "bg-mint-soft", color: "text-mint-text", title: "Calm space", meta: "Breathe for 1 minute", href: "/calm" },
  { icon: "mic", tile: "bg-lavender-soft", color: "text-lavender-text", title: "Voice", meta: "Talk in English or Malayalam", href: "/voice" },
  { icon: "user", tile: "bg-lime-soft", color: "text-lime-deep", title: "Session bridge", meta: "Prep for your next session", href: "/bridge" },
];

const starters = [
  { label: "I’m stuck on something", href: "/chat?checkedIn=1" },
  { label: "Just vent", href: "/chat?mode=venting" },
  { label: "Quick check-in", href: "/check-in" },
  { label: "Breathe", href: "/calm" },
];

/** 03 · Home, tablet + desktop (chat-first). Figma “Desktop Home — chat-first”. */
export function HomeWide() {
  const router = useRouter();
  const { name } = useApp();
  const { date } = today();

  return (
    <div className="mx-auto hidden w-full max-w-[1152px] flex-col gap-4 px-6 pt-6 pb-8 md:flex xl:pr-6 xl:pl-8">
      <header className="flex min-h-20 flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="type-body-s text-t3">{date}</span>
          <h1 className="text-[34px] leading-[1.06] font-medium tracking-[-1px] text-forest xl:text-[40px] xl:tracking-[-1.2px]">
            What’s on your mind, {name}?
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/chats");
            }}
            className="glass hidden h-[46px] w-[300px] items-center gap-2.5 rounded-[23px] px-4 transition-[border-color] focus-within:border-lime xl:flex"
          >
            <Icon name="target" size={18} className="text-t3" />
            <input aria-label="Search" placeholder="Search chats, plans, notes" className="min-w-0 flex-1 bg-transparent type-body-s text-ink outline-none placeholder:text-t3" />
          </form>
          <IconButton icon="bell" label="Notifications" href="/notifications" className="size-[46px]">
            <span className="absolute top-[11px] right-[12px] size-2 rounded-full border-[1.5px] border-white bg-lime-deep" />
          </IconButton>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <WideComposer />
          <ContinueCard />
        </div>
        <Card i={2} className="glass rounded-[28px] px-[18px] pt-[18px] pb-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="type-title-m text-ink">Previous chats</h2>
            <button type="button" onClick={() => router.push("/chats")} className="cursor-pointer type-label-s text-lime-deep hover:underline">
              See all
            </button>
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-6 xl:grid-cols-1">
            {recent.map((c) => (
              <button
                key={c.title}
                type="button"
                onClick={() => router.push("/chat?checkedIn=1")}
                className="group flex cursor-pointer items-center gap-3 rounded-2xl py-2 text-left"
              >
                <TileIcon t={c} size={34} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="type-label-m text-ink transition-colors group-hover:text-lime-deep">{c.title}</span>
                  <span className="truncate type-caption text-t3">{c.meta}</span>
                </span>
                <span className="self-start pt-0.5 type-caption text-t3">{c.when}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card i={3} className="glass flex min-h-[300px] flex-col gap-5 rounded-[28px] p-[22px]">
          <div className="flex items-center justify-between">
            <h2 className="type-title-m text-ink">This week</h2>
            <button type="button" onClick={() => router.push("/wins")} className="cursor-pointer type-label-s text-lime-deep hover:underline">
              See patterns
            </button>
          </div>
          {week.map((w, i) => (
            <div key={w.label} className="flex flex-col gap-2">
              <div className="flex items-end justify-between">
                <span className="type-label-m text-ink">{w.label}</span>
                <span className="text-[22px] leading-none font-medium tracking-[-0.44px] text-forest">{w.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-forest/7">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${w.from}, ${w.to})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${w.pct}%` }}
                  transition={{ ...spring.gentle, delay: 0.25 + i * 0.08 }}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card
          i={4}
          className="flex min-h-[300px] flex-col gap-3 rounded-[28px] border-[1.5px] border-white p-[22px] shadow-[0_18px_40px_-14px_rgba(240,138,93,0.25)]"
          style={{ background: "linear-gradient(160deg, #ffe7da 0%, #fff6e3 100%)" }}
        >
          <div className="flex items-center justify-between">
            <span className="type-label-s text-peach-text">TONIGHT · 7–9 PM</span>
            <PlusBadge />
          </div>
          <h2 className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-forest">Hard-to-start window</h2>
          <p className="type-body-s text-t2">Maths revision after dinner — skipped 3 of the last 4 times.</p>
          <div className="flex-1" />
          <Pill label="Book 3-min start at 6:45" height={48} className="self-start" href="/step-booked" />
        </Card>

        <Card i={5} className="glass flex flex-col rounded-[28px] p-[22px] md:col-span-2 xl:col-span-1 xl:min-h-[300px]">
          <span className="type-label-s text-lavender-text">Note from past you</span>
          <span className="mt-4 h-8 text-[40px] leading-none font-medium text-lime">“</span>
          <p className="mt-2 text-[22px] leading-[1.1] font-medium tracking-[-0.55px] text-forest">It was easier than I thought. Just give it three minutes.</p>
          <div className="min-h-4 flex-1" />
          <span className="type-caption text-t3">You, after your first brain dump · 24 Sep</span>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {shortcuts.map((s, i) => (
          <Card key={s.title} i={6 + i} className="rounded-[22px]">
            <button
              type="button"
              onClick={() => router.push(s.href)}
              className="glass group flex h-full w-full cursor-pointer items-center gap-3 rounded-[22px] p-3.5 text-left"
            >
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-[14.67px] transition-transform duration-200 group-hover:-rotate-6", s.tile, s.color)}>
                <Icon name={s.icon} size={20} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="type-label-m text-ink">{s.title}</span>
                <span className="truncate type-caption text-t3">{s.meta}</span>
              </span>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Rise-in on load, gentle lift on hover. */
function Card({ i, className, style, children }: { i: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <motion.section
      variants={riseIn}
      initial="hidden"
      animate="show"
      custom={i}
      whileHover={{ y: -3 }}
      transition={spring.default}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

function TileIcon({ t, size }: { t: Tile; size: number }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-xl", t.tile, t.color)} style={{ width: size, height: size }}>
      <Icon name={t.icon} size={size / 2} />
    </span>
  );
}

/** Primary composer: text, starter chips, mic, send. Enter sends to the chat. */
function WideComposer() {
  const router = useRouter();
  const [text, setText] = useState("");
  const arrow = useAnimationControls();

  const send = () => {
    const value = text.trim();
    haptic("light");
    arrow.start({ y: [0, -3, 0], transition: { duration: 0.3 } });
    router.push(value ? `/chat?checkedIn=1&q=${encodeURIComponent(value)}` : "/chat?checkedIn=1");
  };

  return (
    <motion.div
      variants={riseIn}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 rounded-[30px] border-[1.5px] border-lime bg-white pt-5 pr-3 pb-3 pl-[22px] shadow-[0_16px_36px_-10px_rgba(97,191,59,0.25)] transition-shadow duration-200 focus-within:shadow-[0_20px_44px_-10px_rgba(97,191,59,0.38)]"
    >
      <div className="flex items-start gap-3 pr-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          aria-label="Message Evo"
          placeholder="Type anything, or hold the mic to talk in English or Malayalam…"
          className="min-h-6 min-w-0 flex-1 resize-none bg-transparent type-body-l text-ink outline-none placeholder:text-t3"
        />
        <kbd className="hidden shrink-0 font-sans type-body-m text-t3 lg:block">⌘ + K</kbd>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {starters.map((s, i) => (
            <motion.button
              key={s.label}
              type="button"
              onClick={() => router.push(s.href)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ ...spring.snappy, delay: 0.1 + i * 0.04 }}
              className="h-[38px] cursor-pointer rounded-full bg-subtle px-3.5 type-body-m whitespace-nowrap text-t2 transition-colors hover:bg-lime-wash hover:text-forest"
            >
              {s.label}
            </motion.button>
          ))}
        </div>
        <motion.button
          type="button"
          aria-label="Hold to talk"
          onClick={() => router.push("/voice")}
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[22px] bg-subtle text-t2"
        >
          <Icon name="mic" size={20} />
        </motion.button>
        <motion.button
          type="button"
          aria-label="Send"
          onClick={send}
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}
          className="flex size-[52px] shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
          style={{ background: "var(--gradient-forest)" }}
        >
          <motion.span animate={arrow} className="flex">
            <Icon name="send" size={20} />
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function ContinueCard() {
  return (
    <motion.section
      variants={riseIn}
      initial="hidden"
      animate="show"
      custom={1}
      className="relative flex flex-col gap-4 overflow-hidden rounded-[28px] p-6 lg:flex-row lg:items-center lg:justify-between"
      style={{ background: "var(--gradient-forest)" }}
    >
      <div
        aria-hidden
        className="absolute top-[-110px] left-[60%] h-[260px] w-[320px] rounded-[50%] bg-lime opacity-50 blur-[35px]"
      />
      <div className="relative flex max-w-[470px] flex-col gap-2.5">
        <span className="type-label-s text-lime">CONTINUE WHERE YOU LEFT OFF · EXAM STRESS · 5:41 PM</span>
        <p className="text-[20px] leading-[1.15] font-medium tracking-[-0.5px] text-white">
          “You’re not lazy. Starting just feels threatening right now. Want me to turn this into a small plan?”
        </p>
      </div>
      <Pill label="Continue chat" variant="lime" height={48} className="relative shrink-0 self-start lg:self-center" href="/chat?checkedIn=1" />
    </motion.section>
  );
}
