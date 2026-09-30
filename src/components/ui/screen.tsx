"use client";

import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { haptic, spring } from "@/lib/motion";
import { NavRail, Sidebar } from "./app-nav";
import { Backdrop, wideGlows, type Glow, type RaysSpec } from "./backdrop";
import { Icon, type IconName } from "./icons";

type ScreenProps = {
  children: ReactNode;
  glows?: Glow[];
  /** md+ glows in the 1440 design space (see `wideGlows`). */
  wide?: Glow[];
  rays?: RaysSpec;
  dark?: boolean;
  /** Custom background (e.g. Calm space forest gradient). */
  background?: string;
  grain?: number;
  /** Bottom nav on phones; implies the app shell. */
  nav?: boolean;
  /** Tablet rail / desktop sidebar around the page. */
  app?: boolean;
  /** Content manages its own md+ width (Home, chat workspace) instead of the centred column. */
  full?: boolean;
  className?: string;
  /** Painted under the glows, in the 393-wide design space (e.g. the Step booked burst). */
  under?: ReactNode;
  /** Plain 240 ms fade instead of the push spring (safety moments). */
  still?: boolean;
};

/**
 * Screen shell. Full-bleed on every viewport. Phones get the 393 design; tablet and desktop get the
 * nav rail / sidebar (app screens) and a centred column, or a full-width layout when `full`.
 */
export function Screen({ children, glows = [], wide, rays, dark, background, grain = 0.05, nav, app, full, className, under, still }: ScreenProps) {
  const shell = nav || app;
  return (
    <div
      className={cn("no-scrollbar relative isolate flex min-h-dvh w-full flex-col overflow-x-clip", !background && "bg-paper", dark && "text-white")}
      style={background ? { background } : undefined}
    >
      <Backdrop under={under} items={glows} wide={wide ?? (shell ? wideGlows.home : undefined)} rays={rays} grain={grain} grainColor={dark ? "255 255 255" : "0 0 0"} />
      {shell && (
        <>
          <NavRail />
          <Sidebar />
        </>
      )}
      <div className={cn("relative flex flex-1 flex-col", shell && "md:pl-[92px] xl:pl-[264px]")}>
        <motion.main
          className={cn("relative mx-auto flex w-full flex-1 flex-col", !full && (shell ? "md:max-w-[600px]" : "md:max-w-[460px]"), className)}
          initial={still ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={still ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={still ? { duration: 0.24 } : spring.default}
        >
          {children}
        </motion.main>
        {nav && <BottomNav />}
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
    <div className="pointer-events-none sticky bottom-0 z-30 mt-auto flex justify-center md:hidden pb-[max(env(safe-area-inset-bottom),14px)]">
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
