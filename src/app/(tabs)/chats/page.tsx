"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { glows } from "@/components/ui/backdrop";
import { SoftChip } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

type Kind = "Plans" | "Insights" | "Voice";
type Chat = { title: string; meta: string; when: string; group: "Today" | "This week"; icon: IconName; tile: string; color: string; kind: Kind[] };

const chats: Chat[] = [
  { title: "Exam stress", meta: "You’re not lazy. Starting feels threatening…", when: "5:41 PM", group: "Today", icon: "sparkle", tile: "bg-lime-soft", color: "text-lime-deep", kind: ["Insights", "Plans"] },
  { title: "Voice · Malayalam", meta: "Just listen · 4 min", when: "1:10 PM", group: "Today", icon: "mic", tile: "bg-lavender-soft", color: "text-lavender-text", kind: ["Voice"] },
  { title: "Breathing, 5 rounds", meta: "You felt steadier after round 3", when: "Mon", group: "This week", icon: "wind", tile: "bg-sky-soft", color: "text-sky-text", kind: [] },
  { title: "Just venting", meta: "Group project — felt left out", when: "Sun", group: "This week", icon: "chat", tile: "bg-peach-soft", color: "text-peach-text", kind: [] },
];

const filters = ["All", "Plans", "Insights", "Voice"] as const;

/** 21 · Chats */
export default function Chats() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");

  const shown = useMemo(
    () =>
      chats.filter(
        (c) =>
          (filter === "All" || c.kind.includes(filter)) &&
          (!q || `${c.title} ${c.meta}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [filter, q],
  );
  const groups = (["Today", "This week"] as const).map((g) => ({ g, items: shown.filter((c) => c.group === g) })).filter((x) => x.items.length);

  return (
    <Screen glows={glows.onboarding} nav>
      <div className="flex flex-col gap-3.5 px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[34px] leading-[1.06] font-medium tracking-[-1.02px] text-forest">Chats</h1>
          <motion.button
            type="button"
            aria-label="New chat"
            onClick={() => router.push("/chat")}
            whileTap={{ scale: 0.9 }}
            transition={spring.snappy}
            className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] text-white"
            style={{ background: "linear-gradient(135deg, #33412e 0%, #151a13 71.43%)" }}
          >
            <Icon name="plus" size={20} />
          </motion.button>
        </div>

        <label className="glass flex h-12 w-full items-center gap-2.5 rounded-2xl px-4 transition-[border-color] focus-within:border-lime">
          <Icon name="target" size={18} className="text-t3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search chats, plans, insights"
            aria-label="Search chats"
            className="min-w-0 flex-1 bg-transparent type-body-m text-ink outline-none placeholder:text-t3"
          />
        </label>

        <div className="flex gap-1.5">
          {filters.map((f) => (
            <SoftChip key={f} label={f} height={36} selected={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>

        <motion.button
          type="button"
          onClick={() => router.push("/step-booked")}
          whileTap={{ scale: 0.98 }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-[22px] py-3 pr-3.5 pl-3 text-left"
          style={{ background: "linear-gradient(169deg, #33412e 0%, #151a13 71.43%)" }}
        >
          <span className="flex size-10 items-center justify-center rounded-[14px] bg-lime text-forest">
            <Icon name="path" size={19} />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="type-label-m text-white">Exam reset plan</span>
            <span className="type-caption text-lime">Step 1 of 4 · Brain dump · 6:45 PM</span>
          </span>
          <Icon name="chevron-right" size={18} className="text-white" />
        </motion.button>

        <AnimatePresence mode="popLayout">
          {groups.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="type-title-m text-ink">{q ? "Nothing matches that yet" : "Your chats will live here"}</p>
              <Pill label="Start a chat" height={46} href="/chat" />
            </motion.div>
          ) : (
            groups.map(({ g, items }) => (
              <motion.div key={g} layout className="flex flex-col gap-3.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="type-label-s text-t3">{g}</p>
                <div className="glass flex flex-col rounded-[22px] px-3.5">
                  {items.map((c, i) => (
                    <motion.button
                      key={c.title}
                      layout
                      type="button"
                      onClick={() => router.push("/chat?checkedIn=1")}
                      className={cn("flex w-full cursor-pointer items-center gap-3 py-3 text-left", i < items.length - 1 && "border-b border-line")}
                    >
                      <span className={cn("flex size-[38px] shrink-0 items-center justify-center rounded-[13px]", c.tile, c.color)}>
                        <Icon name={c.icon} size={18} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex justify-between">
                          <span className="type-label-m text-ink">{c.title}</span>
                          <span className="type-caption text-t3">{c.when}</span>
                        </span>
                        <span className="truncate type-caption text-t3">{c.meta}</span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
