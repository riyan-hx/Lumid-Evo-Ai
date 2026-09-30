"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ease, haptic, spring } from "@/lib/motion";
import { Icon, type IconName } from "./icons";

type Variant = "forest" | "lime" | "glass";

type PillProps = {
  label: ReactNode;
  variant?: Variant;
  icon?: IconName | null;
  /** Height in px. Figma uses 58 for primary CTAs, 36–42 inline. */
  height?: number;
  href?: string;
  /** Cross-fade label → check for 400 ms before navigating (primary CTA success). */
  confirm?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  type?: "button" | "submit";
};

const skins: Record<Variant, { bg: string; text: string; inset: string; shadow: string }> = {
  forest: {
    bg: "var(--gradient-forest)",
    text: "text-white",
    inset: "inset 0 1px 0 rgba(255,255,255,0.14)",
    shadow: "0 14px 14px rgba(20,26,18,0.28)",
  },
  lime: {
    bg: "var(--gradient-lime)",
    text: "text-forest",
    inset: "inset 0 1px 0 rgba(255,255,255,0.45)",
    shadow: "0 14px 14px rgba(97,191,59,0.4)",
  },
  glass: {
    bg: "rgba(255,255,255,0.72)",
    text: "text-ink",
    inset: "none",
    shadow: "0 8px 12px rgba(26,51,20,0.08)",
  },
};

export function Pill({
  label,
  variant = "forest",
  icon = "arrow-right",
  height = 58,
  href,
  confirm,
  disabled,
  className,
  style,
  onClick,
  type = "button",
}: PillProps) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const skin = skins[variant];

  // Warm the next route so the tap feels instant.
  useEffect(() => {
    if (href) router.prefetch(href);
  }, [href, router]);

  const handle = () => {
    if (disabled || done) return;
    onClick?.();
    if (confirm) {
      haptic("light");
      setDone(true);
      setTimeout(() => href && router.push(href), 260);
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handle}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={spring.snappy}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-full px-7 type-label-m whitespace-nowrap transition-opacity duration-200 disabled:cursor-default",
        skin.text,
        variant === "glass" && "border border-white backdrop-blur-[10px]",
        disabled && "opacity-35",
        className,
      )}
      style={{ height, background: skin.bg, boxShadow: skin.inset === "none" ? skin.shadow : `${skin.inset}, ${skin.shadow}`, ...style }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {done ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring.snappy}
            className="flex"
          >
            <Icon name="check" size={20} />
          </motion.span>
        ) : (
          <motion.span key="label" exit={{ opacity: 0 }} transition={ease.outFast} className="flex items-center gap-2.5">
            {label}
            {icon && <Icon name={icon} size={18} />}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
