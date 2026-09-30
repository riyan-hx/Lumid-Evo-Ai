"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { useApp } from "@/lib/store";
import { Icon, type IconName } from "./icons";
import { PlusBadge } from "./list";
import { Orb } from "./orb";
import { Pill } from "./pill";

type Item = { label: string; icon: IconName; href: string; match: string[]; plus?: boolean; rail?: boolean };

const items: Item[] = [
  { label: "Home", icon: "home", href: "/home", match: ["/home", "/first-day"], rail: true },
  { label: "Chats", icon: "chat", href: "/chats", match: ["/chats", "/chat"], rail: true },
  { label: "Voice", icon: "mic", href: "/voice", match: ["/voice"], rail: true },
  { label: "Plans", icon: "path", href: "/step-booked", match: ["/step-booked", "/focus"], rail: true },
  { label: "Your wins", icon: "heart", href: "/wins", match: ["/wins"], rail: true },
  { label: "Forecast", icon: "cloud", href: "/insight", match: ["/insight"], plus: true },
];

function useActive() {
  const path = usePathname();
  return items.find((i) => i.match.some((m) => path === m || path.startsWith(`${m}/`) || path.startsWith(`${m}?`)))?.href;
}

/** ⌘K / Ctrl+K opens a quick check-in from anywhere in the app shell. */
function useQuickCheckIn() {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        router.push("/check-in");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

/** Desktop sidebar (≥1280): brand, New check-in, nav, crisis, profile. */
export function Sidebar() {
  const active = useActive();
  const { name } = useApp();
  useQuickCheckIn();

  return (
    <nav
      aria-label="Main"
      className="fixed top-4 bottom-4 left-4 z-40 hidden w-[248px] flex-col gap-1.5 overflow-y-auto rounded-3xl border border-white bg-white/70 px-4 pt-5 pb-4 shadow-[0_10px_26px_-8px_rgba(26,64,20,0.07)] backdrop-blur-[16px] no-scrollbar xl:flex"
    >
      <Link href="/home" className="mb-3.5 flex items-center gap-2.5 px-1">
        <Orb size={34} state="breathing" />
        <span className="flex flex-col">
          <span className="type-title-m text-forest">Evo</span>
          <span className="type-caption text-t3">by Lumid AI</span>
        </span>
      </Link>
      <Pill label="New check-in" height={46} className="mb-3.5 w-full" href="/check-in" />

      {items.map((i) => {
        const on = i.href === active;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 type-label-m transition-colors",
              on ? "text-forest" : "text-t2 hover:bg-white/70",
            )}
          >
            {on && <motion.span layoutId="side-dot" className="absolute inset-0 rounded-[14px] bg-lime-soft" transition={spring.default} />}
            <Icon name={i.icon} size={20} className="relative transition-transform duration-200 group-hover:scale-110" />
            <span className="relative flex-1">{i.label}</span>
            {i.plus && (
              <span className="relative">
                <PlusBadge />
              </span>
            )}
          </Link>
        );
      })}

      <div className="flex-1" />
      <Link href="/crisis" className="flex items-center gap-2.5 rounded-[14px] bg-peach-subtle px-3 py-2.5 text-peach-text transition-colors hover:bg-peach-soft">
        <Icon name="lifebuoy" size={18} />
        <span className="type-label-s">Need help now?</span>
      </Link>
      <Link href="/settings" className="mt-1.5 flex items-center gap-2.5 rounded-2xl bg-lime-wash p-2 transition-colors hover:bg-lime-soft">
        <span className="flex size-[34px] items-center justify-center rounded-full bg-forest type-label-m text-white">{name.charAt(0)}</span>
        <span className="flex flex-1 flex-col">
          <span className="type-label-m text-ink">{name}</span>
          <span className="type-caption text-t3">Evo Plus</span>
        </span>
        <Icon name="more" size={18} className="text-t3" />
      </Link>
    </nav>
  );
}

/** Tablet nav rail (768–1279). */
export function NavRail() {
  const active = useActive();
  const { name } = useApp();
  useQuickCheckIn();

  return (
    <nav
      aria-label="Main"
      className="fixed top-4 bottom-4 left-4 z-40 hidden w-[76px] flex-col items-center gap-3 rounded-3xl border border-white bg-white/70 py-5 shadow-[0_10px_26px_-8px_rgba(26,64,20,0.07)] backdrop-blur-[16px] md:flex xl:hidden"
    >
      <Link href="/home" aria-label="Evo" className="mb-6">
        <Orb size={40} state="breathing" />
      </Link>
      {items
        .filter((i) => i.rail)
        .map((i) => {
          const on = i.href === active;
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-label={i.label}
              title={i.label}
              aria-current={on ? "page" : undefined}
              className={cn(
                "relative flex size-[52px] items-center justify-center rounded-[18px] transition-colors",
                on ? "text-white" : "text-t1 hover:bg-white/80",
              )}
            >
              {on && (
                <motion.span
                  layoutId="rail-dot"
                  className="absolute inset-0 rounded-[18px] shadow-[0_10px_20px_-8px_rgba(20,26,18,0.35)]"
                  style={{ background: "var(--gradient-forest)" }}
                  transition={spring.default}
                />
              )}
              <Icon name={i.icon} size={22} className="relative" />
            </Link>
          );
        })}
      <div className="flex-1" />
      <Link href="/crisis" aria-label="Need help now?" className="flex size-12 items-center justify-center rounded-2xl bg-peach-subtle text-peach-text">
        <Icon name="lifebuoy" size={20} />
      </Link>
      <Link href="/settings" aria-label="Settings" className="flex size-10 items-center justify-center rounded-full bg-forest type-label-m text-white">
        {name.charAt(0)}
      </Link>
    </nav>
  );
}
