import { Wordmark } from "@/components/launch/poster";
import { DISCLAIMER } from "@/lib/early-access/content";
import { cn } from "@/lib/cn";

/** Wordmark centred on phones for the pick step; right-hand mono tag on desktop (and always on the confirm step). */
export function Header({ right, tagOnMobile }: { right: string; tagOnMobile?: boolean }) {
  return (
    <header className={cn("flex items-center", tagOnMobile ? "justify-between" : "justify-center desk:justify-between")}>
      <Wordmark tone="night" className="desk:text-[24px]" />
      <span className={cn("font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase desk:text-[11px]", !tagOnMobile && "hidden desk:inline")}>{right}</span>
    </header>
  );
}

export function Footer({ className }: { className?: string }) {
  return <p className={cn("type-caption mx-auto max-w-[420px] text-center text-white/45 desk:mx-0 desk:text-left", className)}>{DISCLAIMER}</p>;
}
