"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { BackButton, IconButton, SoftChip } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { ease, haptic, spring } from "@/lib/motion";
import { useApp } from "@/lib/store";

type Item = { id: string; icon: IconName; tile: string; color: string; title: string; body: string; time: string; href: string; today?: boolean };

const ITEMS: Item[] = [
  { id: "brief", icon: "sparkle", tile: "bg-lavender-subtle", color: "text-lavender-text", title: "Your evening brief is ready", body: "Tonight might be hard to start — you already booked a 3-minute step at 6:45.", time: "6:02 PM", href: "/home", today: true },
  { id: "forecast", icon: "cloud", tile: "bg-peach-subtle", color: "text-peach-text", title: "Heads-up for tonight", body: "7–9 PM has been your hard-to-start window this week.", time: "Mon", href: "/forecast" },
  { id: "cameback", icon: "heart", tile: "bg-blush-subtle", color: "text-blush-text", title: "You came back after a missed day", body: "That counts. Want to pick one small step?", time: "Sun", href: "/chat" },
  { id: "report", icon: "target", tile: "bg-sky-subtle", color: "text-sky-text", title: "Your September report is ready", body: "See when starting is hardest and what helps.", time: "Sat", href: "/wins" },
];

/** 25 · Notifications — upcoming step with snooze, today / earlier, unread dots, quiet hours. */
export default function Notifications() {
  const app = useApp();
  const router = useRouter();
  const [seenAt] = useState(() => app.notificationsSeenAt ?? 0);
  const [now] = useState(() => Date.now());
  const snoozed = (app.snoozedUntil ?? 0) > now;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const unread = seenAt === 0;

  // Everything counts as read once you leave the screen.
  const { update } = app;
  useEffect(() => () => update({ notificationsSeenAt: Date.now() }), [update]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const snooze = () => {
    haptic("light");
    update({ snoozedUntil: Date.now() + 10 * 60 * 1000 });
    setToast("Moved to 6:55 PM. Evo will nudge you then.");
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const Card = ({ n, i }: { n: Item; i: number }) => (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.snappy, delay: Math.min(i, 6) * 0.04 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => router.push(n.href)}
      className="glass flex w-full cursor-pointer items-start gap-3 rounded-[22px] px-4 py-3.5 text-left"
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", n.tile, n.color)}>
        <Icon name={n.icon} size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="flex items-center gap-1.5">
          <span className="flex-1 type-label-m text-t1">{n.title}</span>
          {unread && n.today && <span className="size-2 rounded-full bg-lime" aria-label="Unread" />}
          <span className="shrink-0 type-caption text-t3">{n.time}</span>
        </span>
        <span className="type-body-s text-t2">{n.body}</span>
      </span>
    </motion.button>
  );

  return (
    <Screen glows={glows.onboarding} app>
      <div className="flex flex-col gap-3.5 px-6 pt-[54px] pb-8">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="flex-1 text-[30px] leading-[1.08] font-medium tracking-[-0.9px] text-ink">Notifications</h1>
          <IconButton icon="settings" label="Reminder settings" href="/reminders" />
        </div>

        <p className="type-label-s text-t3">Today</p>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.snappy} className="glass flex items-start gap-3 rounded-[22px] px-4 py-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint-subtle text-mint-text">
            <Icon name="clock" size={18} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="flex items-center gap-1.5">
              <span className="flex-1 type-label-m text-t1">{snoozed ? "Brain dump moved to 6:55" : "Brain dump starts in 5 min"}</span>
              {unread && <span className="size-2 rounded-full bg-lime" aria-label="Unread" />}
              <span className="shrink-0 type-caption text-t3">6:40 PM</span>
            </span>
            <span className="type-body-s text-t2">3 minutes · Exam reset, step 1 of 4</span>
            <span className="mt-1 flex gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push("/focus")}
                className="flex h-11 cursor-pointer items-center rounded-full bg-forest px-[18px] type-label-m text-white"
              >
                Start
              </motion.button>
              <SoftChip label={snoozed ? "Snoozed" : "10 min later"} selected={snoozed} onClick={snooze} />
            </span>
          </span>
        </motion.div>
        {ITEMS.filter((n) => n.today).map((n, i) => (
          <Card key={n.id} n={n} i={i + 1} />
        ))}

        <p className="type-label-s text-t3">Earlier</p>
        {ITEMS.filter((n) => !n.today).map((n, i) => (
          <Card key={n.id} n={n} i={i + 2} />
        ))}

        <button type="button" onClick={() => router.push("/reminders")} className="flex cursor-pointer items-center gap-2 text-left type-caption text-t3">
          <Icon name="moon" size={14} />
          Quiet hours 11 PM – 7 AM · at most 3 nudges a day
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={ease.out}
            className="fixed inset-x-0 bottom-[max(24px,env(safe-area-inset-bottom))] z-40 mx-auto w-[min(345px,calc(100%-32px))] rounded-2xl bg-forest px-4 py-3 type-label-m text-white shadow-[0_14px_28px_-10px_rgba(20,26,18,0.4)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
