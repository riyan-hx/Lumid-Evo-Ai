"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { haptic, spring } from "@/lib/motion";

/**
 * Bottom sheet: handle, scrim 45% forest, drag down (>30% or flick) to dismiss, Esc closes.
 * Becomes a centred modal (max 480) on tablet/desktop.
 */
export function Sheet({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  const drag = useDragControls();
  const panel = useRef<HTMLDivElement>(null);
  const crossed = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal aria-label={label}>
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-default bg-[rgba(21,26,19,0.35)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            className="relative flex max-h-[88dvh] w-full max-w-[480px] flex-col gap-3.5 overflow-y-auto rounded-t-[32px] bg-paper px-5 pt-2.5 pb-[max(24px,env(safe-area-inset-bottom))] md:rounded-[32px]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring.gentle}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDrag={(_, info) => {
              const h = panel.current?.offsetHeight ?? 600;
              const past = info.offset.y > h * 0.3;
              if (past !== crossed.current) {
                crossed.current = past;
                if (past) haptic("light");
              }
            }}
            onDragEnd={(_, info) => {
              const h = panel.current?.offsetHeight ?? 600;
              crossed.current = false;
              if (info.offset.y > h * 0.3 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="flex cursor-grab touch-none justify-center pb-1 active:cursor-grabbing" onPointerDown={(e) => drag.start(e)}>
              <span className="h-[5px] w-10 rounded-[3px] bg-muted" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
