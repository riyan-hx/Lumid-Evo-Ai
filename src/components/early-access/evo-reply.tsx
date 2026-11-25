"use client";

import { motion, useDragControls, useIsPresent, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { excuses } from "@/lib/early-access/content";
import { cn } from "@/lib/cn";
import { EASE_OUT, spring } from "@/lib/motion";
import { Magnetic } from "./magnetic";

type Choice = (typeof excuses)[number];

const DESK = "(min-width: 75rem)";
/** True on ≥1200 px (popover layout). False during SSR — the reply only ever renders after a click. */
export function useIsDesk() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(DESK);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESK).matches,
    () => false,
  );
}

/** Types 2 characters every 22 ms (≈1.5 s for the longest step). Full text immediately for reduced motion. */
function useTyped(text: string) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setN((c) => (c >= text.length ? c : c + 2)), 22);
    return () => clearInterval(t);
  }, [reduce, text.length]);
  return reduce ? text : text.slice(0, n);
}

type BodyProps = { choice: Choice; onClose: () => void; onUse: () => void; onAnother: () => void; layout: "sheet" | "popover" };

/** The black Evo card: cause tag, the one small step (typed), CTA that hands off to the email field. */
function ReplyBody({ choice, onClose, onUse, onAnother, layout }: BodyProps) {
  const typed = useTyped(choice.step);
  const cut = choice.step.indexOf(".") + 1;
  const done = typed.length >= choice.step.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 pr-1">
        <Orb size={30} state="thinking" />
        <span className="type-label-m text-white">Evo</span>
        <span className="ml-auto truncate rounded-full bg-white/12 px-2.5 py-1 type-caption text-[#c9eeb0]">Maybe: {choice.cause}</span>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <p className="type-body-s text-white/70 desk:text-[14px] desk:leading-5">You’re not lazy. Starting just feels heavy right now. Here’s one small step:</p>
      <p aria-hidden className="min-h-[56px] text-[22px] leading-7 font-medium tracking-[-0.02em] text-white desk:min-h-[60px] desk:text-[26px] desk:leading-8">
        <span className="text-[#a3e27d]">{typed.slice(0, cut)}</span>
        {typed.slice(cut)}
        {!done && <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 animate-pulse bg-white/80" />}
      </p>
      <div className="h-px bg-white/10" />
      <motion.div
        className={cn("flex items-center gap-4", layout === "sheet" ? "flex-col" : "flex-row")}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: done ? 1 : 0.35, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        <Magnetic className={layout === "sheet" ? "w-full" : undefined}>
          <button
            type="button"
            onClick={onUse}
            className={cn("group relative flex h-[54px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-6 type-label-m text-forest active:scale-[0.97]", layout === "sheet" && "w-full")}
            style={{ background: "linear-gradient(180deg,#a3e27d 0%,#62bf3b 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 12px 28px rgba(98,191,59,0.4)", transition: "transform 160ms" }}
          >
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition-[transform,opacity] duration-700 group-hover:translate-x-[320%] group-hover:opacity-100" />
            <span className="relative">Save this step · join early access</span>
            <Icon name="arrow-right" size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Magnetic>
        <button type="button" onClick={onAnother} className="cursor-pointer type-label-s text-white/55 transition-colors hover:text-white">
          {layout === "sheet" ? "Not quite it? Try another line" : "Try another line"}
        </button>
      </motion.div>
    </div>
  );
}

const CARD_BG = "linear-gradient(160deg,#33412e 0%,#151a13 72%)";

type SheetProps = Omit<BodyProps, "layout"> & { sheetRef?: (el: HTMLDivElement | null) => void };

/** Phones: bottom sheet. Drag it down (or tap outside / Esc) to dismiss. */
export function EvoSheet({ choice, onClose, onUse, onAnother, sheetRef }: SheetProps) {
  const reduce = useReducedMotion();
  const drag = useDragControls();
  const ref = useRef<HTMLDivElement | null>(null);
  const present = useIsPresent(); // false while the sheet is animating out

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ pointerEvents: present ? "auto" : "none" }} onPointerDown={onClose} aria-hidden />
      <motion.div
        ref={(el) => {
          ref.current = el;
          sheetRef?.(el);
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Evo’s answer"
        tabIndex={-1}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.7 }}
        onDragEnd={(_, i) => (i.offset.y > 100 || i.velocity.y > 600) && onClose()}
        initial={reduce ? { opacity: 0 } : { y: "115%" }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: "115%", transition: { duration: 0.28, ease: EASE_OUT } }}
        transition={reduce ? { duration: 0.2 } : spring.gentle}
        className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 mx-auto max-w-[480px] rounded-[30px] p-5 pt-3 text-white outline-none shadow-[0_-8px_40px_rgba(20,26,18,0.3)]"
        style={{ background: CARD_BG, touchAction: "none", pointerEvents: present ? "auto" : "none" }}
      >
        <div className="mb-3 flex cursor-grab touch-none justify-center py-2 active:cursor-grabbing" onPointerDown={(e) => drag.start(e)} aria-hidden>
          <span className="h-1 w-9 rounded-full bg-white/25" />
        </div>
        <ReplyBody choice={choice} onClose={onClose} onUse={onUse} onAnother={onAnother} layout="sheet" />
      </motion.div>
    </>
  );
}

/** Desktop: popover attached to the clicked line (rendered inside that line's <li>). */
export function EvoPopover({ choice, onClose, onUse, onAnother }: Omit<BodyProps, "layout">) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <motion.div
      role="region"
      aria-label="Evo’s answer"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14 } }}
      transition={reduce ? { duration: 0.2 } : spring.gentle}
      style={{ transformOrigin: "60px 0", background: CARD_BG }}
      className="absolute top-full left-0 z-30 mt-[18px] w-[min(520px,100%)] rounded-[26px] p-6 text-white shadow-[0_24px_48px_rgba(20,26,18,0.32)]"
    >
      <span aria-hidden className="absolute -top-[7px] left-[72px] size-[18px] rotate-45 rounded-[4px] bg-[#33412e]" />
      <ReplyBody choice={choice} onClose={onClose} onUse={onUse} onAnother={onAnother} layout="popover" />
    </motion.div>
  );
}

