"use client";

import { motion } from "motion/react";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export type Insight = {
  headline: string;
  happening: string;
  why: string;
  need: string;
  tags: string[];
  basedOn: string;
};

const tagDot: Record<string, string> = {
  avoidance: "#8b6cf0",
  "exam stress": "#f08a5d",
  overwhelm: "#4c8df0",
  tiredness: "#62bf3b",
};

const rows: { key: "happening" | "why" | "need"; title: string; icon: IconName; tile: string; color: string }[] = [
  { key: "happening", title: "What’s happening", icon: "cloud", tile: "bg-mint-soft", color: "text-mint-text" },
  { key: "why", title: "Why it happens", icon: "brain", tile: "bg-lavender-soft", color: "text-lavender-text" },
  { key: "need", title: "What you need", icon: "heart", tile: "bg-peach-soft", color: "text-peach-text" },
];

export function Tags({ tags, delay = 0 }: { tags: string[]; delay?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t, i) => (
        <motion.span
          key={t}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.snappy, delay: delay + i * 0.04 }}
          className="flex items-center gap-1.5 rounded-full bg-subtle py-1.5 pr-3 pl-2.5 type-label-s text-t2"
        >
          <span className="size-1.5 rounded-full" style={{ background: tagDot[t] ?? "#6b7571" }} />
          {t}
        </motion.span>
      ))}
    </div>
  );
}

/** Two tilted glass sheets behind an insight card. */
function Stack({ variant }: { variant: "chat" | "focus" }) {
  return variant === "chat" ? (
    <>
      <div className="absolute top-[18px] left-[22px] h-[calc(100%-38px)] w-[325px] rotate-[-2.2deg] rounded-[30px] border border-white bg-white/60" />
      <div className="absolute top-[42px] left-[8px] h-[calc(100%-38px)] w-[310px] rotate-3 rounded-[30px] border border-white bg-white/45" />
    </>
  ) : (
    <>
      <div className="absolute top-[33px] left-[12px] h-[236px] w-[305px] rotate-[3.5deg] rounded-[32px] border border-white bg-white/45 backdrop-blur-[10px]" />
      <div className="absolute top-[7px] left-[17px] h-[246px] w-[320px] rotate-[-2.5deg] rounded-[32px] border border-white bg-white/60 backdrop-blur-[10px]" />
    </>
  );
}

/**
 * Lumid Insight. `full` shows What’s happening / Why / What you need (chat, 06);
 * `focus` is the headline-only moment used on 04.
 */
export function InsightCard({
  insight,
  variant = "chat",
  confirmed,
  saved,
  onSave,
}: {
  insight: Insight;
  variant?: "chat" | "focus";
  confirmed?: boolean;
  saved?: boolean;
  onSave?: () => void;
}) {
  const chat = variant === "chat";
  return (
    <div className={cn("relative w-full", chat ? "pb-[38px]" : "pb-6")}>
      <Stack variant={variant} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: confirmed
            ? [
                "0 24px 44px -14px rgba(31,71,20,0.14), 0 0 0 0 rgba(136,217,95,0)",
                "0 24px 44px -14px rgba(31,71,20,0.14), 0 0 0 3px rgba(136,217,95,0.9)",
                "0 24px 44px -14px rgba(31,71,20,0.14), 0 0 0 0 rgba(136,217,95,0)",
              ]
            : "0 24px 44px -14px rgba(31,71,20,0.14)",
        }}
        transition={{ ...spring.gentle, boxShadow: { duration: 0.6 } }}
        className={cn(
          "relative flex w-full flex-col gap-4 overflow-hidden bg-white",
          chat ? "rounded-[30px] px-[22px] py-5" : "rounded-[32px] px-6 py-[22px]",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-[14px] bg-lime-soft text-lime-deep">
              <Icon name="sparkle" size={16} />
            </span>
            <span className="type-label-m text-lime-deep">Lumid Insight</span>
          </div>
          {chat ? (
            <span className="type-caption text-t3">Based on today</span>
          ) : (
            <motion.button
              type="button"
              aria-label={saved ? "Saved" : "Save insight"}
              aria-pressed={saved}
              onClick={onSave}
              whileTap={{ scale: 0.88 }}
              transition={spring.snappy}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-2xl transition-colors",
                saved ? "bg-lime-deep text-white" : "bg-lime-wash text-lime-deep",
              )}
            >
              <Icon name="heart" size={16} />
            </motion.button>
          )}
        </div>

        <p
          className={cn(
            "font-medium text-forest",
            chat ? "text-[24px] leading-[1.08] tracking-[-0.72px]" : "text-[28px] leading-[1.06] tracking-[-0.84px] whitespace-pre-line",
          )}
        >
          {chat ? insight.headline : insight.headline.replace(". ", ".\n")}
        </p>

        {!chat && <p className="-mt-1 type-caption whitespace-pre text-t3">{insight.basedOn}</p>}

        {chat &&
          rows.map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.snappy, delay: 0.15 + i * 0.06 }}
              className="flex w-full items-start gap-3 rounded-[18px] bg-subtle py-3 pr-3.5 pl-3"
            >
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[11px]", r.tile, r.color)}>
                <Icon name={r.icon} size={17} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 leading-[18px]">
                <p className="type-label-m text-ink">{r.title}</p>
                <p className="type-body-s text-t2">{insight[r.key]}</p>
              </div>
            </motion.div>
          ))}

        <Tags tags={insight.tags} delay={chat ? 0.36 : 0.15} />
      </motion.div>
    </div>
  );
}
