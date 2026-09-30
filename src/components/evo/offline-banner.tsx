"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icons";
import { spring } from "@/lib/motion";

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

/** Slides down with spring/snappy; hides itself when back online. */
export function OfflineBanner({ forceShow }: { forceShow?: boolean }) {
  const online = useOnline();
  return (
    <AnimatePresence>
      {(forceShow || !online) && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={spring.snappy}
          role="status"
          className="flex w-full items-center gap-2.5 rounded-[14px] bg-sun-subtle px-3.5 py-2.5 text-sun-text"
        >
          <Icon name="cloud" size={16} />
          <span className="flex-1 type-label-s">You’re offline. Messages send when you’re back.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
