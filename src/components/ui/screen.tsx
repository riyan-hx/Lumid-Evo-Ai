"use client";

import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";
import { Backdrop, type Glow, type RaysSpec } from "./backdrop";
import { Icon, type IconName } from "./icons";

type ScreenProps = {
  children: ReactNode;
  glows?: Glow[];
  rays?: RaysSpec;
  dark?: boolean;
  /** Custom background (e.g. Calm space forest gradient). */
  background?: string;
  grain?: number;
  nav?: boolean;
  className?: string;
  /** Painted under the glows, in the 393-wide design space (e.g. the Step booked burst). */
  under?: ReactNode;
  /** Plain 240 ms fade instead of the push spring (safety moments). */
  still?: boolean;
};

/**
 * Mobile screen shell. Full-bleed on phones; on larger viewports it is shown as the
 * 393 × 852 Figma frame (rounded 44, soft shadow) with its own scroll.
 */
export function Screen({ children, glows = [], rays, dark, background, grain = 0.05, nav, className, under, still }: ScreenProps) {
  return (
    <div className="min-h-dvh md:flex md:items-center md:justify-center md:py-10">
      <div
        className={cn(
          "no-scrollbar relative isolate flex min-h-dvh w-full flex-col overflow-x-clip",
          "md:h-[min(852px,calc(100dvh-40px))] md:min-h-0 md:w-[393px] md:overflow-y-auto md:rounded-[44px] md:shadow-[0_30px_60px_-20px_rgba(26,46,20,0.12)]",
          !background && "bg-paper",
          dark && "text-white",
        )}
        style={background ? { background } : undefined}
      >
        <div className="relative flex min-h-full flex-1 flex-col">
          <Backdrop under={under} items={glows} rays={rays} grain={grain} grainColor={dark ? "255 255 255" : "0 0 0"} />
          <motion.main
            className={cn("relative flex flex-1 flex-col", className)}
            initial={still ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={still ? { opacity: 1 } : { opacity: 1, x: 0 }}
            transition={still ? { duration: 0.24 } : spring.default}
          >
            {children}
          </motion.main>
          {nav && <BottomNav />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Bottom nav (floating pill) ---------- */

const tabs: { key: string; label: string; icon: IconName; href: string; match: string[] }[] = [
  { key: "home", label: "Home", icon: "home", href: "/home", match: ["/home", "/first-day"] },
  { key: "chat", label: "Chat", icon: "chat", href: "/chats", match: ["/chats"] },
  { key: "voice", label: "Voice", icon: "voice", href: "/voice", match: ["/voice"] },
  { key: "settings", label: "Settings", icon: "settings", href: "/settings", match: ["/settings"] },
];

export function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const active = tabs.find((t) => t.match.some((m) => path.startsWith(m)))?.key ?? "home";

  return (
    <div className="pointer-events-none sticky bottom-0 z-30 mt-auto flex justify-center pb-[max(env(safe-area-inset-bottom),14px)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[140px] bg-gradient-to-b from-paper/0 via-paper/95 via-50% to-paper" />
      <nav
        className="pointer-events-auto relative flex items-center gap-1.5 rounded-full border-[1.2px] border-dashed border-line-strong bg-white/82 p-1.5 backdrop-blur-[12px] drop-shadow-[0_12px_16px_rgba(15,36,26,0.12)]"
        aria-label="Main"
      >
        {tabs.map((t) => {
          const on = t.key === active;
          return (
            <motion.button
              key={t.key}
              type="button"
              layout
              onClick={() => {
                if (on) return;
                haptic("selection");
                router.push(t.href);
              }}
              whileTap={{ scale: 0.94 }}
              transition={spring.default}
              aria-current={on ? "page" : undefined}
              aria-label={t.label}
              className={cn(
                "relative flex cursor-pointer items-center overflow-hidden rounded-full bg-muted p-1",
                on ? "gap-3.5 pr-[22px]" : "w-[60px]",
              )}
            >
              <span className="relative flex size-[52px] shrink-0 items-center justify-center rounded-full">
                {on && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute inset-0 rounded-full bg-forest"
                    transition={spring.default}
                  />
                )}
                <motion.span
                  className={cn("relative", on ? "text-white" : "text-t1")}
                  initial={false}
                  animate={{ scale: on ? [0.9, 1] : 1 }}
                  transition={spring.default}
                >
                  <Icon name={t.icon} size={22} />
                </motion.span>
              </span>
              {on && (
                <motion.span
                  className="type-label-m whitespace-nowrap text-t1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.06, duration: 0.16 }}
                >
                  {t.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
