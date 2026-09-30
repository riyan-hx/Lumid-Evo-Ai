"use client";

import { LayoutGroup, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
        {/* CSS entry animation: runs before hydration, so server-rendered pages are visible immediately. */}
        <main
          className={cn(
            "relative mx-auto flex w-full flex-1 flex-col",
            still || nav ? "evo-enter-fade" : "evo-enter",
            !full && (shell ? "md:max-w-[600px]" : "md:max-w-[460px]"),
            className,
          )}
        >
          {children}
        </main>
        {/* The tab bar itself lives in the root layout (TabBar) so it never remounts between tabs. */}
        {nav && <div aria-hidden className="h-[calc(106px+max(env(safe-area-inset-bottom),14px))] shrink-0 md:hidden" />}
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

/** Routes that show the phone tab bar (exact matches — sub-pages like /settings/memory have a back button). */
const TAB_ROUTES = ["/home", "/first-day", "/chats", "/voice", "/settings"];

/**
 * Phone tab bar, mounted once in the root layout. Because it never unmounts, the active pill glides
 * between tabs, and the tap is reflected instantly (optimistic) while the next page loads.
 */
export function TabBar() {
  const path = usePathname();
  const router = useRouter();
  const routeKey = tabs.find((t) => t.match.some((m) => path === m || path.startsWith(`${m}/`)))?.key ?? "home";
  // Optimistic target, valid only until the route actually changes.
  const [pending, setPending] = useState<{ key: string; from: string } | null>(null);
  const waiting = pending && pending.from === path ? pending.key : null;
  const active = waiting ?? routeKey;
  useEffect(() => {
    tabs.forEach((t) => router.prefetch(t.href));
  }, [router]);

  if (!TAB_ROUTES.includes(path)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),14px)] md:hidden">
      <div className="absolute inset-x-0 bottom-0 h-[140px] bg-gradient-to-b from-paper/0 via-paper/95 via-50% to-paper" />
      <LayoutGroup id="tabbar">
        <nav
          className="pointer-events-auto relative flex items-center gap-1.5 rounded-full border-[1.2px] border-dashed border-line-strong bg-white/82 p-1.5 shadow-[0_12px_16px_rgba(15,36,26,0.12)] backdrop-blur-[12px]"
          aria-label="Tabs"
        >
          {tabs.map((t) => {
            const on = t.key === active;
            return (
              <motion.button
                key={t.key}
                type="button"
                layout
                onPointerDown={() => router.prefetch(t.href)}
                onClick={() => {
                  if (t.key === active) return;
                  haptic("selection");
                  setPending({ key: t.key, from: path });
                  router.push(t.href);
                }}
                whileTap={{ scale: 0.94 }}
                transition={spring.snappy}
                aria-current={on ? "page" : undefined}
                aria-label={t.label}
                className={cn(
                  "relative flex cursor-pointer touch-manipulation items-center overflow-hidden rounded-full bg-muted p-1",
                  on ? "gap-3.5 pr-[22px]" : "w-[60px]",
                )}
              >
                <span className="relative flex size-[52px] shrink-0 items-center justify-center rounded-full">
                  {on && <motion.span layoutId="nav-dot" className="absolute inset-0 rounded-full bg-forest" transition={spring.snappy} />}
                  <span className={cn("relative transition-colors duration-150", on ? "text-white" : "text-t1")}>
                    <Icon name={t.icon} size={22} />
                  </span>
                </span>
                {on && (
                  <motion.span
                    className="type-label-m whitespace-nowrap text-t1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.14 }}
                  >
                    {t.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </LayoutGroup>
    </div>
  );
}
