"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatHeader, EvoText, UserBubble } from "@/components/evo/chat-bits";
import { Composer } from "@/components/evo/composer";
import { InsightCard } from "@/components/evo/insight-card";
import { TopWash, glows } from "@/components/ui/backdrop";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { haptic } from "@/lib/motion";
import { insight } from "@/lib/mock";
import { useApp } from "@/lib/store";


/** 04 · Evo Insight — the focused insight moment, entered from Home “Tell me more”. */
export default function InsightScreen() {
  const router = useRouter();
  const { name } = useApp();
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [saved, setSaved] = useState(false);
  const [option, setOption] = useState("Make a plan");

  const pick = (o: string) => {
    setOption(o);
    setTimeout(() => router.push(o === "Breathe 1 min" ? "/calm" : o === "Just vent" ? "/chat?checkedIn=1" : "/chat?checkedIn=1"), 350);
  };

  return (
    <Screen glows={glows.wash} under={<TopWash />}>
      <div className="relative flex flex-1 flex-col pt-[54px]">
        <ChatHeader subtitle="Exam stress" status={false} />
        <div className="flex flex-col px-6">
          <EvoText text={`Here’s what I’m noticing, ${name}.`} className="mt-7" />
          <div className="mt-[18px]">
            <InsightCard
              insight={insight}
              variant="focus"
              confirmed={answer === "yes"}
              saved={saved}
              onSave={() => {
                haptic("success");
                setSaved((s) => !s);
              }}
            />
          </div>
          <p className="mt-2 type-label-m text-ink">Does this feel right?</p>
          {answer === "no" ? (
            <div className="mt-3 flex flex-col gap-3">
              <UserBubble>Not quite</UserBubble>
              <EvoText text="Thanks for telling me. Let’s look at it together in chat." />
              <Pill label="Open chat" height={48} className="self-start" href="/chat?checkedIn=1" />
            </div>
          ) : (
            <>
              <div className="mt-3 flex gap-2.5">
                <Pill
                  label="Yes, that’s me"
                  icon={null}
                  height={48}
                  onClick={() => {
                    haptic("success");
                    setAnswer("yes");
                  }}
                />
                <Pill label="Not quite" variant="glass" icon={null} height={48} onClick={() => setAnswer("no")} />
              </div>
              <p className="mt-6 type-body-l text-ink">Want me to turn this into a small plan?</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {["Make a plan", "Just vent", "Breathe 1 min"].map((o) => (
                  <SoftChip key={o} label={o} selected={option === o} onClick={() => pick(o)} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="sticky bottom-0 mt-auto px-5 pt-6 pb-[30px]">
          <Composer href="/chat?checkedIn=1" />
        </div>
      </div>
    </Screen>
  );
}
