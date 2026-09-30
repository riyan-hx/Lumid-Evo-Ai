"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BackButton, IconButton } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";

/* ---------- Header: back · identity · crisis ---------- */

export function ChatHeader({ subtitle = "Here with you", status = true, still }: { subtitle?: string; status?: boolean; still?: boolean }) {
  return (
    <div className="relative flex h-11 items-center justify-between px-5">
      <BackButton />
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white bg-white/75 py-1.5 pr-3.5 pl-1.5 shadow-[0_10px_26px_-8px_rgba(26,64,20,0.07)] backdrop-blur-[12px]">
        <Orb size={32} state={still ? "still" : "breathing"} />
        <div className="flex flex-col">
          <span className="type-label-m text-ink">Evo</span>
          <span className="flex items-center gap-[5px] type-caption whitespace-nowrap text-t3">
            {status && <span className="size-1.5 rounded-full bg-lime" />}
            {subtitle}
          </span>
        </div>
      </div>
      <IconButton icon="lifebuoy" label="Crisis support" href="/crisis" />
    </div>
  );
}

/** Tablet/desktop header: identity left, voice · crisis · more on the right. */
export function WideChatHeader({ title = "Exam stress", subtitle = "Evo is here with you" }: { title?: string; subtitle?: string }) {
  return (
    <div className="flex h-[72px] items-center gap-3">
      <Orb size={40} state="breathing" />
      <div className="flex flex-1 flex-col">
        <span className="type-title-m text-ink">{title}</span>
        <span className="flex items-center gap-[5px] type-caption text-t3">
          <span className="size-1.5 rounded-full bg-lime" />
          {subtitle}
        </span>
      </div>
      <IconButton icon="mic" label="Voice" href="/voice" className="size-10" />
      <IconButton icon="lifebuoy" label="Crisis support" href="/crisis" className="size-10" />
      <IconButton icon="more" label="All chats" href="/chats" className="size-10" />
    </div>
  );
}

/* ---------- Bubbles and Evo text ---------- */

