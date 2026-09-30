"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type Glow } from "@/components/ui/backdrop";
import { BackButton, SoftChip, Toggle } from "@/components/ui/controls";
import { Icon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { useLastShared } from "@/lib/bridge";
import { cn } from "@/lib/cn";
import { ease, haptic, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

/** Figma 94:3889 — lime top-left, lavender top-right, lime bottom-left. */
const bridgeGlows: Glow[] = [
  { x: -100, y: -120, w: 380, h: 320, color: "#a3e27d", opacity: 0.55, blur: 110 },
  { x: 220, y: -40, w: 260, h: 240, color: "#e9e3ff", opacity: 0.7, blur: 90 },
  { x: -80, y: 600, w: 300, h: 280, color: "#c9eeb0", opacity: 0.55, blur: 110 },
];

const WEEK = [
  { dot: "bg-lime", text: "Started 7 avoided tasks — most after an evening brain dump" },
  { dot: "bg-peach-solid", text: "Froze before Maths 3 times; felt “not good enough”" },
  { dot: "bg-[#8b6cf0]", text: "Slept after 1 AM on 4 nights" },
];

const TOPICS = ["Freezing before Maths", "Not good enough", "Late nights", "What helped"];

const SHARES = [
  { key: "mood", label: "Mood & energy trend" },
  { key: "steps", label: "Steps and wins" },
  { key: "summary", label: "Evo’s weekly summary" },
] as const;

/** 12 · Session bridge — choose what to bring to the next session. Nothing leaves without a tap. */
export default function SessionBridge() {
  const app = useApp();
  const psych = app.psychologist;
  const { record, save, clear } = useLastShared();
  const [topics, setTopics] = useState<string[]>(TOPICS.slice(0, 2));
  const [privateChats, setPrivateChats] = useState(false);
  const [askPrivate, setAskPrivate] = useState(false);

  if (!psych) {
    return (
      <Screen glows={bridgeGlows} app>
        <div className="flex flex-1 flex-col gap-3 px-6 pt-[54px] pb-6">
          <Header title="Before your session" />
          <div className="glass mt-2 flex flex-col items-start gap-3 rounded-3xl px-5 py-5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-lime-soft text-lime-deep">
              <Icon name="user" size={20} />
            </span>
            <p className="type-title-m text-ink">No psychologist connected</p>
            <p className="type-body-s text-t2">
              The session bridge helps you bring your week into a session — only if you already see a psychologist. Evo works fully on its own
              either way.
            </p>
            <p className="flex items-center gap-1 type-caption text-t3">
              <Icon name="lock" size={11} /> Nothing is shared until you connect and choose.
            </p>
          </div>
          <div className="mt-auto pt-6">
            <Pill label="Connect your psychologist" className="w-full" href="/settings/psychologist" />
          </div>
        </div>
      </Screen>
    );
  }

  const first = psych.name.replace(/^Dr\.\s*/, "").split(" ")[0];
  const shares = app.shares;
  const anything = topics.length > 0 || privateChats || Object.values(shares).some(Boolean);

  // Shared state holds while the selection still matches what was sent.
  const shared =
    !!record &&
    record.with === psych.code &&
    record.privateChats === privateChats &&
    JSON.stringify(record.shares) === JSON.stringify(shares) &&
    JSON.stringify([...record.topics].sort()) === JSON.stringify([...topics].sort());

  const toggleTopic = (t: string) => setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const share = () => {
    save({ with: psych.code, topics, shares, privateChats });
    haptic("success");
  };

  const takeBack = () => {
    clear();
    setPrivateChats(false);
    haptic("light");
  };

  return (
    <Screen glows={bridgeGlows} app>
      <div className="flex flex-1 flex-col gap-3 px-6 pt-[54px] pb-6">
        <Header title="Before Thursday" />

        {/* Psychologist */}
        <div className="relative flex items-center gap-3.5 overflow-hidden rounded-[26px] py-5 pr-4 pl-[18px]" style={{ background: "var(--gradient-forest)" }}>
          <span aria-hidden className="pointer-events-none absolute -top-[60px] right-[-37px] size-40 rounded-full bg-lime/35 blur-[40px]" />
          <span className="relative flex size-[52px] shrink-0 items-center justify-center rounded-[26px] bg-lime-soft type-label-m text-forest">
            {psych.initials}
          </span>
          <span className="relative flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate type-title-m text-white">{psych.name}</span>
            <span className="truncate type-body-s text-lime">Thu, 5:00 PM · Google Meet</span>
          </span>
          <span className="relative shrink-0 rounded-full bg-white/12 px-3 py-1.5 type-label-s text-white">in 2 days</span>
        </div>

        {/* Week in 30 seconds */}
        <div className="glass flex flex-col gap-2 rounded-3xl px-5 py-3.5">
          <p className="flex items-center gap-2 type-label-m text-lime-deep">
            <Icon name="sparkle" size={16} />
            Your week in 30 seconds
          </p>
          {WEEK.map((p) => (
            <div key={p.text} className="flex items-start gap-2.5">
              <span className="flex h-[18px] w-2 shrink-0 items-center">
                <span className={cn("size-2 rounded-full", p.dot)} />
              </span>
              <span className="flex-1 type-body-s text-t2">{p.text}</span>
            </div>
          ))}
        </div>

        <p className="type-title-m text-ink">Want to bring these up?</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <SoftChip key={t} label={t} height={36} selected={topics.includes(t)} onClick={() => toggleTopic(t)} className="h-[38px]!" />
          ))}
        </div>

        {/* Sharing */}
        <div className="glass flex flex-col rounded-3xl px-[18px] py-1.5">
          {SHARES.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5 border-b border-line py-[9px]">
              <span className="min-w-0 flex-1 type-label-m text-ink">{s.label}</span>
              <Toggle label={s.label} on={shares[s.key]} onChange={(v) => app.update({ shares: { ...shares, [s.key]: v } })} />
            </div>
          ))}
          <div className="flex items-center gap-2.5 py-[9px]">
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="type-label-m text-ink">Your private chats</span>
              <span className="flex items-center gap-1 type-caption text-t3">
                <Icon name="lock" size={11} />
                {privateChats ? "This session only" : "Never shared unless you choose"}
              </span>
            </span>
            <Toggle label="Your private chats" on={privateChats} onChange={(v) => (v ? setAskPrivate(true) : setPrivateChats(false))} />
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2.5 pt-6">
          <AnimatePresence mode="wait" initial={false}>
            {shared ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={ease.out}
                role="status"
                className="flex min-h-[58px] w-full items-center gap-3 rounded-full border border-lime bg-lime-soft py-2 pr-5 pl-2"
              >
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={spring.snappy}
                  className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-forest"
                  style={{ background: "var(--gradient-lime)" }}
                >
                  <Icon name="check" size={20} />
                </motion.span>
                <span className="min-w-0 flex-1 type-label-m text-forest">Shared. You can take it back anytime.</span>
                <motion.button
                  type="button"
                  onClick={takeBack}
                  whileTap={{ scale: 0.96 }}
                  transition={spring.snappy}
                  className="shrink-0 cursor-pointer type-label-s text-lime-deep underline underline-offset-2"
                >
                  Take it back
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="cta" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={ease.out} className="w-full">
                <Pill
                  label={anything ? (record?.with === psych.code ? `Update what Dr. ${first} sees` : `Share with Dr. ${first}`) : "Choose something to share"}
                  className="w-full"
                  disabled={!anything}
                  onClick={share}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <p className="type-caption text-t3">You can change or take this back anytime.</p>
        </div>
      </div>

      <Sheet open={askPrivate} onClose={() => setAskPrivate(false)} label="Share private chats">
        <div className="flex flex-col gap-3.5 px-1 pb-2">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-lime-soft text-lime-deep">
            <Icon name="lock" size={20} />
          </span>
          <h2 className="text-[24px] leading-[1.1] font-medium tracking-[-0.6px] text-ink">Your private chats stay private</h2>
          <p className="type-body-m text-t2">
            Chats with Evo are never shared automatically — not with Dr. {first}, not with anyone. If you want to, you can share them for this
            session only. It won’t carry over, and you can take it back anytime.
          </p>
          <Pill
            label="Share for this session only"
            variant="lime"
            icon="check"
            className="w-full"
            onClick={() => {
              setPrivateChats(true);
              setAskPrivate(false);
            }}
          />
          <motion.button
            type="button"
            onClick={() => setAskPrivate(false)}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer py-2 type-label-m text-t1"
          >
            Keep them private
          </motion.button>
        </div>
      </Sheet>
    </Screen>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <BackButton />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="type-label-s text-lime-deep">Session bridge</p>
        <h1 className="truncate text-[30px] leading-[1.06] font-medium tracking-[-0.9px] text-forest">{title}</h1>
      </div>
    </div>
  );
}
