"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ease, haptic, spring } from "@/lib/motion";
import { Icon, type IconName } from "./icons";
import { Orb } from "./orb";

/* ---------- Soft Chip (reply chip) ---------- */

type ChipProps = {
  label: ReactNode;
  selected?: boolean;
  height?: 36 | 40 | 44;
  onClick?: () => void;
  className?: string;
};

export function SoftChip({ label, selected, height = 44, onClick, className }: ChipProps) {
  return (
    <motion.button
      type="button"
      onClick={() => {
        haptic("selection");
        onClick?.();
      }}
      whileTap={{ scale: 0.96 }}
      animate={selected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      aria-pressed={selected}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center rounded-full type-label-m whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-[160ms] ease-(--ease-out-evo)",
        height === 44 ? "h-11 px-[18px]" : height === 40 ? "h-10 px-3.5" : "h-9 px-3.5",
        selected
          ? "border-[1.5px] border-lime bg-lime-soft text-forest shadow-[0_6px_18px_rgba(135,217,94,0.45)]"
          : "border border-white bg-white/70 text-t3 backdrop-blur-[8px]",
        className,
      )}
    >
      {label}
    </motion.button>
  );
}

/* ---------- Ask Evo ---------- */

export function AskEvo({
  label = "Ask Evo",
  surface = "light",
  onClick,
}: {
  label?: string;
  surface?: "light" | "dark";
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={spring.snappy}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border py-1 pr-3 pl-1 type-label-s whitespace-nowrap",
        surface === "light" ? "border-line-brand bg-white/90 text-forest" : "border-white/20 bg-white/12 text-white",
      )}
    >
      <Orb size={22} state="still" />
      {label}
    </motion.button>
  );
}

/* ---------- 44×44 glass icon button (Back, Bell, Crisis) ---------- */

type IconButtonProps = {
  icon: IconName;
  label: string;
  onClick?: () => void;
  href?: string;
  dark?: boolean;
  className?: string;
  children?: ReactNode;
};

export function IconButton({ icon, label, onClick, href, dark, className, children }: IconButtonProps) {
  const router = useRouter();
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={() => (onClick ? onClick() : href && router.push(href))}
      whileTap={{ scale: 0.92 }}
      transition={spring.snappy}
      className={cn(
        "relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[22px] border backdrop-blur-[12px]",
        dark
          ? "border-white/15 bg-white/10 text-white/90"
          : "border-white bg-white/78 text-ink drop-shadow-[0_10px_13px_rgba(26,64,20,0.07)]",
        className,
      )}
    >
      <Icon name={icon} size={20} />
      {children}
    </motion.button>
  );
}

export function BackButton({ dark, href, className }: { dark?: boolean; href?: string; className?: string }) {
  const router = useRouter();
  return (
    <IconButton
      icon="chevron-left"
      label="Back"
      dark={dark}
      className={className}
      onClick={() => (href ? router.push(href) : router.back())}
    />
  );
}

/* ---------- Toggle ---------- */

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => {
        haptic("light");
        onChange(!on);
      }}
      className={cn(
        "relative h-[26px] w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-[160ms] ease-(--ease-out-evo)",
        on ? "bg-lime" : "bg-forest/12",
      )}
    >
      <motion.span
        className="absolute top-[3px] left-[3px] size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
        animate={{ x: on ? 18 : 0 }}
        transition={spring.snappy}
      />
    </button>
  );
}

/* ---------- Onboarding progress dots ---------- */

export function ProgressDots({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <div className="flex items-start gap-1.5" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          className={cn("h-1.5 rounded-[3px]", i < step ? "bg-forest" : "bg-forest/15")}
          initial={false}
          animate={{ width: i === step - 1 ? 28 : 12 }}
          transition={spring.default}
        />
      ))}
    </div>
  );
}

/* ---------- Small helpers ---------- */

export function IconTile({
  icon,
  bg,
  color,
  size = 36,
  iconSize = 18,
  radius = 12,
}: {
  icon: IconName;
  bg: string;
  color: string;
  size?: number;
  iconSize?: number;
  radius?: number;
}) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center", bg, color)}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Icon name={icon} size={iconSize} />
    </div>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex w-full items-end justify-between">
      <p className="type-title-m text-ink">{title}</p>
      {action && (
        <button type="button" onClick={onAction} className="cursor-pointer type-label-s text-lime-deep">
          {action}
        </button>
      )}
    </div>
  );
}

export function FadeIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ease.out, delay }}
    >
      {children}
    </motion.div>
  );
}