export function UserBubble({ children, still }: { children: ReactNode; still?: boolean }) {
  return (
    <motion.div
      layout
      initial={still ? false : { opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring.default}
      style={{ originX: 1, originY: 1 }}
      className="flex w-full justify-end"
    >
      <div
        className="max-w-[75%] rounded-t-[22px] rounded-br-[8px] rounded-bl-[22px] px-[18px] py-3 type-body-m text-white shadow-[0_10px_22px_-10px_rgba(20,26,18,0.18)]"
        style={{ background: "linear-gradient(160deg, #33412e 0%, #151a13 71.43%)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

/** Evo message: words fade in as they “stream” (120 ms each, no cursor). */
export function EvoText({
  text,
  size = "body",
  onDone,
  className,
}: {
  text: string;
  size?: "body" | "headline";
  onDone?: () => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const per = reduce ? 0 : 0.035;

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), words.length * per * 1000 + 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per message
  }, [text]);

  return (
    <p
      className={cn(
        size === "headline"
          ? "text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-forest"
          : "type-body-l text-ink",
        className,
      )}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, delay: i * per }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </p>
  );
}

export function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex h-7 w-[52px] items-center justify-center gap-1 rounded-full border border-white bg-white/90 shadow-[0_6px_14px_-6px_rgba(26,64,20,0.12)]"
      aria-label="Evo is typing"
      role="status"
    >
      {["#3f8f22", "#88d95f", "#c9eeb0"].map((c, i) => (
        <motion.span
          key={c}
          style={{ background: c }}
          className="size-1.5 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </motion.div>
  );
}

/* ---------- Tap-first choices ---------- */

export type Choice = {
  label: string;
  hint?: string;
  icon: IconName;
  tile: string;
  color: string;
};

/** Big 2-column tile (“How are you arriving?”). */
export function MoodTile({
  choice,
  selected,
  dimmed,
  index,
  onPick,
}: {
  choice: Choice;
  selected?: boolean;
  dimmed?: boolean;
  index: number;
  onPick: () => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      disabled={dimmed || selected}
      onClick={() => {
        haptic("selection");
        onPick();
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, scale: selected ? [1, 1.04, 1] : 1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ ...spring.snappy, delay: selected || dimmed ? 0 : index * 0.04, scale: { duration: 0.3, ease: "easeOut" } }}
      className={cn(
        "flex cursor-pointer flex-col items-start gap-3.5 rounded-3xl p-4 text-left disabled:cursor-default",
        selected
          ? "border-[1.5px] border-lime bg-lime-soft shadow-[0_10px_24px_-8px_rgba(135,217,94,0.4)]"
          : "border border-white bg-white/75 shadow-[0_10px_26px_-8px_rgba(26,64,20,0.07)] backdrop-blur-[12px]",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span
          className={cn(
            "flex size-[38px] items-center justify-center rounded-[13px]",
            selected ? "bg-white/90" : choice.tile,
            choice.color,
          )}
        >
          <Icon name={choice.icon} size={19} />
        </span>
        {selected && (
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={spring.snappy}
            className="flex size-6 items-center justify-center rounded-xl bg-forest text-white"
          >
            <Icon name="check" size={14} />
          </motion.span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="type-label-m whitespace-nowrap text-ink">{choice.label}</span>
        {choice.hint && <span className="type-caption whitespace-nowrap text-t3">{choice.hint}</span>}
      </div>
    </motion.button>
  );
}

/** Full-width option row with icon tile and chevron. */
export function OptionRow({
  choice,
  selected,
  dimmed,
  primary,
  index,
  onPick,
}: {
  choice: Choice;
  selected?: boolean;
  dimmed?: boolean;
  primary?: boolean;
  index: number;
  onPick: () => void;
}) {
  return (
    <motion.button
      type="button"
      disabled={dimmed || selected}
      onClick={() => {
        haptic("selection");
        onPick();
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, scale: selected ? [1, 1.02, 1] : 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ ...spring.snappy, delay: selected || dimmed ? 0 : index * 0.04, scale: { duration: 0.3, ease: "easeOut" } }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-[22px] py-2 pr-4 pl-2 text-left disabled:cursor-default",
        primary
          ? "text-white shadow-[0_14px_28px_-10px_rgba(20,26,18,0.25)]"
          : selected
            ? "border-[1.5px] border-lime bg-lime-soft"
            : "border border-white bg-white/75 shadow-[0_10px_26px_-8px_rgba(26,64,20,0.07)] backdrop-blur-[12px]",
      )}
      style={primary ? { background: "linear-gradient(170deg, #33412e 0%, #151a13 71.43%)" } : undefined}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[14px]",
          primary ? "bg-lime text-forest" : selected ? "bg-white" : choice.tile,
          !primary && choice.color,
        )}
      >
        <Icon name={choice.icon} size={19} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className={cn("type-label-m", primary ? "text-white" : "text-ink")}>{choice.label}</span>
        {choice.hint && <span className={cn("type-caption", primary ? "text-lime" : "text-t3")}>{choice.hint}</span>}
      </span>
      {selected ? (
        <span className="flex size-6 items-center justify-center rounded-xl bg-forest text-white">
          <Icon name="check" size={14} />
        </span>
      ) : (
        <Icon name={primary ? "arrow-right" : "chevron-right"} size={18} className={primary ? "text-white" : "text-t3"} />
      )}
    </motion.button>
  );
}

export function GhostAction({ icon, label, onClick }: { icon: IconName; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex cursor-pointer items-center gap-1.5 pt-1.5 pb-0.5 pl-2.5 text-t3">
      <Icon name={icon} size={16} />
      <span className="type-label-s">{label}</span>
    </button>
  );
}

export function DatePill({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full justify-center">
      <span className="rounded-full border border-white bg-white/60 px-3 py-[5px] type-caption text-t3 shadow-[0_10px_26px_-8px_rgba(26,64,20,0.07)] backdrop-blur-[12px]">
        {children}
      </span>
    </div>
  );
}

export function PrivacyNote() {
  return (
    <div className="flex items-center gap-1.5 text-t3">
      <Icon name="lock" size={12} />
      <span className="type-caption">Private by default. Nothing is shared without your OK.</span>
    </div>
  );
}

export function useGo() {
  const router = useRouter();
  return (href: string, delay = 250) => setTimeout(() => router.push(href), delay);
}

export function useMounted() {
  const [m, setM] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag
  useEffect(() => setM(true), []);
  return m;
}
