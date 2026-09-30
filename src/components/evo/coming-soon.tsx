"use client";

import { glows } from "@/components/ui/backdrop";
import { BackButton } from "@/components/ui/controls";
import { PlusBadge } from "@/components/ui/list";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";

/** Placeholder for P1/P2 screens so every nav target resolves. */
export function ComingSoon({ title, body, plus, nav, cta }: { title: string; body: string; plus?: boolean; nav?: boolean; cta?: string }) {
  return (
    <Screen glows={glows.checkIn} nav={nav} app>
      <div className="flex flex-1 flex-col px-6 pt-[54px]">
        {!nav && <BackButton />}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-10 text-center">
          <Orb size={180} state="breathing" />
          {plus && <PlusBadge />}
          <h1 className="type-screen-title text-forest">{title}</h1>
          <p className="max-w-[300px] type-body-m text-t2">{body}</p>
          {cta && <Pill label={cta} className="mt-2" href="/home" />}
        </div>
      </div>
    </Screen>
  );
}
