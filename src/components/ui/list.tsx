"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icons";

export function GroupLabel({ children }: { children: ReactNode }) {
  return <p className="type-label-s text-t3">{children}</p>;
}

export function Group({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass flex w-full flex-col rounded-[22px] px-3.5", className)}>{children}</div>;
}

/** Settings-style row: 32 px tile, title, value, chevron. */
export function Row({
  icon,
  tile,
  color,
  title,
  value,
  danger,
  last,
  onClick,
  iconRotate,
}: {
  icon: IconName;
  tile: string;
  color: string;
  title: string;
  value?: string;
  danger?: boolean;
  last?: boolean;
  onClick?: () => void;
  iconRotate?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={cn("flex w-full cursor-pointer items-center gap-3 py-[9px] text-left", !last && "border-b border-line")}
    >
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[10.67px]", tile, color)}>
        <Icon name={icon} size={16} style={iconRotate ? { transform: `rotate(${iconRotate}deg)` } : undefined} />
      </span>
      <span className={cn("flex-1 type-label-m", danger ? "text-t-danger" : "text-ink")}>{title}</span>
      {value && <span className="type-caption whitespace-nowrap text-t3">{value}</span>}
      <Icon name="chevron-right" size={16} className="text-t3" />
    </motion.button>
  );
}

export function PlusBadge() {
  return (
    <span
      className="flex items-center gap-1 rounded-full py-1 pr-2.5 pl-2 type-label-s text-forest"
      style={{ background: "linear-gradient(159deg, #a3e27d 0%, #62bf3b 71.43%)" }}
    >
      <Icon name="sparkle" size={12} />
      PLUS
    </span>
  );
}
