// Motion tokens from the handoff (section 7b). One source for every animation.
import type { Transition } from "motion/react";

export const spring = {
  snappy: { type: "spring", stiffness: 500, damping: 38 },
  default: { type: "spring", stiffness: 380, damping: 30 },
  gentle: { type: "spring", stiffness: 180, damping: 24 },
} satisfies Record<string, Transition>;

export const ease = {
  outFast: { duration: 0.16, ease: [0.2, 0, 0, 1] },
  out: { duration: 0.24, ease: [0.2, 0, 0, 1] },
} satisfies Record<string, Transition>;

export const STAGGER = 0.04;

/** 4 s in · 2 s hold · 6 s out */
export const breath = { inhale: 4, hold: 2, exhale: 6 } as const;

/** Rise 8 px + fade, staggered 40 ms (reply chips, lists). */
export const riseIn = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...spring.snappy, delay: Math.min(i, 6) * STAGGER },
  }),
};

/** Light haptic on devices that support it (web: Vibration API). */
export function haptic(kind: "selection" | "light" | "success" | "warning" = "light") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  // Browsers only allow vibration after a user gesture.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  const pattern = { selection: 6, light: 10, success: [10, 40, 16], warning: [20, 60, 20] }[kind];
  navigator.vibrate(pattern);
}
