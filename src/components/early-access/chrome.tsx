"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Wordmark } from "@/components/launch/poster";
import { DISCLAIMER } from "@/lib/early-access/content";
import { cn } from "@/lib/cn";

/**
 * Sticky header. The glass bar fades in as the page scrolls; the wordmark settles slightly smaller.
 * Wordmark centred on phones; right-hand mono tag on desktop (and always on the success screen).
 */
export function Header({ right, tagOnMobile }: { right: string; tagOnMobile?: boolean }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const bar = useTransform(scrollY, [0, 80], [0, 1]);
  const scale = useTransform(scrollY, [0, 120], [1, 0.88]);

  return (
    <header className="ea-dimmable sticky top-0 z-30 -mx-5 px-5 py-4 desk:-mx-[max(32px,calc((100vw-1200px)/2))] desk:px-[max(32px,calc((100vw-1200px)/2))] desk:py-5">
      <motion.div aria-hidden className="absolute inset-0 border-b border-white/70 bg-paper/75 backdrop-blur-[14px]" style={{ opacity: reduce ? 0 : bar }} />
      <div className={cn("relative flex items-center", tagOnMobile ? "justify-between" : "justify-center desk:justify-between")}>
        <motion.div style={{ scale: reduce ? 1 : scale, transformOrigin: "left center" }}>
          <Wordmark tone="light" className="desk:text-[24px]" />
        </motion.div>
        <span className={cn("font-mono text-[10px] tracking-[0.14em] text-t3 uppercase desk:text-[11px]", !tagOnMobile && "hidden desk:inline")}>{right}</span>
      </div>
    </header>
  );
}

export function Footer({ className }: { className?: string }) {
  return <p className={cn("type-caption mx-auto max-w-[420px] text-center text-t3 desk:mx-0 desk:text-left", className)}>{DISCLAIMER}</p>;
}
