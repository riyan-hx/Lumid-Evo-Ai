"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatHeader, UserBubble } from "@/components/evo/chat-bits";
import { Composer } from "@/components/evo/composer";
import { TopWash, glows } from "@/components/ui/backdrop";
import { Icon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { cn } from "@/lib/cn";
import { useApp } from "@/lib/store";

/**
 * 30 · Safety moment. Rendered by the app (not model text), so it can’t be hallucinated away.
 * No playful motion: plain fade, orb still. Plans and nudges pause.
 */
export function SafetyMoment({ message }: { message: string }) {
  const router = useRouter();
  const { name, update } = useApp();
  const [unsure, setUnsure] = useState(false);

  useEffect(() => {
    // Nudges stay off for 24 h after a safety moment (handoff §10).
    update({ safetyPauseUntil: Date.now() + 24 * 60 * 60 * 1000 });
  }, [update]);

  const options = [
    { label: "I’m safe — just really low", onClick: () => router.push("/chat?mode=venting") },
    { label: "I’m not sure", onClick: () => setUnsure(true) },
    { label: "I might hurt myself", danger: true, onClick: () => router.push("/crisis") },
  ];

  return (
    <Screen still glows={glows.wash} under={<TopWash />}>
      <div className="flex flex-1 flex-col pt-[54px]">
        <ChatHeader subtitle="With you" status={false} still />
        <div className="mt-[22px] flex flex-col gap-3.5 px-6">
          <UserBubble still>{message}</UserBubble>
          <p className="type-body-l text-t1">
            I’m really glad you told me, {name}. That sounds heavy. Before anything else — are you safe right now?
          </p>
          <div className="flex flex-col gap-2">
            {options.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={o.onClick}
                className={cn(
                  "flex h-12 w-full cursor-pointer items-center rounded-2xl border px-4 text-left transition-colors",
                  o.danger ? "border-danger-subtle bg-danger-subtle text-t-danger" : "border-line bg-surface text-t1",
                )}
              >
                <span className="flex-1 type-label-m">{o.label}</span>
                <Icon name="chevron-right" size={16} className={o.danger ? "text-t-danger" : "text-t3"} />
              </button>
            ))}
          </div>

          {unsure && (
            <div className="flex flex-col gap-2">
              <p className="type-body-l text-t1">That’s okay. You don’t have to be sure. Let’s stay together for a moment.</p>
              <button
                type="button"
                onClick={() => router.push("/calm")}
                className="flex h-12 w-full cursor-pointer items-center rounded-2xl border border-line bg-surface px-4 text-left"
              >
                <span className="flex-1 type-label-m text-t1">Breathe with Evo — 1 min</span>
                <Icon name="chevron-right" size={16} className="text-t3" />
              </button>
            </div>
          )}

          <div className="flex w-full flex-col gap-2.5 rounded-3xl border border-peach-soft bg-peach-subtle p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="type-label-s text-peach-text">Tele-MANAS · free, 24×7</span>
                <span className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-ink">14416</span>
              </div>
              <a href="tel:14416" className="flex h-11 items-center rounded-full bg-forest px-[18px] type-label-m text-white">
                Call
              </a>
            </div>
            <a href="tel:112" className="type-label-m text-t-danger">
              In immediate danger? Call 112
            </a>
          </div>

          <p className="flex items-center gap-1.5 type-caption text-t3">
            <Icon name="pause" size={14} />
            Plans and nudges are paused. Evo will stay with you.
          </p>
        </div>

        <div className="sticky bottom-0 mt-auto px-5 pt-6 pb-[30px]">
          <Composer onSend={(t) => router.push(`/chat?mode=venting&q=${encodeURIComponent(t)}`)} />
        </div>
      </div>
    </Screen>
  );
}
